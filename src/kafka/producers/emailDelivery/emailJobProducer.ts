import {producer} from "../../client";

export async function publishEmailJob(email: string) {
    await producer.connect();
    await producer.send({
        topic: process.env.KAFKA_TOPIC_EMAIL_JOB!,
        messages: [{ value: email }]
    });
}
