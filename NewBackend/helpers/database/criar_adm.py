from werkzeug.security import generate_password_hash
from connection import get_connection

NOME = "admin"
EMAIL = "admin@gmail.com"
SENHA = "senha123"

hash_senha = generate_password_hash(SENHA)
print("\nHash gerado:")
print(hash_senha)


try:
    conn = get_connection()
    cur = conn.cursor()

    print("\nInserindo no banco...")

    cur.execute("""
        INSERT INTO adm (nome, email, senha_hash)
        VALUES (%s, %s, %s)
    """, (NOME, EMAIL, hash_senha))

    conn.commit()
    cur.close()
    conn.close()

    print("ADM criado com sucesso!")

except Exception as e:
    print("Erro ao inserir adm:", e)
