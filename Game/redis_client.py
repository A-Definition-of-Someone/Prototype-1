import redis.asyncio as redis


def Get_redis_client():
    pool = redis.ConnectionPool.from_url("rediss://default:uUCHAt4tWjYGh6Ody3Tc3FnwZR2ESVeDRAzCaCOR9Vc=@phantom-chess.redis.cache.windows.net:6380/0")
    return redis.Redis(connection_pool=pool)