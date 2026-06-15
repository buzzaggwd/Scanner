// Функция для открытия модального окна выбора темы
function openThemesModal() {
    document.getElementById('themes-modal').classList.add('active');
}

// Функция для закрытия модального окна выбора темы
function closeThemesModal() {
    document.getElementById('themes-modal').classList.remove('active');
}

// Функция для применения выбранной темы
function applyTheme(themeName) {
    const body = document.body;
    
    // Удаляем все классы тем
    body.classList.remove('blue-theme', 'orange-theme', 'purple-theme', 'green-theme');
    
    // Добавляем выбранную тему
    if (themeName !== 'green') {
        body.classList.add(themeName + '-theme');
    }
    
    // Обновляем активные карточки тем
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-theme="${themeName}"]`).classList.add('active');
    
    // Обновляем индикаторы выбора
    document.querySelectorAll('.theme-check').forEach(check => {
        check.textContent = '';
    });
    document.getElementById(`${themeName}-check`).textContent = '✓';
    
    // Сохраняем тему в localStorage
    localStorage.setItem('selectedTheme', themeName);
    
    // Закрываем модалку
    closeThemesModal();
}

// Инициализация темы при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Получаем сохраненную тему из localStorage
    const savedTheme = localStorage.getItem('selectedTheme') || 'green';
    
    // Применяем сохраненную тему
    applyTheme(savedTheme);
    
    // Добавляем обработчик для кнопки "Сменить тему"
    const themeBtn = document.querySelector('.theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', openThemesModal);
    }
});
