import os
import redis.asyncio as redis


def Get_redis_client():
    pool = redis.ConnectionPool.from_url(os.environ.get("REDIS_URL", "redis://localhost:6379/0"))
    return redis.Redis(connection_pool=pool)