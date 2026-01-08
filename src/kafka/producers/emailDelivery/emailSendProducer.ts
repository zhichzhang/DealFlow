import { producer } from "../../client";

export async function publishSendJob(payload: any) {
    await producer.connect();
    await producer.send({
        topic: process.env.KAFKA_TOPIC_EMAIL_SEND!,
        messages: [{ value: JSON.stringify(payload) }]
    });
}