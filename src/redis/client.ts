import {createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

export const redis = createClient({
    password: process.env.REDIS_PWD,
    username: process.env.REDIS_USERNAME,
    socket: {
        host: process.env.REDIS_SOCKET_HOST,
        port: Number(process.env.REDIS_SOCKET_PORT),
    }
});

redis.on("error", (err) => { console.error("Redis error", err) });

export async function connectRedis(){
    await redis.connect();
    console.log("Redis Connected");
}