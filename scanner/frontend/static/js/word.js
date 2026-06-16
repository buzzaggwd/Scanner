// Функция для отображения деталей слова
function showWordDetails(wordId) {
    const word = wordsData.find(w => w.id === wordId);
    if (!word) return;

    document.getElementById('detail-chinese').textContent = word.translation_cn;
    document.getElementById('detail-transcription').textContent = word.transcription;
    document.getElementById('detail-translation').textContent = word.word;

    // Очистка и отображение примеров
    const examplesContainer = document.getElementById('detail-examples');
    examplesContainer.innerHTML = '';

    if (word.examples && word.examples.length > 0) {
        word.examples.forEach(example => {
            const exampleDiv = document.createElement('div');
            exampleDiv.className = 'example';
            exampleDiv.innerHTML = `
                <div class="example-chinese">${example.chinese}</div>
                <div class="example-translation">${example.translation}</div>
            `;
            examplesContainer.appendChild(exampleDiv);
        });
    }
}

// Функция для закрытия деталей
function closeWordDetails() {
    document.getElementById('word-details-modal').style.display = 'none';
}

// Добавляем обработчики кликов на слова
document.addEventListener('DOMContentLoaded', function () {
    const wordItems = document.querySelectorAll('.dictionary-word-item');

    wordItems.forEach(item => {
        item.addEventListener('click', function () {
            // Убираем активный класс со всех элементов
            wordItems.forEach(w => w.classList.remove('active'));
            // Добавляем активный класс на текущий элемент
            this.classList.add('active');

            // Показываем детали слова
            const wordId = parseInt(this.getAttribute('data-word-id'));
            showWordDetails(wordId);

            // Показываем модальное окно
            document.getElementById('word-details-modal').style.display = 'block';
        });
    });

    // Показываем детали первого слова при загрузке
    if (wordItems.length > 0) {
        const firstWordId = parseInt(wordItems[0].getAttribute('data-word-id'));
        showWordDetails(firstWordId);
        document.getElementById('word-details-modal').style.display = 'block';
    }
});