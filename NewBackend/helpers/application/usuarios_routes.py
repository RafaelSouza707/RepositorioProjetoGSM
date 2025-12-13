from flask import jsonify, request, Blueprint
from helpers.database import get_connection
from werkzeug.security import check_password_hash


usuarios_bp = Blueprint("usuarios", __name__)


@usuarios_bp.route("/login", methods=["POST"])
def login_usuario():
    data = request.json

    if not data or not data.get("email") or not data.get("senha"):
        return jsonify({"erro": "Campos obrigatórios: email e senha"}), 400
    
    email = data["email"]
    senha = data["senha"]

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, nome, senha_hash FROM adm WHERE email = %s", (email, ))
    adm = cur.fetchone()
    
    if adm:
        adm_id, nome, hash_senha = adm
        if check_password_hash(hash_senha, senha):
            cur.close()
            conn.close()
            return jsonify({
                "id": adm_id,
                "nome": nome,
                "email": email,
                "tipo": "adm"
            })
        cur.close()
        conn.close()
        return jsonify({"erro": "Senha incorreta"}), 401

    cur.execute("SELECT id, nome, senha_hash FROM usuario WHERE email = %s", (email,))
    user = cur.fetchone()

    if user:
        user_id, nome, hash_senha = user
        if check_password_hash(hash_senha, senha):
            cur.close()
            conn.close()
            return jsonify({
                "id": user_id,
                "nome": nome,
                "email": email,
                "tipo": "usuario"
            })
        cur.close()
        conn.close()
        return jsonify({"erro": "Senha incorreta"}), 401
    
    return jsonify({"erro": "Usuário não encontrado"}), 401


@usuarios_bp.route("/usuarios", methods=["GET"])
def listar_usuarios():
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT id, nome, email FROM usuario")
        usuarios = cur.fetchall()

    except Exception as e:
        return jsonify({"Erro": str(e)}), 500

    finally:
        cur.close()
        conn.close()

    return jsonify([
        {"id": u[0], "nome": u[1], "email": u[2]} for u in usuarios
    ])


@usuarios_bp.route("/usuarios", methods=["POST"])
def criar_usuario():
    data = request.json

    if not data or not data.get("nome") or not data.get("email") or not data.get("senha"):
        return jsonify({"erro": "Campos obrigatorios: nome, email e senha"}), 400

    nome = data["nome"]
    email = data["email"]
    senha = data["senha"]

    from werkzeug.security import generate_password_hash
    senha_hash = generate_password_hash(senha)

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO usuario (nome, email, senha_hash)
            VALUES (%s, %s, %s)
            RETURNING id
        """, (nome, email, senha_hash))

        novo_id = cur.fetchone()[0]
        conn.commit()

    except Exception as e:
        conn.rollback()
        return jsonify({"erro": str(e)}), 500

    finally: 
        cur.close()
        conn.close()

    return jsonify({"id": novo_id, "status": "criado"}), 201


@usuarios_bp.route("/usuarios/<int:user_id>", methods={"PUT"})
def modificar_usuario(user_id):
    data = request.json

    if not data or len(data) == 0:
        return jsonify({"erro": "Nenhum dado enviado para atualização"}), 400
    
    campos = ["nome", "email", "senha"]

    updates = {k: v for k, v in data.items() if k in campos}

    if len(updates) == 0:
        return jsonify({"erro": "Nenhum campo válido enviado"}), 400
    
    set_clause = ", ".join( [f"{campo} = %s" for campo in updates.keys()] )
    valores = list(updates.values())
    valores.append(user_id)

    conn = get_connection()
    cur = conn.cursor()
    
    cur.cursor(
        f"""
        UPDATE usuario
        SET {set_clause}
        WHERE id = %s
        RETURNING id
        """, valores
    )

    atualizado = cur.fetchone()

    if not atualizado:
        cur.close()
        conn.close()
        return jsonify({"erro": "Usuário não encontrado"}), 404
    
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"status": "atualizado", "id": user_id}), 202

# Finalizar na proxima sprint
@usuarios_bp.route("/usuarios/<int:user_id>/<int:movie_id>", methods={"PUT"})
def inserirFavorito(user_id, movie_id):
    conn = get_connection()
    cur = conn.cursor()

    try: 
        cur.execute("""
            INSERT INTO favorito(usuario_id, filme_id)
            VALUES(%s, %s)
            RETURNIN id
        """, (user_id, movie_id))
        novo_id = cur.fetchone()[0]
        conn.commit()

    except Exception as e:
        conn.rollback()
        return jsonify({"erro": str(e)}), 500
    
    finally:
        cur.close()
        conn.close()
    
    return jsonify({"status": "filme adicionado aos favoritos"})