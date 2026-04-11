from django.shortcuts import render
from backend.models import Vocabulary

def home(request):
    return render(request, "home.html", {'active_page': 'home'})

def dictionary(request):
    words = Vocabulary.objects.all()
    return render(request, "dictionary.html", {'words': words, 'active_page': 'dictionary'})

def word(request):
    return render(request, "word.html", {'active_page': 'word'})

def levels(request):
    return render(request, "levels.html", {'active_page': 'levels'})

def level(request):
    return render(request, "level.html", {'active_page': 'levels'})

def profile(request):
    return render(request, "profile.html", {'active_page': 'profile'})

def ar_scanner(request):
    return render(request, "ar_scanner.html", {'active_page': 'home'})