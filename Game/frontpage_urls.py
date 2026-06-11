from django.urls import path
from Game import views, auth_view

urlpatterns = [
    path("", views.FrontPage, name="Front Page"),
    path("getPlayersList", views.get_player_list, name="getPlayersList"),
    path("informOnline", views.inform_online, name="informOnline"),
    path("AuthLogin", auth_view.AuthLogin, name="AuthLogin"),
    path("AuthSignup", auth_view.AuthSignup, name="AuthSignup"),
    path("AuthLogout", auth_view.AuthLogout, name="AuthLogout"),
    path("PlayLocal", views.PlayLocal, name="PlayLocal"),
    path("PlayMultiplayer", views.PlayMultiplayer, name="PlayMultiplayer"),
    path("searchOpponent", views.searchOpponent, name="searchOpponent"),
    path("openLobby", views.openLobby, name="openLobby"),
    path("joinLobby", views.joinLobby, name="joinLobby"),
]