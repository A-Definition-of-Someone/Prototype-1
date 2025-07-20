import redis.asyncio as redis

pool = redis.ConnectionPool.from_url("redis://localhost:6379/0")
redis_client = redis.Redis(connection_pool=pool)