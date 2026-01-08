import { redis } from "../../../redis/client";
import { emailJobConsumer } from "../../client";
import { supabase } from "../../../db/db";
import { User } from "../../../entities/models";
import { publishRenderJob } from "../../producers/emailDelivery/emailRenderProducer";

export async function startEmailJobConsumer() {
    await emailJobConsumer.connect();
    await emailJobConsumer.subscribe({ topic: process.env.KAFKA_TOPIC_EMAIL_JOB!, fromBeginning: false });

    await emailJobConsumer.run({
        eachMessage: async ({ message }) => {
            const email = message.value!.toString();

            const userKey = `user:${email}`;
            let user: User | null = null;

            const cachedUser = await redis.get(userKey);
            if (cachedUser) {
                user = JSON.parse(cachedUser) as User;
            } else {
                const { data: users } = await supabase
                    .from("users")
                    .select("*")
                    .eq("email", email);

                if (!users || users.length === 0) return;

                user = users[0] as User;
                await redis.set(userKey, JSON.stringify(user), { EX: 3600 });
            }

            if (!user?.preferred_retailers?.length) return;

            const retailerIds: string[] = [];
            const missingRetailers: string[] = [];

            for (const name of user.preferred_retailers) {
                const cached = await redis.get(`retailer:${name}`);
                if (cached) {
                    retailerIds.push(cached);
                } else {
                    missingRetailers.push(name);
                }
            }

            if (missingRetailers.length > 0) {
                const { data } = await supabase
                    .from("retailers")
                    .select("id, name")
                    .in("name", missingRetailers);

                if (!data) return;

                for (const r of data) {
                    await redis.set(`retailer:${r.name}`, r.id, { EX: 3600 });
                    retailerIds.push(r.id);
                }
            }

            if (retailerIds.length === 0) return;

            const deals: any[] = [];
            const missingDeals: { retailer_id: string; product_id: string; start_date: string }[] = [];

            const startDate = new Date().toISOString().slice(0, 10);

            const { data: products } = await supabase
                .from("products")
                .select("id");

            const productIds = products?.map(p => p.id) ?? [];

            for (const retailerId of retailerIds) {
                for (const productId of productIds) {
                    const key = `deal:${retailerId}:${productId}:${startDate}`;

                    const cached = await redis.get(key);
                    if (cached) {
                        deals.push(JSON.parse(cached));
                    } else {
                        missingDeals.push({ retailer_id: retailerId, product_id: productId, start_date: startDate });
                    }
                }
            }

            if (missingDeals.length > 0) {
                const { data } = await supabase
                    .from("deals")
                    .select(`
                        id,
                        price,
                        start_date,
                        end_date,
                        product_id,
                        retailer_id,
                        product:products(name, size),
                        retailer:retailers(name)
                    `)
                    .in("retailer_id", missingDeals.map(d => d.retailer_id))
                    .in("product_id", missingDeals.map(d => d.product_id))
                    .eq("start_date", startDate);

                if (data) {
                    for (const d of data) {
                        const key = `deal:${d.retailer_id}:${d.product_id}:${d.start_date}`;
                        await redis.set(key, JSON.stringify(d), { EX: 300 });
                        deals.push(d);
                    }
                }
            }

            if (deals.length === 0) return;

            const grouped: Record<string, any[]> = {};

            deals.forEach((d: any) => {
                const retailerName = d.retailer.name;
                if (!grouped[retailerName]) grouped[retailerName] = [];

                grouped[retailerName].push({
                    product: d.product.name,
                    size: d.product.size,
                    price: d.price,
                    start_date: d.start_date,
                    end_date: d.end_date
                });
            });

            await publishRenderJob({
                email,
                retailers: Object.entries(grouped).map(([name, deals]) => ({
                    name,
                    deals
                }))
            });

            console.log(`Email job normalized → ${email}`);
        }
    });
}