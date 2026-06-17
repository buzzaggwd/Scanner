// Глобальная переменная для хранения данных последнего сканированного слова
let lastScannedWord = null;

// Функция для сканирования объекта
function scanObject() {
    // В реальном приложении здесь будет код для сканирования
    // Для демонстрации используем пример
    const scannedWord = "laptop"; // Пример слова, полученного из сканирования

    // Отправляем запрос на сервер
    fetch("/backend/api/scan/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            word: scannedWord,
            telegram_id: 123456789, // Пример ID пользователя
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                // Сохраняем данные сканированного слова
                lastScannedWord = {
                    word: data.word,
                    word_id: data.word_id,
                    translation: data.translation
                };
                
                // Отображаем результаты в модальном окне
                document.getElementById("result-word").textContent = data.word;
                document.getElementById("result-translation").textContent =
                    data.translation;
                document.getElementById("result-xp").textContent =
                    `Получено ${data.xp_gained} XP. Общий баланс: ${data.total_xp} XP`;
                document.getElementById("result-modal").classList.add("active");
            } else {
                // Обрабатываем ошибку
                alert("Ошибка: " + data.message);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Произошла ошибка при обработке запроса");
        });
}

// Функция для добавления слова в словарь
function addToVocabulary() {
    if (!lastScannedWord) {
        alert("Нет данных о сканированном слове");
        return;
    }

    // Отправляем запрос на сервер для добавления слова в словарь
    fetch("api/add_to_vocab/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            word_id: lastScannedWord.word_id,
            telegram_id: 123456789, // Пример ID пользователя
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                alert("Слово успешно добавлено в словарь!");
                closeModal();
            } else {
                // Обрабатываем ошибку
                alert("Ошибка: " + data.message);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Произошла ошибка при добавлении слова");
        });
}

// Функция для закрытия модального окна
function closeModal() {
    document.getElementById("result-modal").classList.remove("active");
}

// Функция для открытия модального окна перевода
function openTranslateModal() {
    document.getElementById("translate-modal").classList.add("active");
}

// Функция для закрытия модального окна перевода
function closeTranslateModal() {
    document.getElementById("translate-modal").classList.remove("active");
}

// Функция для перевода текста
function translateText() {
    const text = document.getElementById("translate-input").value.trim();

    if (!text) {
        alert("Пожалуйста, введите текст для перевода");
        return;
    }

    // Отправляем запрос на сервер
    fetch("/backend/api/translate/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            text: text,
            target_lang: "zh", // Перевод на китайский
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                // Отображаем результат перевода
                document.getElementById("translate-result").innerHTML = `
                        <p><strong>Исходный текст:</strong> ${data.text}</p>
                        <p><strong>Перевод:</strong> ${data.translation}</p>
                    `;
            } else {
                // Обрабатываем ошибку
                document.getElementById("translate-result").innerHTML =
                    `<p style="color: red;">Ошибка: ${data.message}</p>`;
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            document.getElementById("translate-result").innerHTML =
                '<p style="color: red;">Произошла ошибка при обработке запроса</p>';
        });
}
