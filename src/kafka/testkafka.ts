import { Kafka, EachMessagePayload } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'test-group' });

const runTest = async () => {
    // 先啟動 consumer
    await consumer.connect();
    await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });

    let messageReceived = false;

    const consumerRunPromise = consumer.run({
        eachMessage: async ({ message }: EachMessagePayload) => {
            console.log({ value: message.value?.toString() });
            messageReceived = true;
        },
    });

    // 發送一條訊息
    await producer.connect();
    await producer.send({
        topic: 'test-topic',
        messages: [{ value: 'Hello KafkaJS user!' }],
    });
    await producer.disconnect();

    // 等待 consumer 收到訊息
    while (!messageReceived) {
        await new Promise(res => setTimeout(res, 100));
    }

    await consumer.disconnect();
    console.log('Test completed.');
};

runTest().catch(console.error);
