import redis.asyncio as redis

pool = redis.ConnectionPool.from_url("rediss://{6Xuw0ogshvbmjktdNPwmLmKdR4nGHqVq9AzCaGfM8WE=}@phantom-chess.redis.cache.windows.net:6380/0")
redis_client = redis.Redis(connection_pool=pool)