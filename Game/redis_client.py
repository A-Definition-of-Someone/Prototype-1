import redis.asyncio as redis

pool = redis.ConnectionPool.from_url("rediss://phantom-chess.redis.cache.windows.net:6380/0")
redis_client = redis.Redis(connection_pool=pool)