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
        ### Virificar existencia de email
        cur.execute("SELECT email FROM usuario where email = %s", (email,))

        if cur.fetchone():
            return jsonify({"erro":"O e-mail já está cadastrado"}), 409
        ###
        
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
    
    cur.execute(
        f"""
        UPDATE usuario
        SET {set_clause}
        WHERE id = %s
        RETURNING id
        """,
        valores
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


@usuarios_bp.route("/usuarios/<user_id>/favoritos", methods={"GET"})
def listar_favorito(user_id):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
                    SELECT
                        f.id,
                        f.titulo,
                        f.diretor,
                        f.dt_lancamento,
                        f.roteiro,
                        f.capa_filme
                    FROM favorito fav
                    JOIN filme f ON f.id = fav.filme_id
                    WHERE fav.usuario_id = %s
        """, (user_id,))

        filmes = cur.fetchall()
    
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

    finally:
        cur.close()
        conn.close()
    
    return jsonify([
        {
        "id": f[0],
        "titulo": f[1],
        "diretor": f[2],
        "dt_lancamento": f[3].strftime("%Y-%m-%d") if f[3] else None,
        "roteiro": f[4],
        "capa_filme": f[5]
        }
        for f in filmes
    ])


@usuarios_bp.route("/usuarios/<int:user_id>/favoritos/<int:movie_id>", methods={"POST"})
def inserir_favorito(user_id, movie_id):
    conn = get_connection()
    cur = conn.cursor()

    try: 
        cur.execute("""
            INSERT INTO favorito(usuario_id, filme_id)
            VALUES(%s, %s)
            RETURNING id
        """, (user_id, movie_id))
        novo_id = cur.fetchone()[0]
        conn.commit()

    except Exception as e:
        conn.rollback()
        return jsonify({"erro": str(e)}), 500
    
    finally:
        cur.close()
        conn.close()
    
    return jsonify({"status": "filme adicionado aos favoritos"}), 200


@usuarios_bp.route("/usuarios/<int:user_id>/favoritos/<int:movie_id>", methods={"DELETE"})
def remover_favorito(user_id, movie_id):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("DELETE FROM favorito WHERE usuario_id = %s and filme_id = %s", (user_id, movie_id))

        if cur.rowcount == 0:
            conn.rollback()
            return jsonify({"erro": "Favorito não encontrado"}), 404
        
        conn.commit()
    
    except Exception as e:
        conn.rollback()
        return jsonify({"erro": str(e)}), 500

    finally:
        cur.close()
        conn.close()
    
    return jsonify({"status": "filme removido dos favoritos"}), 200


@usuarios_bp.route("/usuarios/<int:user_id>/assistidos/<int:movie_id>", methods={"POST"})
def marcar_assistido(user_id, movie_id):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("INSERT INTO assistido (usuario_id, filme_id) VALUES (%s, %s)", (user_id, movie_id))

        conn.commit()
    
    except Exception as e:
        conn.rollback()
        return jsonify({"erro": str(e)}), 500
    
    finally:
        cur.close()
        conn.close()

    return jsonify({"status":"Filme marcado como assistido"}), 201


@usuarios_bp.route("/usuarios/<int:user_id>/assistidos/<int:movie_id>", methods={"DELETE"})
def remover_assistido(user_id, movie_id):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("DELETE FROM assistido WHERE usuario_id = %s and filme_id = %s", (user_id, movie_id))
        
        if cur.rowcount == 0:
            conn.rollback()
            return jsonify({"erro": "Registro de assistido não encontrado"}), 404

        conn.commit()
    
    except Exception as e:
        conn.rollback()
        return jsonify({"erro": str(e)}), 500
    
    finally:
        cur.close()
        conn.close()

    return jsonify({"status":"Filme removido de assistido"}), 200