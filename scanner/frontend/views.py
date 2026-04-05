from django.shortcuts import render

def home(request):
    return render(request, "home.html")

def dictionary(request):
    return render(request, "dictionary.html")

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