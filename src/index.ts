import { connectRedis } from "./redis/client";
import { runDataIngestion } from "./pipeline/dataIngestion";
import { runEmailDelivery } from "./pipeline/emailDelivery";

export async function runDealFlow() {
    await connectRedis();
    await runDataIngestion();
    await runEmailDelivery();
    console.log("System started!");
}