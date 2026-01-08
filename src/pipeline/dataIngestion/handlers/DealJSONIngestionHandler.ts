import { DealJSON } from '../../../entities/models';
import { isDuplicate } from '../../../redis/dedup';
import {publishDeal} from "../../../kafka/producers/dataIngestion/dealIngestionProducer";

export class DealJSONIngestionHandler {
    async handle(dealJSON: DealJSON) {
        try {
            const key = `deal:${dealJSON.retailer}:${dealJSON.product}:${dealJSON.start}`;
            if (await isDuplicate(key)) return;

            await publishDeal(dealJSON);

            console.log(`Deal published to Kafka: ${dealJSON.retailer} - ${dealJSON.product}`);
        } catch (err) {
            console.error('Error publishing deal to Kafka:', err);
        }
    }
}