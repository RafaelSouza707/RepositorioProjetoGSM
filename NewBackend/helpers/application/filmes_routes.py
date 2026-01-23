from flask import jsonify, request, Blueprint
from helpers.database import get_connection


movie_bp = Blueprint("filme", __name__)

@movie_bp.route("/filme", methods=["GET"])
def listar_filmes():
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT id, titulo, diretor, dt_lancamento, roteiro, capa_filme FROM filme")
        filmes = cur.fetchall()
    
    except Exception as e:
        return jsonify({"Erro": str(e)}), 500
    
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


@movie_bp.route("/filme", methods=["POST"])
def criar_filme():
    data = request.json
    
    titulo = data["titulo"]
    diretor = data["diretor"]
    dt_lancamento = data["dt_lancamento"]
    roteiro = data["roteiro"]
    capa_filme = data["capa_filme"]

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO filme (titulo, diretor, dt_lancamento, roteiro, capa_filme)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (titulo, diretor, dt_lancamento, roteiro, capa_filme))

        novo_id = cur.fetchone()[0]
        conn.commit()

    except Exception as e:
        conn.rollback()
        return jsonify({"erro": str(e)}), 500
    
    finally:
        cur.close()
        conn.close()
    
    return jsonify({"id": novo_id, "novo filme": titulo, "status": "criado"}), 201


@movie_bp.route("/filme/<int:movie_id>", methods=["PUT"])
def modificar_filme(movie_id):
    data = request.json

    campos = ["titulo", "diretor", "dt_lancamento", "roteiro", "capa_filme"]

    update = {k: v for k, v in data.items() if k in campos}

    if not update:
        return jsonify({"erro": "Nenhum campo válido enviado"}), 400

    set_clause = ", ".join([f"{campo} = %s" for campo in update.keys()])
    valores = list(update.values())
    valores.append(movie_id)

    conn = get_connection()
    cur = conn.cursor()

    sql = f"""
        UPDATE filme
        SET {set_clause}
        WHERE id = %s
        RETURNING id, titulo, diretor, dt_lancamento, roteiro, capa_filme
    """

    cur.execute(sql, valores)
    atualizado = cur.fetchone()

    if not atualizado:
        conn.rollback()
        return jsonify({"erro": "Filme não encontrado"}), 404

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "id": atualizado[0],
        "titulo": atualizado[1],
        "diretor": atualizado[2],
        "dt_lancamento": atualizado[3],
        "roteiro": atualizado[4],
        "capa_filme": atualizado[5],
    }), 200


@movie_bp.route("/filme/<int:movie_id>", methods=["DELETE"])
def deletar_filme(movie_id):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT titulo FROM filme WHERE id = %s", (movie_id,))
        filme = cur.fetchone()
        print(filme)

        if filme is None:
            return jsonify({"erro": "Filme não encontrado"}), 404

        cur.execute("DELETE FROM filme WHERE id = %s", (movie_id,))
        conn.commit()

        return jsonify({"mensagem": "Filme deletado com sucesso"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"erro": str(e)}), 500

    finally:
        cur.close()
        conn.close()