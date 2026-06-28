FROM python:3.10-slim

# Системные зависимости — исправлено (libgl1, не libgl1-mesa-glx)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем requirements.txt из папки scanner
COPY scanner/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код из scanner
COPY scanner/ .

# Собираем статику (если нужно)
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]