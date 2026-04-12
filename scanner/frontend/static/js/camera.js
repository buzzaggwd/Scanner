let stream = null;
let video = null;
let canvas = null;
let ctx = null;
let detectionInterval = null;

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
    
    // Run detection every 500ms
    detectionInterval = setInterval(() => {
        detectObjects();
    }, 500);
}

function detectObjects() {
    if (!video || !canvas || !ctx) return;
    
    // Draw video frame to canvas without mirroring
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    
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
        if (data.detections) {
            // Draw detections on canvas
            drawDetections(data.detections);
        }
    })
    .catch(error => {
        console.error('Error detecting objects:', error);
    });
}

function drawDetections(detections) {
    if (!ctx || !video) return;
    
    // Clear previous detections
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw video frame without mirroring
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    
    // Draw bounding boxes and labels
    detections.forEach(detection => {
        const { bbox, class: className, confidence } = detection;
        const [x, y, width, height] = bbox;
        
        // Draw bounding box
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Draw label background
        ctx.fillStyle = 'rgba(76, 175, 80, 0.8)';
        ctx.font = '14px Arial';
        const label = `${className} (${(confidence * 100).toFixed(1)}%)`;
        const labelWidth = ctx.measureText(label).width;
        ctx.fillRect(x, y - 20, labelWidth + 10, 20);
        
        // Draw label text
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(label, x + 5, y - 5);
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
        captureBtn.addEventListener('click', detectObjects);
    }
});