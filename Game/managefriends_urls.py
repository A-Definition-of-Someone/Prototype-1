from django.urls import path
from Game import managefriends_view

urlpatterns = [
    path("ManageFriends", managefriends_view.ManageFriends, name="ManageFriends"),
    path("sendFriendRequest", managefriends_view.RequestFriend, name="sendFriendRequest"),
    path("getFriendRequestList", managefriends_view.get_friend_requests, name="getFriendRequestList"),
    path("queryPlayersNames", managefriends_view.queryPlayersNames, name="queryPlayersNames"),
    path("AcceptFriendRequest", managefriends_view.AcceptFriendRequest, name="AcceptFriendRequest"),
    path("RejectFriendRequest", managefriends_view.RejectFriendRequest, name="RejectFriendRequest"),
    path("Unfriend", managefriends_view.Unfriend, name="Unfriend"),
]