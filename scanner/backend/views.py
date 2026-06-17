from django.shortcuts import render
from django.http import JsonResponse
from .models import User, Vocabulary, User_to_vocab
from .utils import get_yandex_translation
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def get_word_details(request, word_id):
    if request.method == 'GET':
        try:
            word = Vocabulary.objects.get(id=word_id)
            
            # Парсим примеры (они хранятся через ;)
            examples = []
            if word.example_sentences:
                example_pairs = word.example_sentences.split(';')
                for pair in example_pairs:
                    parts = pair.split('|')
                    if len(parts) >= 2:
                        examples.append({
                            'chinese': parts[0].strip(),
                            'translation': parts[1].strip()
                        })
            
            return JsonResponse({
                'status': 'success',
                'id': word.id,
                'word': word.word,
                'translation_cn': word.translation_cn,
                'transcription': word.transcription,
                'translation_eng': word.translation_eng,
                'audio_url': word.audio_url,
                'examples': examples
            })
        except Vocabulary.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Word not found'}, status=404)

@csrf_exempt
def process_scan(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        word_text = data.get('word').lower()
        telegram_id = data.get('telegram_id')

        try:
            # Проверяем, существует ли пользователь
            user = User.objects.get(telegram_id=telegram_id)
            
            # Ищем слово в базе данных
            vocab_entry = Vocabulary.objects.filter(word__iexact=word_text).first()
            
            if not vocab_entry:
                return JsonResponse({'status': 'error', 'message': 'Word not found in database'}, status=404)

            # Проверяем, есть ли слово уже в словаре пользователя
            is_in_vocab = User_to_vocab.objects.filter(
                user_id=user, 
                word_id=vocab_entry
            ).exists()

            return JsonResponse({
                'status': 'success',
                'word': vocab_entry.word,
                'word_id': vocab_entry.id,
                'translation': vocab_entry.translation_cn,
                'is_in_vocab': is_in_vocab,
                'total_xp': user.experience_points
            })

        except User.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

@csrf_exempt
def add_to_vocab(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        word_id = data.get('word_id')
        telegram_id = data.get('telegram_id')

        try:
            user = User.objects.get(telegram_id=telegram_id)
            vocab_entry = Vocabulary.objects.get(id=word_id)
            
            # Проверяем, есть ли уже слово в словаре пользователя
            user_word, created = User_to_vocab.objects.get_or_create(
                user_id=user, 
                word_id=vocab_entry
            )

            if created:
                # Начисляем очки опыта за новое слово
                xp_gain = 50
                user.experience_points += xp_gain
                user.save()
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Word added to vocabulary',
                    'xp_gained': xp_gain,
                    'total_xp': user.experience_points
                })
            else:
                return JsonResponse({
                    'status': 'success',
                    'message': 'Word already in vocabulary',
                    'xp_gained': 0,
                    'total_xp': user.experience_points
                })

        except User.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)
        except Vocabulary.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Word not found'}, status=404)

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