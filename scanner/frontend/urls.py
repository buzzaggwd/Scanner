from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('dictionary/', views.dictionary, name='dictionary'),
    path('levels/', views.levels, name='levels'),
    path('level/<int:level_id>/', views.level, name='level'),
    path('profile/', views.profile, name='profile'),
    path('ar_scanner/', views.ar_scanner, name='ar_scanner'),
]