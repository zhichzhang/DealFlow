import {supabase} from "../../../db/db";
import {redis} from "../../../redis/client";
import {publishEmailJob} from "../../../kafka/producers/emailDelivery/emailJobProducer";

export async function queueWeeklyEmails() {
    const { data: users } = await supabase.from("users").select("*");
    if (!users) return;

    await Promise.all(
        users.map(async (user) => {
            if (!user.preferred_retailers?.length) return;

            const key = `emailQueued:${user.email}`;
            if (await redis.get(key)) return;

            await publishEmailJob(user.email);
            await redis.set(key, "1", { EX: 3600 * 24 }); // 24h dedup
        })
    );

    console.log("Queued all weekly email jobs");
}
