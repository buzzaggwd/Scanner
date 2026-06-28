from django.shortcuts import render
from django.http import JsonResponse
from backend.models import Vocabulary, User, User_to_vocab
from django.utils import timezone
from datetime import date
import json

def home(request):
    # Получаем тестового пользователя
    test_user = User.objects.filter(username='test_user').first()
    
    # Количество слов пользователя из user_to_vocab
    if test_user:
        user_words_count = User_to_vocab.objects.filter(user_id=test_user).count()
    else:
        user_words_count = 0
    
    # Общее количество слов в vocabulary
    total_vocab_count = Vocabulary.objects.count()
    
    return render(request, "home.html", {
        'active_page': 'home',
        'user_words_count': user_words_count,
        'total_vocab_count': total_vocab_count
    })

def dictionary(request):
    # Получаем тестового пользователя
    user = request.user
    if not user:
        # если пользователь не найден (например, сессия протухла)
        return render(request, "dictionary.html", {'words': [], 'words_json': '[]'})
    
    if user:
        # Получаем слова, которые добавил пользователь через user_to_vocab
        user_vocab = User_to_vocab.objects.filter(user_id=user)
        word_ids = user_vocab.values_list('word_id', flat=True)
        words = Vocabulary.objects.filter(id__in=word_ids)
        # Создаем словарь для быстрого доступа к статусам
        word_status_dict = {uv.word_id_id: uv.status for uv in user_vocab}
    else:
        # Если пользователя нет, показываем пустой список
        words = Vocabulary.objects.none()
        word_status_dict = {}
    
    # Подготовка данных слов для JavaScript
    words_data = []
    for word in words:
        # Парсинг примеров из поля example_sentences
        # Формат: китайский1|перевод1;китайский2|перевод2;...
        examples = []
        if word.example_sentences:
            example_list = word.example_sentences.split(';')
            for i in range(0, len(example_list), 2):
                if i + 1 < len(example_list):
                    chinese = example_list[i].strip()
                    translation = example_list[i + 1].strip()
                    if chinese and translation:
                        examples.append({'chinese': chinese, 'translation': translation})
        
        # Отладка: проверяем статус
        current_status = word_status_dict.get(word.id, 'learning')
        print(f"Word {word.id}: {word.word} - status: {current_status}")
        
        words_data.append({
            'id': word.id,
            'word': word.word,
            'transcription': word.transcription,
            'translation_eng': word.translation_eng,
            'translation_cn': word.translation_cn,
            'audio_url': word.audio_url,
            'examples': examples,
            'status': current_status
        })
    
    return render(request, "dictionary.html", {
        'words': words_data,
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
            {'id': 3, 'number': 3, 'title': 'Одежда и аксессуары', 'description': 'Распознавайте одежду и украшения с помощью сканера', 'status': 'locked'},
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


def lesson(request, lesson_id):
    # Моковые данные для урока
    lessons = {
        1: {
            'id': 1,
            'number': 1,
            'title': 'Предметы в моей комнате',
            'description': 'Сканируйте и узнавайте названия бытовых предметов'
        },
        2: {
            'id': 2,
            'number': 2,
            'title': 'Еда и напитки',
            'description': 'Сканируйте продукты в кухне и узнавайте их названия'
        },
        3: {
            'id': 3,
            'number': 3,
            'title': 'Одежда и аксессуары',
            'description': 'Распознавайте одежду и украшения с помощью сканера'
        }
    }
    
    current_lesson = lessons.get(lesson_id, {'id': lesson_id, 'number': lesson_id, 'title': 'Урок', 'description': ''})
    
    return render(request, "lesson.html", {'lesson': current_lesson})


def profile(request):
    # Получаем текущего пользователя
    user = request.user
    
    if user:
        # Общее количество слов
        total_words = User_to_vocab.objects.filter(user_id=user).count()
        
        # Количество слов, добавленных сегодня
        today = date.today()
        words_today = User_to_vocab.objects.filter(
            user_id=user,
            created_at__date=today
        ).count()
        
        # Общий опыт
        experience_points = user.experience_points
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