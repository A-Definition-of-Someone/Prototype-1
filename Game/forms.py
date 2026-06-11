from django import forms
from Game.models import Account, History
from django.core.exceptions import ValidationError
from django.http import HttpRequest
import json

def validateGamemode(Gamemode):
     if Gamemode not in ["Bullet 1 + 0", "Blitz 3 + 0", "Blitz 3 + 2", "Blitz 5 + 0", "Rapid 10 + 0", "Rapid 20 + 0"]:
          raise ValidationError("Must be within these allocated Configurations")
     
def validateSide(Side):
        if Side not in ["White","Black"]:
            raise ValidationError("Must be either White or Black")

class PlayerAuthForm(forms.ModelForm):
    PlayerUsername = forms.CharField(label= "Username", max_length = 40, min_length= 1)
    PlayerPassword = forms.CharField(label= "Password", max_length = 16, min_length= 8)
    csrfmiddlewaretoken = forms.CharField(label= "Token", max_length = 64, min_length= 64)
    class Meta:
        model = Account
        fields = ('PlayerUsername', 'PlayerPassword', 'csrfmiddlewaretoken',)

class PlayLocalForm(forms.Form):
    PlayerUsername = forms.CharField(label= "Username", max_length = 40, min_length= 1)
    Gamemode = forms.CharField(label= "Gamemode", max_length = 13, min_length = 1, validators=[validateGamemode])
    Side = forms.CharField(label= "Side", max_length = 5, min_length = 5, validators=[validateSide])
    csrfmiddlewaretoken = forms.CharField(label= "csrfmiddlewaretoken", max_length = 64, min_length= 64)

class CreateChallengeForm(forms.Form): #Note: Not to be used in session.POST, only session in websocket
     def __init__(self, username: str, text_data: str, *args, **kwargs):

          text_data_json = json.loads(text_data)

          print("CreateChallengeForm", text_data)
          print("CreateChallengeForm type", type(text_data))
          
          data = {
               "SenderName": username,
               "Gamemode": text_data_json["Gamemode"],
               "SenderSide": text_data_json["SenderSide"]
          }
          super().__init__(data,*args, **kwargs)
          self.fields["SenderName"] = forms.CharField(label= "SenderName", max_length = 40, min_length= 1)
          self.fields["Gamemode"] = forms.CharField(label= "Gamemode", max_length = 13, min_length = 1, validators=[validateGamemode])
          self.fields["SenderSide"] = forms.CharField(label= "SenderSide", max_length = 5, min_length = 5, validators=[validateSide])

class SearchOpponentForm(forms.Form):
     Gamemode = forms.CharField(label= "Gamemode", max_length = 13, min_length = 1, validators=[validateGamemode])
     Side = forms.CharField(label= "Side", max_length = 5, min_length = 5, validators=[validateSide])

class JoinSpecificLobbyForm(forms.Form):
    PlayerHost = forms.CharField(label= "PlayerHost", max_length = 40, min_length = 1)
    Gamemode = forms.CharField(label= "Gamemode", max_length = 13, min_length = 1, validators=[validateGamemode])
    HostSide = forms.CharField(label= "HostSide", max_length = 5, min_length = 5, validators=[validateSide])
    csrfmiddlewaretoken = forms.CharField(label= "csrfmiddlewaretoken", max_length = 64, min_length= 64)

class PlayerFriendRequestForm(forms.Form):
     PotentialFriendName = forms.CharField(label= "PotentialFriendName", max_length = 40, min_length = 1)