from django.urls import path
from . import views

urlpatterns = [
    path('scan/', views.process_scan, name='process_scan'),
    path('translate/', views.translate_text, name='translate_text'),
    path('word/<int:word_id>/', views.get_word_details, name='get_word_details'),
    path('add_to_vocab/', views.add_to_vocab, name='add_to_vocab'),
    path('vocab/', views.get_user_vocab, name='get_user_vocab'),
]
