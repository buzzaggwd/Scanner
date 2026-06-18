import os
from PIL import Image, ImageDraw, ImageFont

def create_icon(size, output_path):
    """Создаем иконку заданного размера"""
    img = Image.new('RGBA', (size, size), (37, 99, 235, 255))  # Синий фон
    draw = ImageDraw.Draw(img)
    
    # Рисуем закругленный фон
    corner_radius = int(size * 0.12)
    draw.rounded_rectangle([0, 0, size, size], corner_radius, fill=(37, 99, 235, 255))
    
    # Добавляем текст "中"
    try:
        font = ImageFont.truetype("arial.ttf", int(size * 0.5))
    except:
        font = ImageFont.load_default()
    
    text = "中"
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    draw.text((x, y), text, font=font, fill="white")
    
    # Добавляем зеленый круг с AR
    ar_radius = int(size * 0.08)
    ar_x = size - ar_radius - int(size * 0.08)
    ar_y = ar_radius + int(size * 0.08)
    draw.ellipse([ar_x - ar_radius, ar_y - ar_radius, ar_x + ar_radius, ar_y + ar_radius], fill=(22, 163, 74, 255))
    
    # Добавляем текст AR
    ar_font = ImageFont.load_default()
    ar_text = "AR"
    ar_bbox = draw.textbbox((0, 0), ar_text, font=ar_font)
    ar_text_width = ar_bbox[2] - ar_bbox[0]
    ar_text_height = ar_bbox[3] - ar_bbox[1]
    ar_text_x = ar_x - ar_text_width // 2
    ar_text_y = ar_y - ar_text_height // 2
    draw.text((ar_text_x, ar_text_y), ar_text, font=ar_font, fill="white")
    
    img.save(output_path)
    print(f"Создана иконка: {output_path}")

# Создаем иконки разных размеров
icon_sizes = [48, 72, 96, 128, 144, 192, 256, 512]
icons_dir = "frontend/static/icons"

os.makedirs(icons_dir, exist_ok=True)

for size in icon_sizes:
    output_path = os.path.join(icons_dir, f"icon-{size}x{size}.png")
    create_icon(size, output_path)

print("Все иконки успешно созданы!")
