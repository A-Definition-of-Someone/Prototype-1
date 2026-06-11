#https://channels.readthedocs.io/en/latest/tutorial/part_2.html
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from Game.models import Account
from Game.redis_client import Get_redis_client
from Game.forms import CreateChallengeForm

class OnlinePlayersConsumer(AsyncWebsocketConsumer):
    OnlinePlayers = "OnlinePlayers"
    async def connect(self):
        await self.channel_layer.group_add(self.OnlinePlayers, self.channel_name)
        await self.accept()
        #print("Group Members: ", )

    async def disconnect(self, code):
        PlayerSession = self.scope["session"]

        await self.channel_layer.group_discard(self.OnlinePlayers, self.channel_name)

        username_isExist = await database_sync_to_async(PlayerSession.has_key)("Username")

        if username_isExist:
            redis_client = Get_redis_client()
            OnlinePlayersListEncoded = await redis_client.get(self.OnlinePlayers) 
            OnlinePlayersList = list(json.loads(OnlinePlayersListEncoded) if OnlinePlayersListEncoded else [])
            #Only players other than disconnected user is included in OnlinePlayersList
            OnlinePlayersListFiltered = list(filter(lambda player: player["PlayerName"] != PlayerSession["Username"], OnlinePlayersList))
            
            await redis_client.set(self.OnlinePlayers, json.dumps(OnlinePlayersListFiltered))
            
        await self.channel_layer.group_send(self.OnlinePlayers, {"type": "to.players"})

    async def receive(self, text_data=None, bytes_data=None):
        await self.channel_layer.group_send(self.OnlinePlayers, {"type": "to.players"})

    async def to_players(self, event):
        await self.send(text_data=json.dumps({"event": "OnlinePlayersList"}))

class PlayerChallengeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        PlayerSession = self.scope["session"]
        username_isExist = await database_sync_to_async(PlayerSession.has_key)("Username")
        self.target_player_name = self.scope["url_route"]["kwargs"]["target_player_name"]
        if username_isExist:
            await self.channel_layer.group_add(self.target_player_name, self.channel_name)
            await self.accept()
        else:
            await self.close(code=1008, reason="Not Logged In")
        
    async def disconnect(self, code):
        PlayerSession = self.scope["session"]

        await self.channel_layer.group_discard(self.target_player_name, self.channel_name)

        username_isExist = await database_sync_to_async(PlayerSession.has_key)("Username")
        if username_isExist:
            Username = await database_sync_to_async(PlayerSession.get)("Username")
            await self.channel_layer.group_send(self.target_player_name, {"type": "challenge.cancel", "sender": Username})


    async def receive(self, text_data=None, bytes_data=None):
        PlayerSession = self.scope["session"]
        redis_client = Get_redis_client()
        username_isExist = await database_sync_to_async(PlayerSession.has_key)("Username")
        if username_isExist:
            Username = await database_sync_to_async(PlayerSession.get)("Username")
            if text_data == "Reject" or text_data == "Cancel":
                await self.channel_layer.group_send(self.target_player_name, {"type": "challenge.cancel", "sender": Username})
                #Remove the player configs
                PlayerConfig = json.loads(await redis_client.get(Username))
                await redis_client.delete(Username)
                await redis_client.delete(PlayerConfig["OpponentUsername"])

            elif text_data == "Accept":
                await self.channel_layer.group_send(self.target_player_name, {"type": "challenge.accept", "sender": Username})
            elif text_data is not None:
                form = CreateChallengeForm(Username, text_data)
                if form.is_valid():
                    #Set up opponentPlayer config
                    await redis_client.set(self.target_player_name, json.dumps(
                        {
                        "OpponentUsername": Username,
                        "Gamemode": form.cleaned_data["Gamemode"],
                        "Side": "Black" if form.cleaned_data["SenderSide"] == "White" else "White"
                        }
                    ))
                    #Set up self config
                    await redis_client.set(Username, json.dumps(
                        {
                        "OpponentUsername": self.target_player_name,
                        "Gamemode": form.cleaned_data["Gamemode"],
                        "Side": form.cleaned_data["SenderSide"]
                        }
                    ))

                    await self.channel_layer.group_send(self.target_player_name, {
                    "type": "challenge.send", 
                    "sendername": form.cleaned_data["SenderName"], 
                    "gamemode": form.cleaned_data["Gamemode"], 
                    "senderside": form.cleaned_data["SenderSide"]
                    })
                else:
                    await self.channel_layer.group_send(self.target_player_name, {"type": "challenge.cancel", "sender": Username})

    async def challenge_send(self, event):
        SenderName = event["sendername"]
        Gamemode = event["gamemode"]
        SenderSide = event["senderside"]
        await self.send(text_data=json.dumps({
            "event": "Challenge Send", 
            "sender": SenderName,
            "gamemode": Gamemode,
            "senderside": SenderSide
            }))
        
    async def challenge_accept(self, event):
        SenderName = event["sender"]
        await self.send(text_data=json.dumps({"event": "Challenge Accepted", "sender": SenderName}))
        
    async def challenge_cancel(self, event):
        SenderName = event["sender"]
        await self.send(text_data=json.dumps({"event": "Challenge Cancelled", "sender": SenderName}))

class PlayerMatchConsumer(AsyncWebsocketConsumer):
    OnlinePlayers = "OnlinePlayers"
    async def connect(self):
        PlayerSession = self.scope["session"]
        username_isExist = await database_sync_to_async(PlayerSession.has_key)("Username")
        self.target_player_name = f"match_{self.scope["url_route"]["kwargs"]["target_player_name"]}"
        if username_isExist:
            await self.channel_layer.group_add(self.target_player_name, self.channel_name)
            await self.accept()
        else:
            await self.close(code=1008, reason="Not Logged In")
    
    async def disconnect(self, code):
        PlayerSession = self.scope["session"]
        gamemode_isExist  = await database_sync_to_async(PlayerSession.has_key)("Gamemode")
        username_isExist = await database_sync_to_async(PlayerSession.has_key)("Username")

        print("gamemode_isExist:", gamemode_isExist)

        await self.channel_layer.group_discard(self.target_player_name, self.channel_name)

        if username_isExist and gamemode_isExist:
            print("Disconnect Lobby")
            redis_client = Get_redis_client()
            Username = await database_sync_to_async(PlayerSession.get)("Username")
            Gamemode = await database_sync_to_async(PlayerSession.get)("Gamemode")
            LobbyList = list(json.loads(await redis_client.get(Gamemode) or "[]"))

            #Filter out player
            LobbyListFilter = list(filter(lambda player: player[0] != Username, LobbyList))
            await redis_client.set(Gamemode, json.dumps(LobbyListFilter))

            #Update OnlinePlayersList
            OnlinePlayersList = list(json.loads(await redis_client.get(self.OnlinePlayers) or "[]"))
            for ThisPlayer in OnlinePlayersList:
                if ThisPlayer["PlayerName"] == Username:
                    ThisPlayer["Status"] = "Online"
                    ThisPlayer["Gamemode"] = ""
                    ThisPlayer["Side"] = ""
                    await redis_client.set(self.OnlinePlayers, json.dumps(OnlinePlayersList))
                    break
            
    
    async def receive(self, text_data=None, bytes_data=None):
        print("player match received somehow")
        return await super().receive(text_data, bytes_data)
    
    async def match_found(self, event):
        print("found match please work")
        SenderName = event["sender"]
        await self.send(text_data=json.dumps({"event": "match_found", "sender": SenderName}))

class FriendRequestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.target_player_name = f"friend_{self.scope["url_route"]["kwargs"]["target_player_name"]}"
        await self.channel_layer.group_add(self.target_player_name, self.channel_name)
        await self.accept()
    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.target_player_name, self.channel_name)
    async def receive(self, text_data=None, bytes_data=None):
        return await super().receive(text_data, bytes_data)
    
    async def to_player(self, event):
        SenderName = event["sender"]
        print(FriendRequestConsumer.__name__, "to.player")
        await self.send(text_data=json.dumps({"event": "friend_request", "sender": SenderName}))

    async def add_friend(self, event):
        SenderName = event["sender"]
        await self.send(text_data=json.dumps({"event": "friend_added", "sender": SenderName}))

    async def reject_friend(self, event):
        SenderName = event["sender"]
        await self.send(text_data=json.dumps({"event": "friend_rejected", "sender": SenderName}))

    async def remove_friend(self, event):
        SenderName = event["sender"]
        await self.send(text_data=json.dumps({"event": "friend_removed", "sender": SenderName}))