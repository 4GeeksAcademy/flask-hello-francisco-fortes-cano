"""Completa la configuración local sin sobrescribir la conexión existente."""
from pathlib import Path
import re
import secrets

path = Path(__file__).resolve().parents[1] / '.env'
text = path.read_text() if path.exists() else ''
defaults = {'FLASK_APP': 'src/app.py', 'FLASK_DEBUG': '1', 'JWT_SECRET_KEY': secrets.token_hex(32)}
for key, value in defaults.items():
    pattern = rf'^{key}=(.*)$'
    match = re.search(pattern, text, re.MULTILINE)
    if not match:
        text = text.rstrip() + f'\n{key}={value}\n'
    elif not match.group(1).strip().strip('"').strip("'"):
        text = re.sub(pattern, f'{key}={value}', text, flags=re.MULTILINE)
path.write_text(text, encoding='utf-8')
print('Configuración preparada. La clave JWT permanece en .env y no se muestra.')
