// Функция для отображения деталей слова
function showWordDetails(wordId) {
    console.log('wordsData:', window.wordsData);
    console.log('wordId:', wordId);
    const word = window.wordsData.find(w => w.id === wordId);
    console.log('found word:', word);
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

// Функция для фильтрации слов по поисковому запросу
function filterWords(searchQuery) {
    const wordItems = document.querySelectorAll('.dictionary-word-item');
    const query = searchQuery.toLowerCase().trim();

    wordItems.forEach(item => {
        const wordChinese = item.querySelector('.word-chinese').textContent.toLowerCase();
        const wordTranslation = item.querySelector('.word-translation').textContent.toLowerCase();

        if (wordChinese.includes(query) || wordTranslation.includes(query)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });

    // После фильтрации показываем первое видимое слово
    const visibleItems = document.querySelectorAll('.dictionary-word-item[style="display: block;"]');
    if (visibleItems.length > 0) {
        const firstVisibleId = parseInt(visibleItems[0].getAttribute('data-word-id'));
        showWordDetails(firstVisibleId);
        document.getElementById('word-details-modal').style.display = 'block';
    }
}

function filterStatus(searchQuery) {
    const wordItems = document.querySelectorAll('.dictionary-word-item');
    const query = searchQuery.toLowerCase().trim();

    // Обновляем активный класс на кнопках
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Находим кнопку, которая вызвала функцию, и добавляем ей active
    event.target.classList.add('active');

    // Фильтруем слова
    wordItems.forEach(item => {
        const wordStatus = item.querySelector('.word-status').classList[1];
        if (query === 'all' || wordStatus === query) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });

}

// Добавляем обработчики кликов на слова
document.addEventListener('DOMContentLoaded', function () {
    // Добавляем обработчик для поля поиска
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', function () {
        filterWords(this.value);
    });

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