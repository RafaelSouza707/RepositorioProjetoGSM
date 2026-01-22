CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS adm(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	email VARCHAR(200) UNIQUE NOT NULL,
	senha_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS filme (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    diretor VARCHAR(255),
    dt_lancamento DATE,
    roteiro TEXT,
    capa_filme TEXT
);

CREATE TABLE IF NOT EXISTS genero (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS favorito (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    filme_id INT NOT NULL REFERENCES filme(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, filme_id)
);


CREATE TABLE IF NOT EXISTS assistido (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    filme_id INT NOT NULL REFERENCES filme(id) ON DELETE CASCADE,
    data_assistido TIMESTAMP DEFAULT NOW(),
    UNIQUE(usuario_id, filme_id)
);

CREATE TABLE IF NOT EXISTS filme_genero (
    id SERIAL PRIMARY KEY,
    filme_id INTEGER NOT NULL,
    genero_id INTEGER NOT NULL,
    FOREIGN KEY (filme_id) REFERENCES filme(id) ON DELETE CASCADE,
    FOREIGN KEY (genero_id) REFERENCES genero(id) ON DELETE CASCADE,
    UNIQUE (filme_id, genero_id)
);