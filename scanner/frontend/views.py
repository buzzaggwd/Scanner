from django.shortcuts import render
from backend.models import Vocabulary

def home(request):
    return render(request, "home.html")

def dictionary(request):
    words = Vocabulary.objects.all()
    return render(request, "dictionary.html", {'words': words})

def word(request):
    return render(request, "word.html")

def levels(request):
    return render(request, "levels.html")

def level(request):
    return render(request, "level.html")

def profile(request):
    return render(request, "profile.html")

def ar_scanner(request):
    return render(request, "ar_scanner.html")