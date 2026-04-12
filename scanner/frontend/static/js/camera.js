// Переменные для работы с камерой
let stream = null;
let cameraActive = false;

// Функция для открытия модального окна камеры
function openCameraModal() {
    document.getElementById('camera-modal').classList.add('active');
}

// Функция для закрытия модального окна камеры
function closeCameraModal() {
    document.getElementById('camera-modal').classList.remove('active');
    // Если камера активна, выключить её
    if (cameraActive) {
        toggleCamera();
    }
}

// Функция для включения/выключения камеры
function toggleCamera() {
    const video = document.getElementById('camera-video');
    const toggleBtn = document.getElementById('toggle-camera');
    const captureBtn = document.getElementById('capture-btn');

    if (cameraActive) {
        // Выключить камеру
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        video.srcObject = null;
        cameraActive = false;
        toggleBtn.textContent = 'Включить камеру';
        captureBtn.disabled = true;
    } else {
        // Включить камеру
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(s => {
                stream = s;
                video.srcObject = stream;
                cameraActive = true;
                toggleBtn.textContent = 'Выключить камеру';
                captureBtn.disabled = false;
            })
            .catch(err => {
                console.error('Ошибка при доступе к камере:', err);
                alert('Нет доступа к камере. Проверьте разрешения.');
            });
    }
}

// Функция для сканирования QR-кода
function scanQRCode() {
    const video = document.getElementById('camera-video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Устанавливаем размеры canvas равными размерам видео
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Рисуем текущий кадр видео на canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Получаем данные изображения
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Пытаемся декодировать QR-код (здесь будет использоваться библиотека QRCode.js или аналогичная)
    // Временно просто показываем алерт
    alert('Сканирование... (в реальности здесь будет декодирование QR-кода)');
    
    // В реальном приложении здесь будет код для обработки QR-кода
    // Например, отправка данных на сервер или обработка локально
}

// Добавляем обработчики событий при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчик для кнопки "Включить камеру"
    const toggleBtn = document.getElementById('toggle-camera');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleCamera);
    }
    
    // Добавляем обработчик для кнопки "Сканировать"
    const captureBtn = document.getElementById('capture-btn');
    if (captureBtn) {
        captureBtn.addEventListener('click', scanQRCode);
    }
});