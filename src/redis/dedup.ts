import {  redis } from "./client"

export async function isDuplicate(key: string): Promise<boolean> {
    const exists = await redis.get(key);
    if (exists) {
        return true;
    }
    await redis.set(key, "1", {EX: 3600});
    return false;
}
