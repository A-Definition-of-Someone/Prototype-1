import os
from django.core.management.base import BaseCommand
from django.contrib.sessions.models import Session
from Game.redis_client import redis_client
from asgiref.sync import async_to_sync

class Command(BaseCommand):
    help = 'Clears all sessions'

    def handle(self, *args, **kwargs):
        Session.objects.all().delete()
        keys_deleted = async_to_sync(delete_all_keys)()
        print(f"Deletion result: {keys_deleted}")  # Returns number of keys deleted
        self.stdout.write(f"All sessions cleared, Done!")
        
async def delete_key_OnlinePlayers():
    return await redis_client.delete("OnlinePlayers")
async def delete_all_keys():
    return await redis_client.flushdb()