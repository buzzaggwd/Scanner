from django.shortcuts import render
from django.http import JsonResponse
from .models import User, Vocabulary, User_to_vocab
from .utils import get_yandex_translation
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def process_scan(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        word_text = data.get('word').lower()
        telegram_id = data.get('telegram_id')

        try:
            user = User.objects.get(telegram_id=telegram_id)
            vocab_entry = Vocabulary.objects.filter(word__iexact=word_text).first()
            
            if not vocab_entry:
                return JsonResponse({'status': 'error', 'message': 'Word not found in database'}, status=404)

            user_word, created = User_to_vocab.objects.get_or_create(
                user_id=user, 
                word_id=vocab_entry
            )

            xp_gain = 50 if created else 5
            user.experience_points += xp_gain
            user.save()

            return JsonResponse({
                'status': 'success',
                'word': vocab_entry.word,
                'translation': vocab_entry.translation,
                'xp_gained': xp_gain,
                'total_xp': user.experience_points
            })

        except User.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

@csrf_exempt
def translate_text(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        text = data.get('text')
        target_lang = data.get('target_lang', 'zh')

        if not text:
            return JsonResponse({'status': 'error', 'message': 'Text is required'}, status=400)

        translation = get_yandex_translation(text, target_lang)

        if translation:
            return JsonResponse({
                'status': 'success',
                'text': text,
                'translation': translation,
                'target_lang': target_lang
            })
        else:
            return JsonResponse({'status': 'error', 'message': 'Translation failed'}, status=500)