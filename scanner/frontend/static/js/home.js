// Функция для открытия модального окна перевода
function openTranslateModal() {
    document.getElementById('translate-modal').classList.add('active');
}

// Функция для закрытия модального окна перевода
function closeTranslateModal() {
    document.getElementById('translate-modal').classList.remove('active');
}

// Функция для перевода текста
function translateText() {
    const text = document.getElementById('translate-input').value.trim();
    
    if (!text) {
        alert('Пожалуйста, введите текст для перевода');
        return;
    }
    
    fetch('/backend/api/translate/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: text,
            target_lang: 'zh'
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById('translate-result').innerHTML = `
                <p><strong>Исходный текст:</strong> ${data.text}</p>
                <p><strong>Перевод:</strong> ${data.translation}</p>
            `;
        } else {
            document.getElementById('translate-result').innerHTML = `<p style="color: red;">Ошибка: ${data.message}</p>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('translate-result').innerHTML = '<p style="color: red;">Произошла ошибка при обработке запроса</p>';
    });
}