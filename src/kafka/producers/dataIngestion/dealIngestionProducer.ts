import { producer } from "../../client";
import {DealJSON} from "../../../entities/models";

export async function publishDeal(deal: DealJSON) {
    await producer.connect();
    await producer.send({
        topic: process.env.KAFKA_TOPIC_DEALS!,
        messages: [{ value: JSON.stringify(deal) }],
    });
    console.log(`Published deal: ${deal.retailer} - ${deal.product}`);
}
