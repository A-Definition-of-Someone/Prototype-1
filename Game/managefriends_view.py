from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
from Game.models import Account
import ast
from asgiref.sync import sync_to_async
from Game.forms import PlayerFriendRequestForm
from channels.layers import get_channel_layer

async def ManageFriends(request):
    token_isExist = await request.session.ahas_key("csrfmiddlewaretoken")
    if token_isExist and request.method == "GET":
        _Token = await request.session.aget("csrfmiddlewaretoken")
        result = await Account.objects.filter(Token = _Token).afirst()
        if result is None:
            return render(request,'NotloggedIn/Desktop - Front Page.html')
        #If Account instance exists from the Token
        await request.session.aset("Username", result.Username)
        FriendList = list(ast.literal_eval(result.FriendList or "[]"))
        FriendRequestList = list(ast.literal_eval(result.FriendRequest or "[]"))

        #All player list to send friend excluding friends and the player
        PossibleFriendsList = await sync_to_async(lambda: list(Account.objects.exclude(Username__in = FriendList + FriendRequestList + [result.Username]).values_list("Username", flat=True)))()
        return render(request, "LoggedIn/Desktop - Manage Friends.html",{
            "Username": result.Username,
            "csrf_token": _Token,
            "PlayerList": PossibleFriendsList,
            "RequestList": FriendRequestList,
            "FriendsList": FriendList
        })
    return render(request,'NotLoggedIn/Desktop - Front Page.html')

async def RequestFriend(request):
    token_isExist = await request.session.ahas_key("csrfmiddlewaretoken")
    if token_isExist and request.method == "POST":
        _Token = await request.session.aget("csrfmiddlewaretoken")
        PlayerRequester = await Account.objects.filter(Token = _Token).afirst()
        if PlayerRequester is None:
            return HttpResponse("Unable to add Friend, you might not be logged in!")
        
        RequesterName = PlayerRequester.Username

        #Now check friend request form
        form = PlayerFriendRequestForm(request.POST)
        if not form.is_valid():
            return HttpResponse("Unable to add Friend, form is invalid!")
        
        #Now fetch the potential friend account
        ReceiverName = form.cleaned_data["PotentialFriendName"]
        PlayerReceiver = await Account.objects.filter(Username = ReceiverName).afirst()

        if PlayerReceiver is None:
            return HttpResponse("Unable to add Friend, the player doesn't exist!")
        
        #Check if already friends or not
        FriendList = list(ast.literal_eval(PlayerReceiver.FriendList or "[]"))
        for friend in FriendList:
            if friend == RequesterName:
                return HttpResponse("Unable to add Friend, you're already friends with the player")
            
        #Now add to friend request
        FriendRequestListReceiver = list(ast.literal_eval(PlayerReceiver.FriendRequest or "[]"))
        for friend in FriendRequestListReceiver:
            if friend == RequesterName:
                return HttpResponse("Unable to add Friend, you're already sent friend request")
        FriendRequestListReceiver.append(RequesterName)
        
        #Now update for friend requester
        PlayerReceiver.FriendRequest = FriendRequestListReceiver

        await PlayerReceiver.asave()

        #Inform potential friend about the friend request
        channel_layer = get_channel_layer()
        await channel_layer.group_send(f"friend_{ReceiverName}", {"type": "to.player", "sender": RequesterName})

        return HttpResponse("Friend Request Sent!")
        
    return HttpResponse("Unable to add Friend, request is not POST or you're not logged in!")

async def get_friend_requests(request):
    token_isExist = await request.session.ahas_key("csrfmiddlewaretoken")
    if token_isExist and request.method == "POST":
        _Token = await request.session.aget("csrfmiddlewaretoken")
        result = await Account.objects.filter(Token = _Token).afirst()
        if result is None:
            return HttpResponse(JsonResponse({
                "FriendRequests": []
                }))
        
        FriendRequestList = list(ast.literal_eval(result.FriendRequest or "[]"))
        return HttpResponse(JsonResponse({
            "FriendRequests": FriendRequestList
            }))

    return HttpResponse(JsonResponse({
        "FriendRequests": []
    }))

async def queryPlayersNames(request):
    token_isExist = await request.session.ahas_key("csrfmiddlewaretoken")
    if token_isExist and request.method == "POST":
        _Token = await request.session.aget("csrfmiddlewaretoken")
        result = await Account.objects.filter(Token = _Token).afirst()
        if result is None:
            return HttpResponse(JsonResponse({
                "Names": []
                }))
        form = PlayerFriendRequestForm(request.POST)
        if not form.is_valid():
            return HttpResponse(JsonResponse({
                "Names": []
                }))
        FriendList = list(ast.literal_eval(result.FriendList or "[]"))
        FriendRequestList = list(ast.literal_eval(result.FriendRequest or "[]"))

        #All player list to send friend excluding friends and the player
        PossibleFriendsList = await sync_to_async(
            lambda: list(Account.objects.filter(Username__icontains = form.cleaned_data["PotentialFriendName"])
                         .exclude(Username__in = FriendList + FriendRequestList + [result.Username])
                         .values_list("Username", flat=True))
            )()
        return HttpResponse(JsonResponse({
            "Names": PossibleFriendsList
            }))
    return HttpResponse(JsonResponse({
        "Names": []
        }))

async def AcceptFriendRequest(request):
    token_isExist = await request.session.ahas_key("csrfmiddlewaretoken")
    if token_isExist and request.method == "POST":
        _Token = await request.session.aget("csrfmiddlewaretoken")
        result = await Account.objects.filter(Token = _Token).afirst()
        if result is None:
            return HttpResponse("Unable to add Friend, you might not be logged in!")
        
        form = PlayerFriendRequestForm(request.POST)
        if not form.is_valid():
            return HttpResponse("Unable to add Friend, your form is invalid!")
        
        #FIlter put the added friend from friend request list
        NewFriendName = form.cleaned_data["PotentialFriendName"]
        FriendRequestList = list(ast.literal_eval(result.FriendRequest or "[]"))
        NewFriendRequestList = list(filter(lambda player: player != NewFriendName, FriendRequestList))
        result.FriendRequest = NewFriendRequestList

        #Now fetch the potential friend account
        NewFriend = await Account.objects.filter(Username = NewFriendName).afirst()

        if NewFriend is None:
            return HttpResponse("Unable to add Friend, the player doesn't exist!")
        
        #Check if already friends or not
        FriendList = list(ast.literal_eval(NewFriend.FriendList or "[]"))
        for friend in FriendList:
            if friend == NewFriendName:
                return HttpResponse("Unable to add Friend, you're already friends with the player")

        #Now put friend in friend list
        FriendList = list(ast.literal_eval(result.FriendList or "[]"))
        FriendList.append(NewFriendName)

        FriendListFriend = list(ast.literal_eval(NewFriend.FriendList or "[]"))
        FriendListFriend.append(result.Username)

        result.FriendList = FriendList
        NewFriend.FriendList = FriendListFriend
        
        await result.asave()
        await NewFriend.asave()

        #Inform potential friend about the friend request
        channel_layer = get_channel_layer()
        await channel_layer.group_send(f"friend_{NewFriendName}", {"type": "add.friend", "sender": result.Username})

        return HttpResponse("Friend Request Sent!")
        
    return HttpResponse("Unable to add Friend, request is not POST or you're not logged in!")

        
async def RejectFriendRequest(request):
    token_isExist = await request.session.ahas_key("csrfmiddlewaretoken")
    if token_isExist and request.method == "POST":
        _Token = await request.session.aget("csrfmiddlewaretoken")
        result = await Account.objects.filter(Token = _Token).afirst()
        if result is None:
            return HttpResponse("Unable to reject Friend, you might not be logged in!")
        
        form = PlayerFriendRequestForm(request.POST)
        if not form.is_valid():
            return HttpResponse("Unable to reject Friend, your form is invalid!")
        
        #FIlter put the player from friend request list
        RejectedFriendName = form.cleaned_data["PotentialFriendName"]
        FriendRequestList = list(ast.literal_eval(result.FriendRequest or "[]"))
        NewFriendRequestList = list(filter(lambda player: player != RejectedFriendName, FriendRequestList))
        result.FriendRequest = NewFriendRequestList
        
        await result.asave()

        #Inform rejection
        channel_layer = get_channel_layer()
        await channel_layer.group_send(f"friend_{RejectedFriendName}", {"type": "reject.friend", "sender": result.Username})

        return HttpResponse("Friend Rejection Sent!")


    return HttpResponse("Unable to reject Friend, request is not POST or you're not logged in!")

async def Unfriend(request):
    token_isExist = await request.session.ahas_key("csrfmiddlewaretoken")
    if token_isExist and request.method == "POST":
        _Token = await request.session.aget("csrfmiddlewaretoken")
        result = await Account.objects.filter(Token = _Token).afirst()
        if result is None:
            return HttpResponse("Unable to remove Friend, you might not be logged in!")
        
        form = PlayerFriendRequestForm(request.POST)
        if not form.is_valid():
            return HttpResponse("Unable to remove Friend, your form is invalid!")
        
        RemovedFriendName = form.cleaned_data["PotentialFriendName"]

        RemovedFriend = await Account.objects.filter(Username = RemovedFriendName).afirst()
        if RemovedFriend is None:
            return HttpResponse("Unable to remove Friend, player does not exist!")
        
        #FIlter put the player from friend list and the former friend list as well
        FormerFriendList = list(ast.literal_eval(RemovedFriend.FriendList or "[]"))
        NewFormerFriendList = list(filter(lambda player: player != result.Username, FormerFriendList))
        RemovedFriend.FriendList = NewFormerFriendList

        await RemovedFriend.asave()

        FriendList = list(ast.literal_eval(result.FriendList or "[]"))
        NewFriendList = list(filter(lambda player: player != RemovedFriendName, FriendList))
        result.FriendList = NewFriendList
        
        await result.asave()

        #Inform unfriend
        channel_layer = get_channel_layer()
        await channel_layer.group_send(f"friend_{RemovedFriendName}", {"type": "remove.friend", "sender": result.Username})

        return HttpResponse("Friend Removal Sent!")


    return HttpResponse("Unable to remove Friend, request is not POST or you're not logged in!")
