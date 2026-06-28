// profile.js

// --- Загрузка аватара ---
document.addEventListener('DOMContentLoaded', function () {
    const avatarInput = document.getElementById('avatar-input');
    if (avatarInput) {
        avatarInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('avatar', file);

            fetch('/update-avatar/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    document.getElementById('profile-avatar').src = data.avatar_url;
                } else {
                    alert('Ошибка: ' + data.message);
                }
            })
            .catch(error => console.error('Ошибка загрузки аватара:', error));
        });
    }

    // --- Редактирование имени (inline) ---
    const usernameDisplay = document.getElementById('username-display');
    const usernameInput = document.getElementById('username-input');
    const usernameWrapper = document.getElementById('profile-username');

    if (!usernameDisplay || !usernameInput || !usernameWrapper) {
        console.error('Элементы для редактирования имени не найдены!');
        return;
    }

    // Клик по имени -> показываем инпут
    usernameWrapper.addEventListener('click', function(e) {
        if (e.target === usernameInput) return; // игнорируем клик по инпуту
        
        console.log('Режим редактирования активирован');
        usernameDisplay.style.display = 'none';
        usernameInput.style.display = 'inline-block';
        usernameInput.value = usernameDisplay.textContent.trim();
        usernameInput.focus();
        usernameInput.select();
    });

    // Сохраняем по Enter
    usernameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveUsernameInline();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            cancelEditUsername();
        }
    });

    // Сохраняем при потере фокуса
    usernameInput.addEventListener('blur', function() {
        setTimeout(saveUsernameInline, 150);
    });

    function saveUsernameInline() {
        const newName = usernameInput.value.trim();
        if (!newName) {
            alert('Имя не может быть пустым');
            cancelEditUsername();
            return;
        }

        if (newName === usernameDisplay.textContent.trim()) {
            cancelEditUsername();
            return;
        }

        fetch('/update-username/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ username: newName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                usernameDisplay.textContent = data.username;
                cancelEditUsername();
            } else {
                alert('Ошибка: ' + data.message);
                cancelEditUsername();
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при сохранении');
            cancelEditUsername();
        });
    }

    function cancelEditUsername() {
        usernameDisplay.style.display = 'inline';
        usernameInput.style.display = 'none';
        usernameInput.value = usernameDisplay.textContent.trim();
    }
});

// --- Вспомогательная функция для CSRF-токена ---
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}