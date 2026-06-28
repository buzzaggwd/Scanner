from django.utils.deprecation import MiddlewareMixin
from .models import User
import uuid

class GuestUserMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Игнорируем запросы к админке и API, где нужен осознанный вход
        if request.path.startswith('/admin/') or request.path.startswith('/static/'):
            return None

        # Пытаемся получить user_id из сессии
        user_id = request.session.get('guest_user_id')

        if user_id:
            try:
                # Если пользователь есть в БД, прикрепляем его к запросу
                user = User.objects.get(id=user_id)
                request.user = user
                return None
            except User.DoesNotExist:
                # Если пользователь вдруг удален, создаем нового
                pass

        # Создаем нового пользователя
        new_user = User.objects.create(
            session_key=request.session.session_key or str(uuid.uuid4()),
            username=f'User_{User.objects.count() + 1}' # Генерируем имя, например, User_123
        )
        # Сохраняем ID нового пользователя в сессии
        request.session['guest_user_id'] = new_user.id
        request.user = new_user
        return None