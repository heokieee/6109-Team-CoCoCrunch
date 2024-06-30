# accounts/views.py
import json
from django.contrib.auth import login, authenticate
from django.contrib.auth.views import LoginView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from django.contrib.auth.forms import AuthenticationForm
from django.views.generic.edit import FormView
from .forms import RegistrationForm
from .utilities import create_user
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views import View
from .models import Reminder, StudyGroup
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.urls import reverse
from django.http import JsonResponse
from .models import Resource
from .models import Event
from .models import Task
from .models import Reminder
from .forms import ReminderForm

def get_reminders(request):
    reminders = list(Reminder.objects.values())
    return JsonResponse(reminders, safe=False)

@csrf_exempt
def add_reminder(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        reminder = Reminder.objects.create(
            title=data['title'],
            description=data['description'],
            dateTimeString=data['dateTimeString'],
            priority=data['priority']
        )
        return JsonResponse({
            'title': reminder.title,
            'description': reminder.description,
            'dateTimeString': reminder.dateTimeString,
            'priority': reminder.priority
        })

@csrf_exempt
def delete_reminder(request):
    if request.method == 'DELETE':
        data = json.loads(request.body)
        reminder = get_object_or_404(Reminder, title=data['title'], dateTimeString=data['dateTimeString'])
        reminder.delete()
        return JsonResponse({'success': True})
    
@csrf_exempt
def delete_task(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            task_id = data.get('task_id')
            Task.objects.filter(id=task_id).delete()
            return JsonResponse({'status': 'success'})
        except Task.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Task not found'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def calendar_view(request):
    events = Event.objects.all()
    return render(request, 'calendar/calendar.html', {'events': events})

def index(request):
    resources = Resource.objects.all()
    return render(request, 'index.html', {'resources': resources})

@require_POST
def upload_resource(request):
    title = request.POST.get('resource-title')
    description = request.POST.get('resource-description')
    resource_file = request.FILES.get('resource-file')

    resource = Resource(title=title, description=description, file=resource_file)
    resource.save()

    return JsonResponse({
        'title': resource.title,
        'description': resource.description,
        'file': resource.file.url,
    })

def study_groups_dashboard(request):
    return render(request, 'dashboard.html')

class CreateGroup(View):
    template_name = 'accounts/create_group.html'
    def get(self, request):
        return render(request, 'create_group.html')

    def post(self, request):
        group_name = request.POST.get('group-name')
        group_description = request.POST.get('group-description')
        if group_name and group_description:
            new_group = StudyGroup.objects.create(
                name=group_name,
                description=group_description,
                creator=request.user
            )
            new_group.members.add(request.user)
            messages.success(request, 'Group created successfully!')
            return redirect(reverse('study_groups'))
        else:
            messages.error(request, 'Please fill in all fields.')
            return render(request, 'create_group.html')

class JoinGroup(View):
    template_name = 'accounts/join_group.html'
    def get(self, request):
        return render(request, 'join_group.html')

    def post(self, request):
        group_id = request.POST.get('group-id')
        try:
            group = StudyGroup.objects.get(id=group_id)
            group.members.add(request.user)
            messages.success(request, 'You have successfully joined the group!')
            return redirect(reverse('study_groups'))
        except StudyGroup.DoesNotExist:
            messages.error(request, 'Group does not exist.')
            return redirect('join_group')
        
def join_group_submit(request):
    if request.method == 'POST':
        group_id = request.POST.get('group-id')
        try:
            group = StudyGroup.objects.get(id=group_id)
            group.members.add(request.user)
            messages.success(request, 'You have successfully joined the group.')
            return redirect(reverse('study_groups'))
        except StudyGroup.DoesNotExist:
            messages.error(request, 'Group does not exist.')
            return redirect('join_group')

def home(request):
    # Fetch reminders with top priority
    top_reminders = Reminder.objects.filter(importance='very-important').order_by('date', 'time')
    return render(request, 'home.html', {'top_reminders': top_reminders})

def dashboard(request):
    # Fetch reminders with top priority
    top_reminders = Reminder.objects.filter(importance='very-important').order_by('date', 'time')
    return render(request, 'dashboard.html', {'top_reminders': top_reminders})

def dashboard_view(request):
    reminders = Reminder.objects.filter(user=request.user).order_by('date', 'time')
    return render(request, 'dashboard.html', {'reminders': reminders})

class AddEvent(View):
    template_name = 'accounts/add_event.html'

    def get(self, request):
        return render(request, self.template_name)

    def post(self, request):
        # Process form submission data
        event_title = request.POST.get('event-title')
        event_date = request.POST.get('event-date')
        event_time = request.POST.get('event-time')
        event_description = request.POST.get('event-description')
        
        # Add your form processing logic here
        
        return render(request, self.template_name, {'success': True})

class Resource(View):
    template_name = 'accounts/resource.html'

    def get(self, request, *args, **kwargs):
        # Handle GET request to show the form
        return render(request, self.template_name, {})

    def post(self, request, *args, **kwargs):
        # Process form submission data
        reminder_title = request.POST.get('reminder-title')
        reminder_date = request.POST.get('reminder-date')
        reminder_time = request.POST.get('reminder-time')
        reminder_description = request.POST.get('reminder-description')
        
        return render(request, self.template_name, {})

class StudyGroup(View):
    template_name = 'accounts/study_groups.html'

    def get(self, request, *args, **kwargs):
        # Handle GET request to show the form
        return render(request, self.template_name, {})

    def post(self, request, *args, **kwargs):
        # Process form submission data
        reminder_title = request.POST.get('reminder-title')
        reminder_date = request.POST.get('reminder-date')
        reminder_time = request.POST.get('reminder-time')
        reminder_description = request.POST.get('reminder-description')
        
        return render(request, self.template_name, {})

class AddReminder(View):
    template_name = 'accounts/add_reminder.html'
    def get(self, request, *args, **kwargs):
        # Handle GET request to show the form
        return render(request, self.template_name, {})

    def post(self, request):
        title = request.POST.get('reminder-title')
        date = request.POST.get('reminder-date')
        time = request.POST.get('reminder-time')
        description = request.POST.get('reminder-description')
        category = request.POST.get('reminder-category')

        Reminder.objects.create(
            title=title,
            date=date,
            time=time,
            description=description,
            category=category  # Make sure your model has a category field
        )
        
        return redirect('dashboard')


def add_reminder(request):
    if request.method == 'POST':
        # Process form submission data
        reminder_title = request.POST.get('reminder-title')
        reminder_date = request.POST.get('reminder-date')
        reminder_time = request.POST.get('reminder-time')
        reminder_description = request.POST.get('reminder-description')
        
        return render(request, 'add_reminder.html', {})
    else:
        # Handle GET request to show the form
        return render(request, 'add_reminder.html', {})


class CalendarView(View):
    template_name = 'accounts/calendar.html'  # Specify the template name for rendering the calendar

    def get(self, request, *args, **kwargs):
        # Any additional logic can be added here if needed (e.g., retrieving events)
        return render(request, self.template_name)
    
class ReminderView(View):
    template_name = 'accounts/dashboard.html'

    def get(self, request, *args, **kwargs):
        # Any additional logic can be added here if needed (e.g., retrieving events)
        return render(request, self.template_name)


class CustomLoginView(LoginView):
    template_name = 'accounts/login.html'
    authentication_form = AuthenticationForm
    success_url = '/accounts/home/'

    def form_valid(self, form):
        authenticated_user = authenticate(username=form.cleaned_data['username'], password=form.cleaned_data['password'])
        if authenticated_user:
            login(self.request, authenticated_user)
            return super().form_valid(form)
        else:
            # Handle invalid login case
            return super().form_invalid(form)


@method_decorator(login_required, name='dispatch')
class HomeView(TemplateView):
    template_name = 'accounts/home.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Home Page'
        context['welcome_message'] = 'Welcome to the home page!'
        return context
    

class RegistrationView(FormView):
    template_name = 'accounts/registration.html'
    form_class = RegistrationForm
    success_url = '/accounts/home/'  # Redirect to the home page after successful registration

    def form_valid(self, form):
    # Create a new user using the form data
        username = form.cleaned_data['username']
        password = form.cleaned_data['password1']
        create_user(username, password)

    # Log in the user
        user = User.objects.get(username=username)  # Fetch the newly created user
        login(self.request, user)

        return super().form_valid(form)
    
class SearchFriends(View):
    template_name = 'accounts/search_friends.html'

    def get(self, request, *args, **kwargs):
        friend_name = request.GET.get('friend-name', '')
        if friend_name:
            friends = User.objects.filter(username__icontains=friend_name)
        else:
            friends = []

        context = {
            'friend_name': friend_name,
            'friends': friends,
        }
        return render(request, self.template_name, context)