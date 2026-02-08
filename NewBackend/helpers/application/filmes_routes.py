from flask import jsonify, request, Blueprint
from helpers.database import get_connection


movie_bp = Blueprint("filme", __name__)

@movie_bp.route("/filme", methods=["GET"])
def listar_filmes():
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
                f.capa_filme,
                COALESCE(
                    array_agg(fg.genero_nome)
                    FILTER (WHERE fg.genero_nome IS NOT NULL),
                    '{}'
                ) AS generos
            FROM filme f
            LEFT JOIN filme_genero fg ON fg.filme_id = f.id
            GROUP BY
                f.id,
                f.titulo,
                f.diretor,
                f.dt_lancamento,
                f.roteiro,
                f.capa_filme
            ORDER BY f.id ASC
        """)

        filmes = cur.fetchall()

    except Exception as e:
        print("ERRO AO LISTAR FILMES:", e)
        return jsonify({"erro": str(e)}), 500

    finally:
        cur.close()
        conn.close()

    return jsonify([
        {
            "id": f[0],
            "titulo": f[1],
            "diretor": f[2],
            "dt_lancamento": f[3],
            "roteiro": f[4],
            "capa_filme": f[5],
            "generos": f[6]
        }
        for f in filmes
    ])



@movie_bp.route("/filme", methods=["POST"])
def criar_filme():
    data = request.json

    titulo = data["titulo"]
    diretor = data.get("diretor")
    dt_lancamento = data.get("dt_lancamento")
    roteiro = data.get("roteiro")
    capa_filme = data.get("capa_filme")
    generos = data.get("generos", [])

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO filme (titulo, diretor, dt_lancamento, roteiro, capa_filme)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (titulo, diretor, dt_lancamento, roteiro, capa_filme))

        novo_id = cur.fetchone()[0]

        for genero in generos:
            cur.execute("""
                INSERT INTO filme_genero (filme_id, genero_nome)
                VALUES (%s, %s)
            """, (novo_id, genero))

        conn.commit()

        return jsonify({
            "id": novo_id,
            "titulo": titulo,
            "diretor": diretor,
            "dt_lancamento": dt_lancamento,
            "roteiro": roteiro,
            "capa_filme": capa_filme,
            "generos": generos
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"erro": str(e)}), 500

    finally:
        cur.close()
        conn.close()


@movie_bp.route("/filme/<int:movie_id>", methods=["PUT"])
def modificar_filme(movie_id):
    data = request.json

    campos = ["titulo", "diretor", "dt_lancamento", "roteiro", "capa_filme"]
    update = {k: v for k, v in data.items() if k in campos}

    generos = data.get("generos", [])

    conn = get_connection()
    cur = conn.cursor()

    try:
        if update:
            set_clause = ", ".join([f"{campo} = %s" for campo in update.keys()])
            valores = list(update.values()) + [movie_id]

            cur.execute(f"""
                UPDATE filme
                SET {set_clause}
                WHERE id = %s
            """, valores)

        cur.execute("""
            DELETE FROM filme_genero
            WHERE filme_id = %s
        """, (movie_id,))

        for genero in generos:
            cur.execute("""
                INSERT INTO filme_genero (filme_id, genero_nome)
                VALUES (%s, %s)
            """, (movie_id, genero))

        conn.commit()

    except Exception as e:
        conn.rollback()
        return jsonify({"erro": str(e)}), 500

    finally:
        cur.close()
        conn.close()

    return jsonify({
        "id": movie_id,
        "status": "filme atualizado",
        "generos": generos
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