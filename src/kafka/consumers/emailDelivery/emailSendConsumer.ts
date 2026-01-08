
import { Resend } from "resend";
import { emailSendConsumer } from "../../client";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function startEmailSendConsumer() {
    await emailSendConsumer.connect();
    await emailSendConsumer.subscribe({ topic: process.env.KAFKA_TOPIC_EMAIL_SEND!, fromBeginning: false });

    await emailSendConsumer.run({
        eachMessage: async ({ message }) => {
            const { email, html, text } = JSON.parse(message.value!.toString());

            try {
                await resend.emails.send({
                    from: "onboarding@resend.dev",
                    to: email,
                    subject: "Your Weekly Deals",
                    html,
                    text
                });

                console.log(`Email sent → ${email}`);
            } catch (err) {
                console.error(`Failed to send email → ${email}`, err);
            }
        }
    });
}