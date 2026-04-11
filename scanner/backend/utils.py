import requests
import os
import logging
from dotenv import load_dotenv
from pathlib import Path

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / '.env'
logger.debug(f"Trying to load .env from: {env_path}")
load_dotenv(dotenv_path=env_path)

def get_yandex_translation(text, target_lang='zh'):
    API_KEY = os.getenv('yandex-translater-api')
    FOLDER_ID = os.getenv('yandex-folder')

    logger.debug(f"Translation request: text='{text}', target_lang='{target_lang}'")
    logger.debug(f"API_KEY: {API_KEY}")
    logger.debug(f"FOLDER_ID: {FOLDER_ID}")
    logger.debug(f"Current working directory: {os.getcwd()}")
    logger.debug(f".env file exists: {os.path.exists('.env')}")

    url = "https://translate.api.cloud.yandex.net/translate/v2/translate"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Api-Key {API_KEY}"
    }

    body = {
        "targetLanguageCode": target_lang,
        "texts": [text],
        "folderId": FOLDER_ID
    }

    try:
        response = requests.post(url, json=body, headers=headers)
        logger.debug(f"Response status code: {response.status_code}")
        logger.debug(f"Response content: {response.text}")
        
        if response.status_code == 200:
            return response.json()['translations'][0]['text']
        else:
            logger.error(f"Translation API error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error during translation: {str(e)}")
        return None