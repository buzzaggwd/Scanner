import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scanner.settings')
django.setup()

from backend.models import User, Vocabulary

user, created = User.objects.get_or_create(
    telegram_id=123456789,
    defaults={
        'username': 'test_user',
        'experience_points': 0
    }
)

if created:
    print(f"Created user: {user.username}")
else:
    print(f"User already exists: {user.username}")

test_words = [
    {
        'word': '笔记本电脑', 
        'transcription': 'bǐjìběn diànnǎo', 
        'translation_eng': 'laptop',
        'translation_cn': '笔记本电脑',
        'audio_url': '',
        'status': 'active',
        'example_sentences': '我有一台笔记本电脑|У меня есть ноутбук;笔记本电脑很方便|Ноутбук очень удобный'
    },
    {
        'word': '手机', 
        'transcription': 'shǒujī', 
        'translation_eng': 'phone',
        'translation_cn': '手机',
        'audio_url': '',
        'status': 'active',
        'example_sentences': '我的手机坏了|Мой телефон сломался;我在用手机|Я пользуюсь телефоном'
    },
    {
        'word': '书', 
        'transcription': 'shū', 
        'translation_eng': 'book',
        'translation_cn': '书',
        'audio_url': '',
        'status': 'active',
        'example_sentences': '这本书很好|Эта книга очень хорошая;我喜欢读书|Я люблю читать книги'
    },
    {
        'word': '桌子', 
        'transcription': 'zhuōzi', 
        'translation_eng': 'table',
        'translation_cn': '桌子',
        'audio_url': '',
        'status': 'active',
        'example_sentences': '桌子上有一本书|На столе лежит книга;这张桌子很大|Этот стол большой'
    },
    {
        'word': '椅子', 
        'transcription': 'yǐzi', 
        'translation_eng': 'chair',
        'translation_cn': '椅子',
        'audio_url': '',
        'status': 'active',
        'example_sentences': '请坐椅子上|Садитесь на стул;椅子很舒服|Стул очень удобный'
    }
]

for word_data in test_words:
    vocab, created = Vocabulary.objects.update_or_create(
        word=word_data['word'],
        defaults=word_data
    )
    if created:
        print(f"Created word: {vocab.word} - {vocab.translation}")
    else:
        print(f"Word already exists: {vocab.word} - {vocab.translation}")

print("Test data check completed!")
