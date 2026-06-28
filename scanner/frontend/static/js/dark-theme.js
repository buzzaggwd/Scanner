document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('theme-toggle'); // Кнопка переключения
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Применяем тему при загрузке
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (toggleButton) toggleButton.textContent = '🌙';
    } else {
        document.body.classList.remove('dark-theme');
        if (toggleButton) toggleButton.textContent = '☀️';
    }

    // Обработчик клика по кнопке
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            this.textContent = isDark ? '🌙' : '☀️';
        });
    }
});

// ===== УПРАВЛЕНИЕ ТЕМОЙ =====
document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    // При загрузке проверяем сохранённую тему
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        toggle.checked = true;
    }

    // Переключение темы
    toggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    });
});