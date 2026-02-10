from django.contrib import admin
from .models import User, Vocabulary, User_to_vocab, Ar_markers, Lessons, Lesson_content, User_to_lessons

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'telegram_id', 'username', 'avatar_url', 'experience_points', 'created_at', 'updated_at')

@admin.register(Vocabulary)
class VocabularyAdmin(admin.ModelAdmin):
    list_display = ('id', 'word', 'transcription', 'translation', 'audio_url', 'example_sentences', 'created_at', 'updated_at')

@admin.register(User_to_vocab)
class User_to_vocabAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id', 'word_id', 'created_at', 'updated_at')

@admin.register(Ar_markers)
class Ar_markersAdmin(admin.ModelAdmin):
    list_display = ('id', 'image_hash', 'coordinates', 'description', 'type', 'created_at', 'updated_at')

@admin.register(Lessons)
class LessonsAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'description', 'difficulty', 'status', 'created_at', 'updated_at')

@admin.register(Lesson_content)
class Lesson_contentAdmin(admin.ModelAdmin):
    list_display = ('id', 'lesson_id', 'word_id', 'created_at', 'updated_at')

@admin.register(User_to_lessons)
class User_to_lessonsAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id', 'lesson_id', 'start_date', 'completion_date', 'score', 'created_at', 'updated_at')
