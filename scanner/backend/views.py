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
            return JsonResponse({'status': 'error', 'message': 'Слово не найдено'}, status=404)

@csrf_exempt
def process_scan(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        word_text = data.get('word').lower()

        try:
            # Проверяем, существует ли пользователь
            user = request.user
            if not user:
                return JsonResponse({'status': 'error', 'message': 'Пользователь не найден'}, status=404)
            
            # Ищем слово в базе данных
            vocab_entry = Vocabulary.objects.filter(word__iexact=word_text).first()
            
            if not vocab_entry:
                return JsonResponse({'status': 'error', 'message': 'Слово не найдено в базе'}, status=404)

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
            return JsonResponse({'status': 'error', 'message': 'Пользователь не найден'}, status=404)

@csrf_exempt
def add_to_vocab(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            word_id = data.get('word_id')
            
            # Находим пользователя по telegram_id
            user = request.user
            if not user:
                return JsonResponse({'status': 'error', 'message': 'Пользователь не найден'}, status=404)
            
            # Находим слово
            word = Vocabulary.objects.filter(id=word_id).first()
            if not word:
                return JsonResponse({'status': 'error', 'message': 'Слово не найдено'})
            
            # Проверяем, не добавлено ли слово уже
            existing = User_to_vocab.objects.filter(user_id=user, word_id=word).first()
            if existing:
                return JsonResponse({
                    'status': 'success', 
                    'message': 'Слово уже в словаре',
                    'xp_gained': 0
                })
            
            # Добавляем слово в словарь пользователя
            user_to_vocab = User_to_vocab.objects.create(
                user_id=user,
                word_id=word
            )
            
            # Начисляем опыт
            user.experience_points += 50
            user.save()
            
            # Возвращаем данные добавленного слова
            word_data = {
                'id': word.id,
                'word': word.word,
                'transcription': word.transcription,
                'translation_eng': word.translation_eng,
                'translation_cn': word.translation_cn,
                'audio_url': word.audio_url,
                'examples': []
            }
            
            # Парсинг примеров
            if word.example_sentences:
                example_pairs = word.example_sentences.split(';')
                for pair in example_pairs:
                    parts = pair.split('|')
                    if len(parts) >= 2:
                        chinese = parts[0].strip()
                        translation = parts[1].strip()
                        if chinese and translation:
                            word_data['examples'].append({
                                'chinese': chinese,
                                'translation': translation
                            })
            
            return JsonResponse({
                'status': 'success',
                'message': 'Слово добавлено в словарь',
                'xp_gained': 50,
                'word': word_data
            })
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    
    return JsonResponse({'status': 'error', 'message': 'Неверный метод запроса'})

@csrf_exempt
def get_user_vocab(request):
    if request.method == 'GET':
        try:            
            # Находим пользователя по telegram_id
            user = request.user
            if not user:
                return JsonResponse({'status': 'error', 'message': 'Пользователь не найден'})
            
            # Получаем слова пользователя
            user_vocab = User_to_vocab.objects.filter(user_id=user)
            word_ids = user_vocab.values_list('word_id', flat=True)
            words = Vocabulary.objects.filter(id__in=word_ids)
            
            # Подготовка данных слов
            words_data = []
            for word in words:
                examples = []
                if word.example_sentences:
                    example_pairs = word.example_sentences.split(';')
                    for pair in example_pairs:
                        parts = pair.split('|')
                        if len(parts) >= 2:
                            chinese = parts[0].strip()
                            translation = parts[1].strip()
                            if chinese and translation:
                                examples.append({
                                    'chinese': chinese,
                                    'translation': translation
                                })
                
                words_data.append({
                    'id': word.id,
                    'word': word.word,
                    'transcription': word.transcription,
                    'translation_eng': word.translation_eng,
                    'translation_cn': word.translation_cn,
                    'audio_url': word.audio_url,
                    'examples': word.examples_sentences
                })
            
            return JsonResponse({
                'status': 'success',
                'words': words_data
            })
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    
    return JsonResponse({'status': 'error', 'message': 'Неверный метод запроса'})

@csrf_exempt
def update_word_status(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            word_id = data.get('word_id')

            # Находим пользователя
            user = request.user
            if not user:
                return JsonResponse({'status': 'error', 'message': 'Пользователь не найден'})

            # Находим слово
            word = Vocabulary.objects.filter(id=word_id).first()
            if not word:
                return JsonResponse({'status': 'error', 'message': 'Слово не найдено'})

            # Находим запись в user_to_vocab
            user_vocab = User_to_vocab.objects.filter(user_id=user, word_id=word).first()
            if not user_vocab:
                return JsonResponse({'status': 'error', 'message': 'Слово не в словаре пользователя'})

            # Переключаем статус
            new_status = 'learned' if user_vocab.status == 'learning' else 'learning'
            user_vocab.status = new_status
            user_vocab.save()

            return JsonResponse({
                'status': 'success',
                'new_status': new_status,
                'message': f'Статус изменен на {"выученное" if new_status == "learned" else "изучаемое"}'
            })

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    return JsonResponse({'status': 'error', 'message': 'Неверный метод запроса'})

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

@csrf_exempt
def get_user_vocabulary(request):
    if request.method != 'GET':
        return JsonResponse({'status': 'error', 'message': 'Метод не разрешен'}, status=405)

    user = request.user
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Пользователь не найден'}, status=404)

    user_words = Vocabulary.objects.filter(
        user_to_vocab__user_id=user
    ).values(
        'id', 'word', 'transcription', 'translation_eng', 'translation_cn', 'audio_url'
    )

    words_list = list(user_words)

    return JsonResponse({
        'status': 'success',
        'words': words_list,
        'total': len(words_list)
    })