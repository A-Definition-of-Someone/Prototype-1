from django.apps import AppConfig
from celery import shared_task

class GameConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Game'

    def ready(self):
        return super().ready()
            

    

