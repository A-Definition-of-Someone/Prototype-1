import redis.asyncio as redis
import urllib.parse

password = urllib.parse.quote_plus("your@redis:6Xuw0ogshvbmjktdNPwmLmKdR4nGHqVq9AzCaGfM8WE=")
url = f"rediss://:{password}@phantom-chess.redis.cache.windows.net:6380/0"
pool = redis.ConnectionPool.from_url(url)
redis_client = redis.Redis(connection_pool=pool)