import { producer } from "../../client";
import { User } from "../../../entities/models";

export async function publishUser(user: User) {
    await producer.connect();
    await producer.send({
        topic: process.env.KAFKA_TOPIC_USERS!,
        messages: [{ value: JSON.stringify(user) }]
    });
}