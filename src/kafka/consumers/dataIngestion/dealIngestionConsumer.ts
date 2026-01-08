import { dealConsumer } from "../../client";
import { supabase } from "../../../db/db";

export async function startDealConsumer() {
    await dealConsumer.connect();
    await dealConsumer.subscribe({ topic: process.env.KAFKA_TOPIC_DEALS!, fromBeginning: false});
    dealConsumer.run({
        eachMessage: async ({ message }) => {
            const deal = JSON.parse(message.value!.toString());

            console.log(`Processing deal: ${deal.retailer} - ${deal.product}`);
            const { error } = await supabase
                .from("deals")
                .upsert(
                    [
                        {
                            retailer_id: deal.retailer_id,
                            product_id: deal.product_id,
                            price: deal.price,
                            start_date: deal.start,
                            end_date: deal.end,
                        },
                    ],
                    { onConflict: "retailer_id,product_id,start_date" }
                );
            if (error) console.error("Failed to insert deal:", error);
        },
    });
}
