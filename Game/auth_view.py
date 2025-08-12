from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
from channels.layers import get_channel_layer
from django.contrib.auth.hashers import make_password
from Game.data_format import PlayerStatusFormat
from Game.forms import PlayerAuthForm
from Game.models import Account, History
import json

SaltKey = "GST"

async def AuthLogin(request):
    if request.method == "POST":
        form = PlayerAuthForm(request.POST)
        if not form.is_valid():
            return HttpResponse(JsonResponse({
                "Status": "Auth Error: Error1",
                "Remark": "Form Invalid! Make sure to fill in all the blanks!"
            }))
        
        #Verify that the Username exist
        result = await Account.objects.filter(Username = form.cleaned_data["PlayerUsername"]).afirst()
        if result is None:
            return HttpResponse(JsonResponse({
                "Status": "Auth Error: Error1",
                "Remark": "Username does not Exist!"
                }))
        HashedPassword = make_password(salt=SaltKey, password= form.cleaned_data["PlayerPassword"])[:16]
        if(result.Password != HashedPassword):
            return HttpResponse(JsonResponse({
                "Status": "Auth Error: Error1",
                "Remark": "Wrong Password, please try again!"
            }))
        result.Token = form.cleaned_data["csrfmiddlewaretoken"]
        await result.asave()
        await request.session.aset("csrfmiddlewaretoken", form.cleaned_data["csrfmiddlewaretoken"]) 

        return HttpResponse(JsonResponse({
            "Status": "Success",
            "Remark": "Login for {} is a success".format(form.cleaned_data["PlayerUsername"])
        }))
    return HttpResponse(JsonResponse({
        "Status": "Auth Error: Error1",
        "Remark": "Please use POST request rather than GET request!"
    }))

async def AuthSignup(request):
    if request.method == "POST":
        form = PlayerAuthForm(request.POST)
        if not form.is_valid():
            return HttpResponse(JsonResponse({
                "Status": "Auth Error: Error1",
                "Remark": "Form Invalid! Make sure to fill in all the blanks!"
            }))
        #Check if username already taken
        result = await Account.objects.filter(Username = form.cleaned_data["PlayerUsername"]).afirst()
        if result is not None:
            return HttpResponse(JsonResponse({
                "Status": "Auth Error: Error1",
                "Remark": "Username already Exist, please choose a different name!"
                }))
        #Create Player Account
        HashedPassword = make_password(salt=SaltKey, password= form.cleaned_data["PlayerPassword"])[:16]
        await Account.objects.acreate(Username = form.cleaned_data["PlayerUsername"], 
                               Password = HashedPassword,
                               Token = form.cleaned_data["csrfmiddlewaretoken"],
                               Privilege = "Player")
        await request.session.aset("csrfmiddlewaretoken", form.cleaned_data["csrfmiddlewaretoken"]) 
        return HttpResponse(JsonResponse({
            "Status": "Success",
            "Remark": "Signup for {} is a success".format(form.cleaned_data["PlayerUsername"])
        }))
    return HttpResponse(JsonResponse({
        "Status": "Auth Error: Error1",
        "Remark": "Please use POST request rather than GET request!"
    }))

async def AuthLogout(request):
    token_isExist = await request.session.ahas_key("csrfmiddlewaretoken")
    if token_isExist and request.method == "POST":
        result = await Account.objects.filter(Token = await request.session.aget("csrfmiddlewaretoken")).afirst()
        
        if result is None :
            return HttpResponse(JsonResponse({
                "Status": "Logout Error",
                "Remark": "Please make sure to authenticate with Phantom Chess before logout!"
                }))

        #Remove token
        result.Token = None
        await result.asave()
        return HttpResponse(JsonResponse({
                "Status": "Logout Success",
                "Remark": "The page should reload"
                }))
    
    return render(
        request,
        'NotloggedIn/Desktop - Front Page.html'
        )