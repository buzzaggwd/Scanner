from django.urls import path
from . import views

urlpatterns = [
    path('api/scan/', views.process_scan, name='process_scan'),
    path('api/translate/', views.translate_text, name='translate_text'),
]
