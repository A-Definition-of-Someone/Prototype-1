#https://channels.readthedocs.io/en/latest/tutorial/part_2.html
from django.urls import re_path
from Game import websocket_consumers

websocket_urlpatterns = [
    re_path(r"ws/OnlinePlayersList", websocket_consumers.OnlinePlayersConsumer.as_asgi()),
    re_path(r"ws/Challenge/(?P<target_player_name>\w+)/$", websocket_consumers.PlayerChallengeConsumer.as_asgi()),
    re_path(r"ws/Matchmaking/(?P<target_player_name>\w+)/$", websocket_consumers.PlayerMatchConsumer.as_asgi()),
    re_path(r"ws/Friend/(?P<target_player_name>\w+)/$", websocket_consumers.FriendRequestConsumer.as_asgi()),
]