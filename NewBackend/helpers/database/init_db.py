from .connection import get_connection

def init_database():
    conn = get_connection()
    cur = conn.cursor()

    with open("helpers/database/schema.sql", "r", encoding="utf-8") as f:
        sql_script = f.read()

    cur.execute(sql_script)

    conn.commit()
    cur.close()
    conn.close()

    print("Banco inicializado com sucesso.")