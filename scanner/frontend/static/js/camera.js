let stream = null;
let video = null;
let canvas = null;
let ctx = null;
let detectionInterval = null;
let drawInterval = null;
let lastDetection = null;
let lastDetectionTime = 0;
const DISPLAY_DURATION = 3000; // Время отображения иероглифа после последней детекции (мс)
const TELEGRAM_ID = 123456789; // ID тестового пользователя

function openCameraModal() {
    const modal = document.getElementById('camera-modal');
    modal.classList.add('active');
    setTimeout(initCamera, 100);
}

function closeCameraModal() {
    const modal = document.getElementById('camera-modal');
    modal.classList.remove('active');
    stopCamera();
    if (detectionInterval) {
        clearInterval(detectionInterval);
        detectionInterval = null;
    }
    if (drawInterval) {
        clearInterval(drawInterval);
        drawInterval = null;
    }
    lastDetection = null;
    lastDetectionTime = 0;
}

function initCamera() {
    video = document.getElementById('camera-feed');
    canvas = document.getElementById('detection-canvas');
    ctx = canvas.getContext('2d');
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(s) {
                stream = s;
                video.srcObject = stream;
                video.play();
                setTimeout(() => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    startDetection();
                }, 1000);
            })
            .catch(function(error) {
                console.error('Error accessing camera:', error);
                alert('Ошибка доступа к камере. Проверьте разрешения.');
            });
    } else {
        alert('Ваш браузер не поддерживает доступ к камере.');
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

function toggleCamera() {
    if (!stream) return;
    
    const tracks = stream.getVideoTracks();
    if (tracks.length === 0) return;
    
    const currentTrack = tracks[0];
    const constraints = currentTrack.getConstraints();
    
    // Toggle between front and back camera
    const facingMode = constraints.facingMode === 'environment' ? 'user' : 'environment';
    
    navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: facingMode 
        } 
    })
    .then(function(s) {
        stream = s;
        video.srcObject = stream;
        video.play();
    })
    .catch(function(error) {
        console.error('Error toggling camera:', error);
    });
}

function startDetection() {
    if (!video || !canvas || !ctx) return;
    
    // Run detection every 2 seconds (реже, чтобы не моргало)
    detectionInterval = setInterval(() => {
        detectObjects();
    }, 2000);
    
    // Рисуем кадр и иероглиф 30 раз в секунду
    drawInterval = setInterval(() => {
        drawLastDetection();
    }, 33);
}

function detectObjects() {
    if (!video || !canvas || !ctx) return;
    
    // Capture canvas as image
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Send to server for object detection
    fetch('/ar/detect/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `image=${encodeURIComponent(imageData)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.detections && data.detections.length > 0) {
            // Сохраняем новую детекцию
            lastDetection = data.detections[0];
            lastDetectionTime = Date.now();
        }
    })
    .catch(error => {
        console.error('Error detecting objects:', error);
    });
}

function drawLastDetection() {
    if (!ctx || !video) return;
    
    // Clear and draw video frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    
    // Проверяем, не истекло ли время отображения иероглифа
    const now = Date.now();
    if (lastDetection && (now - lastDetectionTime) < DISPLAY_DURATION) {
        drawDetection(lastDetection);
    }
}

function drawDetection(detection) {
    if (!ctx || !video) return;
    
    const { bbox, class: className, chinese, confidence } = detection;
    const [x1, y1, x2, y2] = bbox;
    
    // Calculate center of the bounding box
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    
    // Calculate box dimensions
    const width = x2 - x1;
    const height = y2 - y1;
    
    // Choose font size based on object size (bigger objects = bigger characters)
    const fontSize = Math.max(40, Math.min(120, Math.sqrt(width * height) * 0.8));
    
    // Draw soft background circle for better visibility
    const circleRadius = fontSize * 0.8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(76, 175, 80, 0.7)';
    ctx.fill();
    
    // Draw the Chinese character centered
    ctx.font = `${fontSize}px "Noto Sans SC", "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(chinese || className, centerX, centerY);
    
    // Optional: Draw small label with class name below
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(`${className} (${(confidence * 100).toFixed(0)}%)`, centerX, centerY + circleRadius + 15);
}



// Функция для добавления последнего обнаруженного слова в словарь
function addLastDetectedToVocab() {
    if (!lastDetection) {
        alert('Сначала нужно обнаружить объект!');
        return;
    }
    
    const wordId = lastDetection.word_id;
    if (!wordId) {
        alert('Не удалось получить ID слова');
        return;
    }
    
    // Отправляем запрос на сервер для добавления слова в словарь
    fetch('/api/add_to_vocab/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            word_id: wordId,
            telegram_id: TELEGRAM_ID,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            if (data.xp_gained > 0) {
                alert(`Слово "${lastDetection.chinese}" успешно добавлено в словарь!\nПолучено ${data.xp_gained} XP`);
                // Обновляем список слов в словаре
                if (typeof updateWordList === 'function') {
                    updateWordList();
                }
            } else {
                alert(`Слово "${lastDetection.chinese}" уже есть в словаре`);
            }
        } else {
            alert('Ошибка: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error adding to vocabulary:', error);
        alert('Произошла ошибка при добавлении слова');
    });
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
        captureBtn.addEventListener('click', addLastDetectedToVocab);
    }
});