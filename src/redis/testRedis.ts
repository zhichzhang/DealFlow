const { connectRedis, redis } = require('./client');

export async function testRedis() {
    try {
        await connectRedis();
        console.log("Redis testRedis");
        await redis.set("test-key", "Hello Redis");
        const val = await redis.get("test-key");
        console.log(val);
        await redis.quit();
        console.log("Redis testRedis quit");
    }catch(err){
        console.error("Redis error", err)
    }
}

testRedis();