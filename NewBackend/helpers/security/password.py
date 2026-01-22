import bcrypt


def gerar_hash(senha: str) -> str:
    salt = bcrypt.gensalt()
    hash_senha = bcrypt.hashpw(senha.encode(), salt)
    
    return hash_senha.decode()


def verificar_senha(senha_digitada: str, hash_salvo: str) -> bool:

    return bcrypt.chackpw(senha_digitada.encode(), hash_salvo.encode())