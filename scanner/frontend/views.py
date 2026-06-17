from django.shortcuts import render
from django.http import JsonResponse
from backend.models import Vocabulary, User, User_to_vocab
from django.utils import timezone
from datetime import date
import json

def home(request):
    return render(request, "home.html", {'active_page': 'home'})

def dictionary(request):
    # Получаем тестового пользователя
    test_user = User.objects.filter(username='test_user').first()
    
    if test_user:
        # Получаем слова, которые добавил пользователь через user_to_vocab
        user_vocab = User_to_vocab.objects.filter(user_id=test_user)
        word_ids = user_vocab.values_list('word_id', flat=True)
        words = Vocabulary.objects.filter(id__in=word_ids)
    else:
        # Если пользователя нет, показываем пустой список
        words = Vocabulary.objects.none()
    
    # Подготовка данных слов для JavaScript
    words_data = []
    for word in words:
        # Парсинг примеров из поля example_sentences
        # Формат: китайский1|перевод1;китайский2|перевод2;...
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
            'examples': examples
        })
    
    return render(request, "dictionary.html", {
        'words': words,
        'words_json': json.dumps(words_data),
        'active_page': 'dictionary'
    })

def levels(request):
    return render(request, "levels.html", {'active_page': 'levels'})

def level(request, level_id):
    # Моковые данные для уровней HSK
    level_data = {
        1: {'name': 'Базовый', 'progress': 25, 'lessons': [
            {'id': 1, 'number': 1, 'title': 'Предметы в моей комнате', 'description': 'Сканируйте и узнавайте названия бытовых предметов', 'status': 'completed'},
            {'id': 2, 'number': 2, 'title': 'Еда и напитки', 'description': 'Сканируйте продукты в кухне и узнавайте их названия', 'status': 'available'},
            {'id': 3, 'number': 3, 'title': 'Одежда и аксессуары', 'description': 'Распознавайте одежду и украшения с помощью сканера', 'status': 'available'},
            {'id': 4, 'number': 4, 'title': 'Техника и гаджеты', 'description': 'Узнавайте названия электроники и устройств', 'status': 'locked'},
            {'id': 5, 'number': 5, 'title': 'Товары в магазине', 'description': 'Сканируйте товары при покупках в магазине', 'status': 'locked'},
        ]},
        2: {'name': 'Средний', 'progress': 0, 'lessons': [
            {'id': 6, 'number': 1, 'title': 'Работа и карьера', 'description': 'Обсудите свою профессиональную жизнь', 'status': 'available'},
            {'id': 7, 'number': 2, 'title': 'Хобби и увлечения', 'description': 'Поделитесь своими увлечениями', 'status': 'locked'},
        ]},
        3: {'name': 'Продвинутый', 'progress': 0, 'lessons': [
            {'id': 8, 'number': 1, 'title': 'Бизнес-коммуникация', 'description': 'Изучите деловой китайский', 'status': 'available'},
            {'id': 9, 'number': 2, 'title': 'Политика и культура', 'description': 'Обсудите актуальные темы', 'status': 'locked'},
        ]},
    }
    
    data = level_data.get(level_id, level_data[1])
    return render(request, "level.html", {
        'active_page': 'levels',
        'level_number': level_id,
        'level_name': data['name'],
        'progress': data['progress'],
        'lessons': data['lessons']
    })


def profile(request):
    # Получаем тестового пользователя
    test_user = User.objects.filter(username='test_user').first()
    
    if test_user:
        # Общее количество слов
        total_words = User_to_vocab.objects.filter(user_id=test_user).count()
        
        # Количество слов, добавленных сегодня
        today = date.today()
        words_today = User_to_vocab.objects.filter(
            user_id=test_user,
            created_at__date=today
        ).count()
        
        # Общий опыт
        experience_points = test_user.experience_points
    else:
        total_words = 0
        words_today = 0
        experience_points = 0
    
    return render(request, "profile.html", {
        'active_page': 'profile',
        'total_words': total_words,
        'words_today': words_today,
        'experience_points': experience_points
    })

def ar_scanner(request):
    return render(request, "ar_scanner.html", {'active_page': 'home'})