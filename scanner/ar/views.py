from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import base64
import io
from PIL import Image
from ultralytics import YOLO
import cv2
import numpy as np

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
                        detections.append({
                            'class': class_name,
                            'confidence': round(confidence, 2),
                            'bbox': [int(x1), int(y1), int(x2), int(y2)]
                        })
            
            return JsonResponse({'detections': detections})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

