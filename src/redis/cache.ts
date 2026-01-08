import { redis } from './client';

export async function cacheWeeklyDeals(
    userId: string,
    fetchFn: () => Promise<any>
) {
    const key = `weekly:${userId}`;
    const cached = await redis.get(key);
    if (cached) {
        return JSON.parse(cached);
    }
    const data = await fetchFn();
    await redis.set(key, JSON.stringify(data), {EX: 3600});
    return data;
}