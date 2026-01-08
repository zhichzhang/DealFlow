import { producer } from "../../client";

export async function publishRenderJob(payload: any) {
    await producer.connect();
    await producer.send({
        topic: process.env.KAFKA_TOPIC_EMAIL_RENDER!,
        messages: [{ value: JSON.stringify(payload) }]
    });
}