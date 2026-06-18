from django.db import models
from torch import default_generator

class User(models.Model):
    id = models.AutoField(primary_key=True)
    telegram_id = models.IntegerField(unique=True)
    username = models.CharField(max_length=255, unique=True)
    avatar_url = models.CharField(max_length=255, blank=True, null=True)
    experience_points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        
class Vocabulary(models.Model):
    id = models.AutoField(primary_key=True)
    word = models.CharField(max_length=255)
    transcription = models.CharField(max_length=255)
    translation_eng = models.CharField(max_length=255)
    translation_cn = models.CharField(max_length=255)
    audio_url = models.CharField(max_length=255)
    example_sentences = models.TextField(blank=True, null=True) # Будем через ; записывать примеры
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vocabulary'

class User_to_vocab(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    word_id = models.ForeignKey(Vocabulary, on_delete=models.CASCADE)
    status = models.CharField(max_length=255, default='learning')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_to_vocab'

class Ar_markers(models.Model):
    id = models.AutoField(primary_key=True)
    image_hash = models.CharField(max_length=255)
    coordinates = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ar_markers'

class Lessons(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    difficulty = models.CharField(max_length=255)
    status = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lessons'

class Lesson_content(models.Model):
    id = models.AutoField(primary_key=True)
    lesson_id = models.ForeignKey(Lessons, on_delete=models.CASCADE)
    word_id = models.ForeignKey(Vocabulary, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lesson_content'

class User_to_lessons(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson_id = models.ForeignKey(Lessons, on_delete=models.CASCADE)
    start_date = models.DateTimeField(auto_now_add=True)
    completion_date = models.DateTimeField(blank=True, null=True)
    score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_to_lessons'