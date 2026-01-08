import { Kafka } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

const brokers = [process.env.KAFKA_BROKERS || "localhost:9092"];
export const kafka = new Kafka({
    clientId: "dealflow",
    brokers
});

export const producer = kafka.producer();

export const userConsumer = kafka.consumer({ groupId: "user-ingestion-group" });
export const dealConsumer = kafka.consumer({ groupId: "deal-ingestion-group" });

export const emailJobConsumer = kafka.consumer({ groupId: "email-job-group" });
export const emailRenderConsumer = kafka.consumer({ groupId: "email-render-group" });
export const emailSendConsumer = kafka.consumer({ groupId: "email-send-group" });
