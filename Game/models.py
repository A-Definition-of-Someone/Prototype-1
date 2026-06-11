from django.db import models

# Create your models here.
class Account(models.Model):
    Username = models.CharField(max_length = 40, primary_key = True)
    Password = models.CharField(max_length = 16)
    Token = models.CharField(max_length = 64, null = True)
    FriendRequest = models.CharField(max_length = 4000, null = True)
    FriendList = models.CharField(max_length = 4000, null = True)
    Privilege = models.CharField(max_length = 6)
    BanStatus = models.DecimalField(max_digits = 7, decimal_places= 2, null= True)

class History(models.Model):
    HistoryID = models.AutoField(auto_created=True, primary_key= True)
    Username = models.ForeignKey(Account, on_delete = models.CASCADE)
    Opponent_Username = models.CharField(max_length = 40)
    Chess_Movement = models.CharField(max_length = 1345)
    Date = models.DateField(auto_now_add = True)
    Time = models.TimeField(auto_now_add = True)