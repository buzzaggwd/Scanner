from django.shortcuts import render
from backend.models import Vocabulary

def home(request):
    return render(request, "home.html", {'active_page': 'home'})

def dictionary(request):
    words = Vocabulary.objects.all()
    return render(request, "dictionary.html", {'words': words, 'active_page': 'dictionary'})

def levels(request):
    return render(request, "levels.html", {'active_page': 'levels'})

def level(request, level_id):
    # Моковые данные для уровней HSK
    level_data = {
        1: {'name': 'Базовый', 'progress': 25, 'lessons': [
            {'id': 1, 'number': 1, 'title': 'Приветствие и знакомство', 'description': 'Научитесь приветствовать и представляться', 'status': 'completed'},
            {'id': 2, 'number': 2, 'title': 'Числа и время', 'description': 'Изучите основные числа и времена суток', 'status': 'available'},
            {'id': 3, 'number': 3, 'title': 'Еда и напитки', 'description': 'Узнайте названия продуктов и закажите в кафе', 'status': 'available'},
            {'id': 4, 'number': 4, 'title': 'Моя семья', 'description': 'Расскажите о своей семье', 'status': 'locked'},
            {'id': 5, 'number': 5, 'title': 'Путешествия', 'description': 'Запланируйте поездку по Китаю', 'status': 'locked'},
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
    return render(request, "profile.html", {'active_page': 'profile'})

def ar_scanner(request):
    return render(request, "ar_scanner.html", {'active_page': 'home'})