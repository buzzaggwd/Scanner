// Настраиваем отображение окна при загрузке
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("word-details-modal");
    console.log("DOM загружен, ширина экрана:", window.innerWidth);
    console.log("Модальное окно найдено:", modal !== null);
    if (modal) {
        // На десктопе (>768px) показываем окно сразу
        if (window.innerWidth > 768) {
            modal.classList.add("show");
            console.log("Режим десктопа: окно показывается");
        } else {
            // На мобильных скрываем по умолчанию
            modal.classList.remove("show");
            console.log("Режим мобильный: окно скрыто");
        }
    }
});

function openWordDetails() {
    const modal = document.getElementById("word-details-modal");
    if (modal) {
        modal.classList.add("show");
        // На десктопе ничего дополнительного не нужно
    }
}

function closeWordDetails() {
    console.log("closeWordDetails вызывается");
    const modal = document.getElementById("word-details-modal");
    if (modal) {
        console.log("Модальное окно найдено, удаляем класс show");
        modal.classList.remove("show");
    }
}

// Сделаем функцию доступной глобально
window.closeWordDetails = closeWordDetails;

// Закрытие по клику на фон
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("word-details-modal");
    if (modal) {
        modal.addEventListener("click", function (event) {
            if (event.target === this) {
                closeWordDetails();
            }
        });
    }

    // Закрытие по клику на кнопку закрытия
    const closeBtn = document.querySelector(".close-word-details");
    if (closeBtn) {
        closeBtn.addEventListener("click", function (event) {
            event.stopPropagation();
            console.log("Кнопка закрытия нажата!");
            closeWordDetails();
        });
        console.log("Обработчик клика на кнопку закрытия добавлен");
    } else {
        console.log("Кнопка закрытия не найдена!");
    }

    // Делегирование событий - обработчик на весь документ
    document.addEventListener("click", function(event) {
        if (event.target.classList.contains("close-word-details") || 
            event.target.closest(".close-word-details")) {
            console.log("Делегированный обработчик: кнопка закрытия нажата!");
            event.stopPropagation();
            closeWordDetails();
        }
    });
});

// Данные всех слов из базы (получаем из глобальной переменной)
let wordsData = window.wordsData || [];
console.log('wordsData загружен:', wordsData);
console.log('Количество слов:', wordsData.length);

// Функция для обновления списка слов из API
window.updateWordList = function() {
    fetch('/api/get-user-vocab/')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Преобразуем данные в нужный формат (с примерами)
                wordsData = data.words.map(w => ({
                    ...w,
                    examples: w.examples || []  // если приходят примерами
                }));
                renderWordList();
            } else {
                console.error('Ошибка обновления:', data.message);
            }
        })
        .catch(error => console.error('Ошибка запроса:', error));
}

// Функция для отрисовки списка слов
function renderWordList() {
    const wordListContainer = document.querySelector('.word-list-container');
    if (!wordListContainer) return;
    
    // Находим заголовок и сохраняем его
    const title = wordListContainer.querySelector('.word-list-title');
    
    // Очищаем список, кроме заголовка
    wordListContainer.innerHTML = '';
    if (title) {
        wordListContainer.appendChild(title);
    }
    
    // Добавляем слова
    wordsData.forEach((word, index) => {
        const wordItem = document.createElement('div');
        wordItem.className = `dictionary-word-item word-item ${index === 0 ? 'active' : ''}`;
        wordItem.setAttribute('data-word-id', word.id);
        wordItem.innerHTML = `
            <div class="word-info">
                <span class="word-chinese">${word.translation_cn}</span>
                <span class="word-translation">${word.word}</span>
                <span class="word-pinyin">${word.transcription}</span>
            </div>
            <div class="word-status learning"></div>
        `;
        
        wordItem.addEventListener('click', function() {
            // Убираем активный класс со всех элементов
            document.querySelectorAll('.dictionary-word-item').forEach(w => w.classList.remove('active'));
            // Добавляем активный класс на текущий элемент
            this.classList.add('active');
            // Показываем детали слова
            showWordDetails(word.id);
        });
        
        wordListContainer.appendChild(wordItem);
    });
    
    // Если есть слова, показываем детали первого
    if (wordsData.length > 0) {
        showWordDetails(wordsData[0].id);
    }
}

// Функция для отображения деталей слова
function showWordDetails(wordId) {
    console.log('showWordDetails вызван с ID:', wordId);
    const word = wordsData.find(w => w.id === wordId);
    if (!word) {
        console.error('Слово не найдено с ID:', wordId);
        return;
    }
    console.log('Слово найдено:', word);

    const detailChinese = document.getElementById('detail-chinese');
    const detailTranscription = document.getElementById('detail-transcription');
    const detailTranslation = document.getElementById('detail-translation');

    console.log('Элементы найдены:', {
        chinese: detailChinese !== null,
        transcription: detailTranscription !== null,
        translation: detailTranslation !== null
    });

    if (detailChinese) detailChinese.textContent = word.translation_cn;
    if (detailTranscription) detailTranscription.textContent = word.transcription;
    if (detailTranslation) detailTranslation.textContent = word.word;

    // Показываем модальное окно
    openWordDetails();

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

// Добавляем обработчики кликов на слова
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded - настройка обработчиков кликов');
    const wordItems = document.querySelectorAll('.dictionary-word-item');
    console.log('Найдено элементов слов:', wordItems.length);

    wordItems.forEach(item => {
        item.addEventListener('click', function () {
            // Убираем активный класс со всех элементов
            wordItems.forEach(w => w.classList.remove('active'));
            // Добавляем активный класс на текущий элемент
            this.classList.add('active');

            // Показываем детали слова
            const wordId = parseInt(this.getAttribute('data-word-id'));
            console.log('Клик по слову, ID:', wordId);
            showWordDetails(wordId);

            // Показываем модальное окно (используем класс show)
            const modal = document.getElementById('word-details-modal');
            if (modal) {
                modal.classList.add('show');
            }
        });
    });

    // Показываем детали первого слова при загрузке
    if (wordItems.length > 0) {
        const firstWordId = parseInt(wordItems[0].getAttribute('data-word-id'));
        console.log('Автоматическое отображение первого слова, ID:', firstWordId);
        showWordDetails(firstWordId);
        // На десктопе уже показано, на мобильном не показываем
    } else {
        console.error('Нет элементов слов на странице!');
    }
});
