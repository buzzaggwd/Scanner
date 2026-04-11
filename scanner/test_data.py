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
    {'word': '笔记本电脑', 'transcription': 'bǐjìběn diànnǎo', 'translation': 'ноутбук', 'audio_url': ''},
    {'word': '手机', 'transcription': 'shǒujī', 'translation': 'телефон', 'audio_url': ''},
    {'word': '书', 'transcription': 'shū', 'translation': 'книга', 'audio_url': ''},
    {'word': '桌子', 'transcription': 'zhuōzi', 'translation': 'стол', 'audio_url': ''},
    {'word': '椅子', 'transcription': 'yǐzi', 'translation': 'стул', 'audio_url': ''}
]

for word_data in test_words:
    vocab, created = Vocabulary.objects.get_or_create(
        word=word_data['word'],
        defaults=word_data
    )
    if created:
        print(f"Created word: {vocab.word} - {vocab.translation}")
    else:
        print(f"Word already exists: {vocab.word} - {vocab.translation}")

print("Test data check completed!")
