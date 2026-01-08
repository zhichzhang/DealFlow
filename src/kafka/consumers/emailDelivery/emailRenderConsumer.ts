import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import juice from "juice";
import {publishSendJob} from "../../producers/emailDelivery/emailSendProducer";
import { emailRenderConsumer } from "../../client";


interface RenderPayload {
    email: string;
    retailers: { name: string; deals: any[] }[];
}

const TEMPLATE_PATH = path.resolve(
    __dirname,
    "../../../../assets/temp/email-temp/email-temp.html"
);

const CSS_PATH = path.resolve(
    __dirname,
    "../../../../assets/temp/email-temp/index.css"
);


const templateSource = fs.readFileSync(TEMPLATE_PATH, "utf-8");
const cssSource = fs.readFileSync(CSS_PATH, "utf-8");

const template = Handlebars.compile(templateSource);

export async function startEmailRenderConsumer() {
    await emailRenderConsumer.connect();
    await emailRenderConsumer.subscribe({
        topic: process.env.KAFKA_TOPIC_EMAIL_RENDER!,
        fromBeginning: false
    });

    await emailRenderConsumer.run({
        eachMessage: async ({ message }) => {
            const payload = JSON.parse(message.value!.toString()) as RenderPayload;

            // Render HTML
            const rawHtml = template(payload);
            const finalHtml = juice.inlineContent(rawHtml, cssSource);

            // Publish to email.send
            await publishSendJob({
                email: payload.email,
                html: finalHtml,
                text: "Your weekly deals are ready."
            });

            console.log(`Email rendered → ${payload.email}`);
        }
    });
}
