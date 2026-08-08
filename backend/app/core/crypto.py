import base64
import hashlib
from cryptography.fernet import Fernet
from app.core.config import settings

def get_fernet() -> Fernet:
    """
    Derives a 32-byte urlsafe base64 key from the app's SECRET_KEY
    and returns a Fernet instance.
    """
    secret = settings.SECRET_KEY.encode('utf-8')
    # Hash the secret to ensure it's exactly 32 bytes
    key = hashlib.sha256(secret).digest()
    b64_key = base64.urlsafe_b64encode(key)
    return Fernet(b64_key)

def encrypt_secret(plain_text: str) -> str:
    """Encrypts a plaintext secret string."""
    f = get_fernet()
    return f.encrypt(plain_text.encode('utf-8')).decode('utf-8')

def decrypt_secret(encrypted_text: str) -> str:
    """Decrypts an encrypted secret string."""
    f = get_fernet()
    return f.decrypt(encrypted_text.encode('utf-8')).decode('utf-8')
