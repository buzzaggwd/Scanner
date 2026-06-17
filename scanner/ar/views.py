from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import base64
import io
from PIL import Image
from ultralytics import YOLO
import cv2
import numpy as np
import requests
import os
from dotenv import load_dotenv
from pathlib import Path

# Import Vocabulary model
from backend.models import Vocabulary

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / '.env'
load_dotenv(dotenv_path=env_path)

def translate_to_chinese(text):
    """Перевод текста на китайский язык (иероглифы) через Yandex Translator"""
    API_KEY = os.getenv('yandex-translater-api')
    FOLDER_ID = os.getenv('yandex-folder')
    
    if not API_KEY or not FOLDER_ID:
        print("Yandex Translator credentials not found")
        return text
    
    url = "https://translate.api.cloud.yandex.net/translate/v2/translate"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Api-Key {API_KEY}"
    }
    
    body = {
        "targetLanguageCode": "zh",
        "texts": [text],
        "folderId": FOLDER_ID
    }
    
    try:
        response = requests.post(url, json=body, headers=headers)
        if response.status_code == 200:
            return response.json()['translations'][0]['text']
        else:
            print(f"Translation API error: {response.status_code}")
            return text
    except Exception as e:
        print(f"Error during translation: {str(e)}")
        return text

# Load YOLO8 model
model = YOLO('yolov8n.pt')  # Using nano model for faster inference

@csrf_exempt
def detect_objects(request):
    if request.method == 'POST':
        try:
            # Get image from request
            data = request.POST.get('image')
            if not data:
                return JsonResponse({'error': 'No image provided'}, status=400)
            
            # Decode base64 image
            image_data = data.split(',')[1]  # Remove data:image/*;base64, prefix
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert PIL image to numpy array
            image_np = np.array(image)
            
            # Run YOLO8 inference
            results = model(image_np)
            
            # Process results
            detections = []
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    # Get box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    # Get confidence and class
                    confidence = box.conf[0].item()
                    class_id = box.cls[0].item()
                    class_name = model.names[int(class_id)]
                    
                    # Add to detections if confidence is high enough
                    if confidence > 0.5:
                        # Проверяем, есть ли слово в базе данных
                        word_in_db = Vocabulary.objects.filter(translation_eng__iexact=class_name).first()
                        
                        if word_in_db:
                            # Если слово есть в базе, берем иероглифы оттуда
                            chinese_char = word_in_db.translation_cn
                        else:
                            # Если слова нет в базе, пропускаем его
                            continue
                        
                        detections.append({
                            'class': class_name,
                            'chinese': chinese_char,
                            'confidence': round(confidence, 2),
                            'bbox': [int(x1), int(y1), int(x2), int(y2)]
                        })
            
            # Оставляем только один объект с максимальной уверенностью
            if detections:
                detections = [max(detections, key=lambda x: x['confidence'])]
            
            return JsonResponse({'detections': detections})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

