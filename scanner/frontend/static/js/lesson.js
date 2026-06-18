// Текущая задача
let currentTask = 0;
let tasks = [];
let draggedWord = null;
let droppedWordIds = {};
let lessonId = null;

// Данные урока - будут переопределены из HTML
const lessonData = {
    lesson_id: 0,
    tasks: []
};

// Инициализация
document.addEventListener('DOMContentLoaded', function () {
    // Если данные переданы через HTML, используем их
    if (window.lessonData) {
        lessonData.lesson_id = window.lessonData.lesson_id;
        lessonData.tasks = window.lessonData.tasks;
        lessonId = window.lessonData.lesson_id;
    } else {
        // Фоллбэк: моковые данные
        lessonData.lesson_id = 1;
        lessonData.tasks = [
            {
                sentence_parts: [
                    { type: 'text', content: '我想吃' },
                    { type: 'blank', id: 'blank-1' },
                    { type: 'text', content: '。' },
                    { type: 'text_translation', content: 'Я хочу съесть яблоко.' },
                ],
                available_words: [
                    { id: 'word-1', chinese: '苹果', translation: 'яблоко' },
                    { id: 'word-2', chinese: '书', translation: 'книга' },
                    { id: 'word-3', chinese: '水', translation: 'вода' },
                ],
                correct_answer: 'word-1',
                explanation: 'Правильный ответ: 苹果 (яблоко)'
            },
            {
                sentence_parts: [
                    { type: 'text', content: '这是我的' },
                    { type: 'blank', id: 'blank-1' },
                    { type: 'text', content: '。' },
                    { type: 'text_translation', content: 'Это мой телефон.' },
                ],
                available_words: [
                    { id: 'word-1', chinese: '手机', translation: 'телефон' },
                    { id: 'word-2', chinese: '桌子', translation: 'стол' },
                    { id: 'word-3', chinese: '杯子', translation: 'стакан' },
                ],
                correct_answer: 'word-1',
                explanation: 'Правильный ответ: 手机 (телефон)'
            },
            {
                sentence_parts: [
                    { type: 'text', content: '我有一个' },
                    { type: 'blank', id: 'blank-1' },
                    { type: 'text', content: '。' },
                    { type: 'text_translation', content: 'У меня есть друг.' },
                ],
                available_words: [
                    { id: 'word-1', chinese: '朋友', translation: 'друг' },
                    { id: 'word-2', chinese: '猫', translation: 'кошка' },
                    { id: 'word-3', chinese: '电脑', translation: 'компьютер' },
                ],
                correct_answer: 'word-1',
                explanation: 'Правильный ответ: 朋友 (друг)'
            }
        ];
    }

    tasks = lessonData.tasks;
    loadTask(currentTask);
});

// Загрузка задачи
function loadTask(taskIndex) {
    if (taskIndex >= tasks.length) {
        finishLesson();
        return;
    }

    const task = tasks[taskIndex];

    // Сбрасываем перевод предложения
    const sentenceTranslation = document.getElementById('sentence-translation');
    sentenceTranslation.textContent = '';

    // Обновляем предложение
    const sentenceContainer = document.querySelector('.sentence');
    sentenceContainer.innerHTML = '';

    task.sentence_parts.forEach(part => {
        if (part.type === 'text') {
            const span = document.createElement('span');
            span.className = 'sentence-text';
            span.textContent = part.content;
            sentenceContainer.appendChild(span);
        } else if (part.type === 'blank') {
            const blank = document.createElement('div');
            blank.className = 'blank-slot';
            blank.id = `blank-${part.id}`;
            blank.setAttribute('ondragover', 'allowDrop(event)');
            blank.setAttribute('ondrop', `drop(event, '${part.id}')`);

            const placeholder = document.createElement('span');
            placeholder.className = 'blank-placeholder';
            placeholder.textContent = '___';
            blank.appendChild(placeholder);

            sentenceContainer.appendChild(blank);
        } else if (part.type === 'text_translation') {
            // Отображаем перевод предложения в отдельном контейнере
            const sentenceTranslation = document.getElementById('sentence-translation');
            sentenceTranslation.textContent = part.content;
        }
    });

    // Обновляем доступные слова
    const wordsGrid = document.querySelector('.words-grid');
    wordsGrid.innerHTML = '';

    task.available_words.forEach(word => {
        const wordCard = document.createElement('div');
        wordCard.className = 'word-card draggable';
        wordCard.id = word.id;
        wordCard.draggable = true;
        wordCard.setAttribute('ondragstart', `drag(event, '${word.id}')`);

        const chineseSpan = document.createElement('span');
        chineseSpan.className = 'word-chinese';
        chineseSpan.textContent = word.chinese;

        const translationSpan = document.createElement('span');
        translationSpan.className = 'word-translation';
        translationSpan.textContent = word.translation;

        wordCard.appendChild(chineseSpan);
        wordCard.appendChild(translationSpan);
        wordsGrid.appendChild(wordCard);
    });

    // Сбрасываем результат
    const resultSection = document.getElementById('result-section');
    resultSection.style.display = 'none';
    resultSection.className = '';
    document.getElementById('next-btn').style.display = 'none';

    // Сбрасываем droppedWordIds
    droppedWordIds = {};
}

// Функции для перетаскивания
function drag(event, wordId) {
    draggedWord = wordId;
    event.dataTransfer.setData('text/plain', wordId);
    const element = document.getElementById(wordId);
    element.classList.add('dragging');
}

function allowDrop(event) {
    event.preventDefault();
    const target = event.target.closest('.blank-slot');
    if (target) {
        target.classList.add('drag-over');
    }
}

function drop(event, blankId) {
    event.preventDefault();

    // Убираем классы
    document.querySelectorAll('.blank-slot').forEach(el => el.classList.remove('drag-over'));
    if (draggedWord) {
        document.getElementById(draggedWord).classList.remove('dragging');
    }

    const wordId = event.dataTransfer.getData('text/plain');
    if (!wordId || !draggedWord) return;

    const blankSlot = document.getElementById(`blank-${blankId}`);
    const wordCard = document.getElementById(wordId);

    // Если в слоте уже есть слово, возвращаем предыдущее
    if (droppedWordIds[blankId]) {
        const prevWordId = droppedWordIds[blankId];
        const prevWordCard = document.getElementById(prevWordId);
        if (prevWordCard) {
            prevWordCard.classList.remove('used');
        }
    }

    // Обновляем содержимое слота
    const wordContent = wordCard.querySelector('.word-chinese').textContent;
    blankSlot.innerHTML = `<span class="dropped-word">${wordContent}</span>`;

    // Отмечаем слово как использованное
    wordCard.classList.add('used');
    droppedWordIds[blankId] = wordId;
}

// Проверка ответа
function checkAnswer() {
    const task = tasks[currentTask];
    const userAnswer = droppedWordIds['blank-1'];

    const resultSection = document.getElementById('result-section');
    const resultMessage = document.getElementById('result-message');
    const correctAnswer = document.getElementById('correct-answer');
    const nextBtn = document.getElementById('next-btn');

    resultSection.style.display = 'block';

    if (userAnswer === task.correct_answer) {
        resultSection.className = 'result-section correct';
        resultMessage.textContent = 'Правильно!';
        correctAnswer.textContent = task.explanation;
    } else {
        resultSection.className = 'result-section incorrect';
        resultMessage.textContent = 'Неправильно';
        correctAnswer.textContent = task.explanation;
    }

    nextBtn.style.display = 'inline-block';
}

// Переход к следующей задаче
function nextTask() {
    currentTask++;
    loadTask(currentTask);
}

// Завершение урока
function finishLesson() {
    alert('Поздравляем! Вы завершили урок!');
    window.history.back();
}

// Возврат назад
function goBack() {
    window.history.back();
}