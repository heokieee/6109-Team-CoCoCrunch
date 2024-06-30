# accounts/utilities.py
from django.contrib.auth.models import User

def create_user(username, password):
    # Create a new User object
    user = User.objects.create_user(username=username, password=password)
    # Save the user to the database
    user.save()
    return user  # Return the created user object

