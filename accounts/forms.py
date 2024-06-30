# # accounts/forms.py
# from django import forms
# from django.contrib.auth.forms import AuthenticationForm

# class CustomAuthenticationForm(AuthenticationForm):
#     username = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control'}))
#     password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control'}))

# accounts/forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Reminder

class RegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

class ReminderForm(forms.ModelForm):
    class Meta:
        model = Reminder
        fields = ['title', 'description', 'date', 'time', 'priority']


