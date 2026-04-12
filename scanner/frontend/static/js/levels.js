document.addEventListener('DOMContentLoaded', function () {
    const levelCards = document.querySelectorAll('.level-card');
    const levelImage = document.getElementById('level-image');
    const levelDetail = document.getElementById('level-detail');
    const detailTitle = document.getElementById('detail-title');
    const detailDescription = document.getElementById('detail-description');
    const detailProgress = document.getElementById('detail-progress');
    const detailProgressText = document.getElementById('detail-progress-text');
    const detailFeatures = document.getElementById('detail-features');

    const levelData = {
        'HSK 1': {
            title: 'HSK 1 — Базовый',
            description: 'Базовый уровень китайского языка, включающий основные слова и грамматику.',
            progress: 65,
            features: [
                '150 базовых слов',
                'Основные грамматические конструкции',
                'Простые диалоги',
                'Базовые фразы для повседневного общения'
            ]
        },
        'HSK 2': {
            title: 'HSK 2 — Средний',
            description: 'Средний уровень китайского языка, расширяющий словарный запас и грамматику.',
            progress: 0,
            features: [
                '300 дополнительных слов',
                'Усложненные грамматические конструкции',
                'Более сложные диалоги',
                'Фразы для различных ситуаций'
            ]
        },
        'HSK 3': {
            title: 'HSK 3 — Продвинутый',
            description: 'Продвинутый уровень китайского языка, включающий более сложные темы и выражения.',
            progress: 0,
            features: [
                '600 дополнительных слов',
                'Сложные грамматические конструкции',
                'Длинные тексты и диалоги',
                'Фразы для профессионального общения'
            ]
        }
    };

    levelCards.forEach(card => {
        card.addEventListener('click', function () {
            // Удаляем активный класс у всех карточек
            levelCards.forEach(c => c.classList.remove('active'));
            // Добавляем активный класс к выбранной карточке
            this.classList.add('active');

            // Получаем название уровня из заголовка
            const levelTitle = this.querySelector('.level-title').textContent;
            const levelKey = levelTitle.split(' — ')[0];
            const data = levelData[levelKey];

            // Обновляем детальную информацию
            detailTitle.textContent = data.title;
            detailDescription.textContent = data.description;
            detailProgress.style.width = data.progress + '%';
            detailProgressText.textContent = data.progress + '%';

            // Обновляем список особенностей
            detailFeatures.innerHTML = '';
            data.features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                detailFeatures.appendChild(li);
            });

            // Скрываем изображение и показываем детальную информацию
            levelImage.style.display = 'none';
            levelDetail.style.display = 'flex';
        });
    });
});
