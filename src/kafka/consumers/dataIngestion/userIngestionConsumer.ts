import { userConsumer } from "../../client";
import { supabase } from "../../../db/db";

export async function startUserConsumer() {
    await userConsumer.connect();
    await userConsumer.subscribe({ topic: "users", fromBeginning: false });

    userConsumer.run({
        eachMessage: async ({ message }) => {
            const user = JSON.parse(message.value!.toString());

            const { data: isExisting } = await supabase
                .from("users")
                .select("id")
                .eq("email", user.email)
                .maybeSingle();

            if (isExisting) {
                console.log(`User already exists, skipping: ${user.email}`);
                return;
            }

            const { error } = await supabase
                .from("users")
                .upsert(
                    {
                        name: user.name,
                        email: user.email,
                        preferred_retailers: user.preferred_retailers
                    },
                    { onConflict: "email" }
                );

            if (error) {
                console.error("Failed to upsert user:", error);
            } else {
                console.log(`User saved: ${user.email}`);
            }
        }
    });
}