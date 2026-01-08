import { User } from '../../../entities/models';
import {isDuplicate} from "../../../redis/dedup";
import {publishUser} from "../../../kafka/producers/dataIngestion/userIngestionProducer";

export class UserIngestionHandler {
    async handle(user: User) {
        try {
            const key = `user:${user.email}`;
            if (await isDuplicate(key)) {
                console.log(`Duplicate user skipped: ${user.email}`);
                return;
            }

            await publishUser(user);
            console.log(`User published to Kafka: ${user.email}`);
        } catch (err) {
            console.error("Failed to ingest user:", err);
        }
    }
}

