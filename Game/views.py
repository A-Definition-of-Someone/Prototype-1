from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from Game.data_format import PlayerStatusFormat
from Game.redis_client import Get_redis_client
from Game.models import Account, History
import json
from Game.forms import PlayLocalForm, SearchOpponentForm, JoinSpecificLobbyForm
from django.utils.text import slugify

OnlinePlayers = "OnlinePlayers"
GameConfs = {
    "Bullet 1 + 0": {"Timer": 1, "PerMove": 0}, 
    "Blitz 3 + 0": {"Timer": 3, "PerMove": 0}, 
    "Blitz 3 + 2": {"Timer": 3, "PerMove": 2}, 
    "Blitz 5 + 0": {"Timer": 5, "PerMove": 0}, 
    "Rapid 10 + 0": {"Timer": 10, "PerMove": 0}, 
    "Rapid 20 + 0": {"Timer": 20, "PerMove": 0}
    }

# Create your views here.
async def FrontPage(request):
    token_isExist = await request.session.ahas_key("csrfmiddlewaretoken")
    if token_isExist:
        Token = await request.session.aget("csrfmiddlewaretoken")
        result = await Account.objects.filter(Token = Token).afirst()

        if result is None: #Not Logged In
            return render(
                request,
                'NotLoggedIn/Desktop - Front Page.html'
                )
        Username = result.Username
        await request.session.aset("Username", Username)

        return render(request, "LoggedIn/Desktop - Front Page.html",
                      {
                          "Username": result.Username,
                          "csrf_token": Token
                          }
                          )
        

    return render(request, "NotLoggedIn/Desktop - Front Page.html")

async def get_player_list(request):
    username_isExist = await request.session.ahas_key("Username")
    redis_client = Get_redis_client()
    OnlinePlayersListEncoded = await redis_client.get(OnlinePlayers)
    OnlinePlayersList = list(json.loads(OnlinePlayersListEncoded) if OnlinePlayersListEncoded else [])
    
    if username_isExist is None:
        return HttpResponse(JsonResponse({OnlinePlayers : OnlinePlayersList}))
    Username = await request.session.aget("Username")
    OnlinePlayersListFiltered = list(filter(lambda player: player["PlayerName"] != Username, OnlinePlayersList))
    return HttpResponse(JsonResponse({OnlinePlayers : OnlinePlayersListFiltered}))

async def inform_online(request):
    username_isExist = await request.session.ahas_key("Username")
    if request.method == "POST" and username_isExist :
        Username = await request.session.aget("Username")

        PlayerStatus = PlayerStatusFormat(Username, "Online", Gamemode="", Side="")
        redis_client = Get_redis_client()
        OnlinePlayersList = list(json.loads(await redis_client.get(OnlinePlayers) or "[]"))
        OnlinePlayersList.append(PlayerStatus)
        await redis_client.set(OnlinePlayers, json.dumps(OnlinePlayersList))

        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            OnlinePlayers, 
            {"type": "to.players"})
        return HttpResponse("inform_online")

    return HttpResponse("Please login and use POST")

async def inform_online_inlobby(request):
    return

async def PlayLocal(request):
    if request.method == "POST":
        form = PlayLocalForm(request.POST)
        if form.is_valid():
            await request.session.aset("PlayerUsername", form.cleaned_data["PlayerUsername"])
            await request.session.aset("Gamemode", form.cleaned_data["Gamemode"])
            await request.session.aset("Side", form.cleaned_data["Side"])
            await request.session.aset("csrfmiddlewaretoken", form.cleaned_data["csrfmiddlewaretoken"])
            return HttpResponse("OK")
        return HttpResponse("Fill the form properly!")
    elif request.method == "GET":
        token_isExist = await request.session.ahas_key("csrfmiddlewaretoken")
        if token_isExist:
            Token = await request.session.aget("csrfmiddlewaretoken")
            result = await Account.objects.filter(Token = Token).afirst()
            
            if result is None: #Not Logged In
                return render(
                    request,
                    'NotLoggedIn/Desktop - Play Local.html',
                    {
                        "Target": await request.session.aget("PlayerUsername"),
                        "Config": GameConfs[await request.session.aget("Gamemode")],
                        "Side": await request.session.aget("Side"),
                        "csrfmiddlewaretoken": await request.session.aget("csrfmiddlewaretoken"),
                    }
                    )
            return render(
                request,
                "LoggedIn/Desktop - Play Local.html",
                {
                    "Target": await request.session.aget("PlayerUsername"),
                    "Config": GameConfs[await request.session.aget("Gamemode")],
                    "Side": await request.session.aget("Side"),
                    "csrfmiddlewaretoken": await request.session.aget("csrfmiddlewaretoken"),
                 })
    return HttpResponse("Please use POST or GET")

async def PlayMultiplayer(request):
    username_isExist = await request.session.ahas_key("Username")
    if username_isExist:
        redis_client = Get_redis_client()
        Username = await request.session.aget("Username")
        PlayerConfig = json.loads(await redis_client.get(Username))
        if PlayerConfig is not None:
            return render(
                request,
                "LoggedIn/Desktop - Play Multiplayer.html",
                {
                    "Player1": Username,
                    "Player1Side": PlayerConfig["Side"],
                    "Player2": PlayerConfig["OpponentUsername"],
                    "Player2Side": "Black" if PlayerConfig["Side"] == "White" else "White",
                    "Config": GameConfs[await request.session.aget("Gamemode")]
                }
                )
        return HttpResponse("Error, you're not in a match!")
    return HttpResponse("Error, please login")

async def searchOpponent(request):
    username_isExist = await request.session.ahas_key("Username")
    if request.method == "POST" and username_isExist:
        Username = await request.session.aget("Username")
        form = SearchOpponentForm(request.POST)
        channel_layer = get_channel_layer()
        if form.is_valid():
            redis_client = Get_redis_client()
            Side = form.cleaned_data["Side"]
            Gamemode = slugify(form.cleaned_data["Gamemode"])
            await request.session.aset("Gamemode", form.cleaned_data["Gamemode"])
            LobbyList = list(json.loads(await redis_client.get(Gamemode) or "[]"))
            for opponent in LobbyList:
                if opponent[1] != Side: #The opponent side is opposite ours
                    #Set up opponentPlayer config
                    await redis_client.set(opponent[0], json.dumps(
                        {
                        "OpponentUsername": Username,
                        "Gamemode": form.cleaned_data["Gamemode"],
                        "Side": opponent[1]
                        }
                    ))
                    #Set up self config
                    await redis_client.set(Username, json.dumps(
                        {
                        "OpponentUsername": opponent[0],
                        "Gamemode": form.cleaned_data["Gamemode"],
                        "Side": Side
                        }
                    ))

                    LobbyList.remove(opponent)

                    await redis_client.set(Gamemode, json.dumps(LobbyList))

                    await channel_layer.group_send(f"match_{opponent[0]}", {"type": "match.found", "sender": Username})
                    
                    return HttpResponse("Match Found!")
            return HttpResponse("Open Lobby")
        return HttpResponse("Invalid Form!")     
    return HttpResponse("POST request is not used or you didn't login")

async def openLobby(request):
    username_isExist = await request.session.ahas_key("Username")
    if request.method == "POST" and username_isExist:
        Username = await request.session.aget("Username")
        form = SearchOpponentForm(request.POST)
        if form.is_valid():
            redis_client = Get_redis_client()
            Side = form.cleaned_data["Side"]
            Gamemode = slugify(form.cleaned_data["Gamemode"])
            LobbyList = list(json.loads(await redis_client.get(Gamemode) or "[]"))
            LobbyList.append([Username, Side])

            #Update OnlinePlayersList
            OnlinePlayersList = list(json.loads(await redis_client.get(OnlinePlayers) or "[]"))
            for ThisPlayer in OnlinePlayersList:
                if ThisPlayer["PlayerName"] == Username:
                    ThisPlayer["Status"] = "InLobby"
                    ThisPlayer["Gamemode"] = form.cleaned_data["Gamemode"]
                    ThisPlayer["Side"] = Side
                    await redis_client.set(OnlinePlayers, json.dumps(OnlinePlayersList))
                    channel_layer = get_channel_layer()
                    await channel_layer.group_send(
                        OnlinePlayers, 
                        {"type": "to.players"})
                    break

            #Update in LobbyList
            await redis_client.set(Gamemode, json.dumps(LobbyList))
            return HttpResponse("Lobby Opened")
        return HttpResponse("Invalid Form!")  
    return HttpResponse("POST request is not used or you didn't login")

async def joinLobby(request):
    username_isExist = await request.session.ahas_key("Username")
    if request.method == "POST" and username_isExist:
        Username = await request.session.aget("Username")
        form = JoinSpecificLobbyForm(request.POST)
        channel_layer = get_channel_layer()
        if form.is_valid():
            HostSide = form.cleaned_data["HostSide"]
            PlayerHost = form.cleaned_data["PlayerHost"]
            redis_client = Get_redis_client()
            #Set up opponentPlayer config
            await redis_client.set(PlayerHost, json.dumps(
                {
                    "OpponentUsername": Username,
                    "Gamemode": form.cleaned_data["Gamemode"],
                    "Side": HostSide
                    }
                    ))
            #Set up self config
            await redis_client.set(Username, json.dumps(
                {
                    "OpponentUsername": PlayerHost,
                    "Gamemode": form.cleaned_data["Gamemode"],
                    "Side": "Black" if HostSide == "White" else "White"
                    }
                    ))

                   

            await channel_layer.group_send(f"match_{PlayerHost}", {"type": "match.found", "sender": Username})
                    
            return HttpResponse("Match Found!")
            
    return HttpResponse("POST request is not used or you didn't login")