import { startEmailJobConsumer } from "../../kafka/consumers/emailDelivery/emailJobConsumer";
import {queueWeeklyEmails} from "./scheduler/QueueWeeklyEmails";
import {startEmailRenderConsumer} from "../../kafka/consumers/emailDelivery/emailRenderConsumer";
import {startEmailSendConsumer} from "../../kafka/consumers/emailDelivery/emailSendConsumer";

export async function runEmailDelivery(){
    await startEmailJobConsumer();
    await startEmailRenderConsumer();
    await startEmailSendConsumer();

    await queueWeeklyEmails();
    console.log("Email delivery pipeline started.");

}