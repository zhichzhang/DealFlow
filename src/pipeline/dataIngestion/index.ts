import { DataIngestionEngine } from "./engine/DataIngestionEngine";
import { JSONDealAdapter } from "./adapters/JSONDealAdapter";
import { DealJSONIngestionHandler } from "./handlers/DealJSONIngestionHandler";
import {UserIngestionHandler} from "./handlers/UserIngestionHandler";
import {JSONUserAdapter} from "./adapters/JSONUserAdapter";
import {startUserConsumer} from "../../kafka/consumers/dataIngestion/userIngestionConsumer";
import {startDealConsumer} from "../../kafka/consumers/dataIngestion/dealIngestionConsumer";

export async function runDataIngestion() {

    await startUserConsumer();
    await startDealConsumer();
    const engine = new DataIngestionEngine();

    // User ingestion
    const userAdapter = new JSONUserAdapter("src/assets/data/test-user-data.json");
    const userHandler = new UserIngestionHandler();
    await engine.ingest(userAdapter, userHandler);

    // Deal ingestion
    const dealAdapter = new JSONDealAdapter("src/assets/data/sample-deal-data.json");
    const dealHandler = new DealJSONIngestionHandler();
    await engine.ingest(dealAdapter, dealHandler);

    console.log("Ingestion completed.");

}


// runIngestion().catch(err => {
//     console.error("Fatal ingestion error:", err);
// });
