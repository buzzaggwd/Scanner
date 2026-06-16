// Настраиваем отображение окна при загрузке
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("word-details-modal");
    console.log("DOM загружен, ширина экрана:", window.innerWidth);
    console.log("Модальное окно найдено:", modal !== null);
    if (modal) {
        modal.classList.remove("show");
        // На десктопе (>768px) показываем окно как карточка
        if (window.innerWidth > 768) {
            modal.style.display = "flex";
            console.log("Режим десктопа: окно показывается как карточка");
        } else {
            // На мобильных CSS уже скрывает окно
            console.log("Режим мобильный: окно скрыто CSS");
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
    const modal = document.getElementById("word-details-modal");
    if (modal) {
        modal.classList.remove("show");
    }
}

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
});

// Данные всех слов из базы (получаем из глобальной переменной)
const wordsData = window.wordsData || [];
console.log('wordsData загружен:', wordsData);
console.log('Количество слов:', wordsData.length);

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

            // Показываем модальное окно
            document.getElementById('word-details-modal').style.display = 'block';
        });
    });

    // Показываем детали первого слова при загрузке
    if (wordItems.length > 0) {
        const firstWordId = parseInt(wordItems[0].getAttribute('data-word-id'));
        console.log('Автоматическое отображение первого слова, ID:', firstWordId);
        showWordDetails(firstWordId);
        document.getElementById('word-details-modal').style.display = 'block';
    } else {
        console.error('Нет элементов слов на странице!');
    }
});
