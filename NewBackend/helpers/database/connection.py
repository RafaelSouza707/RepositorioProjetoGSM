import psycopg

def get_connection():
    return psycopg.connect(
        dbname="dbPirataFlix",
        user="postgres",
        password="postgre",
        host="localhost",
        port="5432"
    )