// Importa as bibliotecas necessárias
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { DocumentStore } = require('ravendb');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const store = new DocumentStore(
    ['http://localhost:8000'],
    'ProjetoBancoDeDados'
);
store.initialize();

app.post('/movies', async (req, res) => {
    try {
        const session = store.openSession();
        const movie = req.body;

        if (!movie || Object.keys(movie).length === 0) {
            return res.status(400).json({ error: 'Corpo da requisição vazio.' });
        }

        const movieWithMetadata = {
            ...movie,
            '@metadata': {
                '@collection': 'Movies'
            }
        };

        await session.store(movieWithMetadata);

        await session.saveChanges();

        res.status(201).json(movie);
    } catch (err) {
        console.error("Erro ao salvar o filme:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/movies', async (req, res) => {
    try {
        const session = store.openSession();
        const movies = await session.advanced
            .documentQuery({ collection: "Movies" })
            .waitForNonStaleResults()
            .take(20)
            .all();

        const moviesWithId = movies.map(m => ({
            ...m,
            id: m['@metadata']['@id']
        }));

        res.json(moviesWithId);
    } catch (err) {
        console.error("Erro ao buscar filmes:", err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/movies/:id', async (req, res) => {
    const session = store.openSession();
    try {
        const { id } = req.params;
        const filme = await session.load(id);

        if (!filme) {
            return res.status(404).send({ error: 'Filme não encontrado' });
        }

        filme.titulo = req.body.titulo;
        filme.dataLancamento = req.body.dataLancamento;
        filme.sinopse = req.body.sinopse;
        filme.imagem = req.body.imagem;
        filme.generos = req.body.generos;

        await session.saveChanges();

        res.json({ id, ...filme });
    } catch (err) {
        res.status(500).send({ error: err.message });
    } finally {
        session.dispose();
    }
});



/*
app.put('/movies/:id', async (req, res) => {
    try {
        const session = store.openSession();
        const movie = req.body;

        if (!movie || Object.keys(movie).length === 0) {
            return res.status(400).json({ error: 'Corpo da requisição vazio.' });
        }

        movie['@metadata'] = { '@collection': 'Movies'};

        await session.store(movie);

        await session.saveChanges();
        
        res.status(201).json(movie);
    } catch (err) {
        console.error("Erro ao atualizar o filme:", err);
        res.status(500).json({ error: err.message });
    }
});
*/

app.delete('/movies/:id', async (req, res) => {
    try {
        const session = store.openSession();
        const movieId = req.params.id;

        await session.delete(movieId);
        await session.saveChanges();

        res.json({ message: `Filme ${movieId} deletado com sucesso` });
    } catch (error) {
        console.error("Erro ao deletar o filme:", error);
        res.status(500).json({ error: error.message });
    }
});


// ------------------- USUÁRIOS -------------------

// cadastro
app.post('/users/register', async (req, res) => {
    const session = store.openSession();
    try {
        const { nome, email, senha } = req.body;
        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
        }

        const usuarioExiste = await session.advanced
            .documentQuery({ collection: "Users" })
            .whereEquals("email", email)
            .waitForNonStaleResults()
            .firstOrNull();

        if (usuarioExiste) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        const hashSenha = await bcrypt.hash(senha, 10);
        const role = nome === "admin" ? "admin" : "user";

        const novoUsuario = {
            nome,
            email,
            senha: hashSenha,
            role, //: user,
            listaInteresse: [],
            listaAssistido: [],
            '@metadata': { '@collection': 'Users' }
        };

        await session.store(novoUsuario);
        await session.saveChanges();

        res.status(201).json({
            id: novoUsuario['@metadata']['@id'],
            nome,
            email,
            role: novoUsuario.role
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        session.dispose();
    }
});

// login
app.post('/users/login', async (req, res) => {
    const session = store.openSession();
    try {
        const { email, senha } = req.body;

        const usuario = await session.advanced
            .documentQuery({ collection: "Users" })
            .whereEquals("email", email)
            .waitForNonStaleResults()
            .firstOrNull();

        if (!usuario) return res.status(400).json({ error: "Usuário não encontrado" });

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) return res.status(400).json({ error: "Senha inválida" });

        res.json({
            id: usuario['@metadata']['@id'],
            nome: usuario.nome,
            email: usuario.email,
            role: usuario.role,
            listaInteresse: usuario.listaInteresse || [],
            listaAssistido: usuario.listaAssistido || []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        session.dispose();
    }
});

// listar todos usuários
app.get('/users', async (req, res) => {
    const session = store.openSession();
    try {
        const usuarios = await session.advanced
            .documentQuery({ collection: "Users" })
            .waitForNonStaleResults()
            .all();

        const listarUsuarios = usuarios.map(usuario => ({
            id: usuario['@metadata']['@id'],
            nome: usuario.nome,
            email: usuario.email,
            role: usuario.role,
            listaInteresse: usuario.listaInteresse || [],
            listaAssistido: usuario.listaAssistido || []
        }));

        res.json(listarUsuarios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        session.dispose();
    }
});

// buscar usuário pelo id
app.get('/users/:userId', async (req, res) => {
    const session = store.openSession();
    try {
        const { userId } = req.params;
        const usuario = await session.load(userId);
        if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });

        res.json({
            id: usuario['@metadata']['@id'],
            nome: usuario.nome,
            email: usuario.email,
            role: usuario.role,
            listaInteresse: usuario.listaInteresse || [],
            listaAssistido: usuario.listaAssistido || []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        session.dispose();
    }
});

// ------------------- LISTA DE INTERESSES -------------------

// buscar lista de interesses
app.get('/users/:userId/listaInteresse', async (req, res) => {
    const session = store.openSession();
    try {
        const { userId } = req.params;
        const usuario = await session.load(userId);
        if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });

        const filmes = [];
        for (let movieId of usuario.listaInteresse || []) {
            const filme = await session.load(movieId);
            if (filme) {
                filmes.push({
                    id: filme["@metadata"]["@id"],
                    titulo: filme.titulo,
                    imagem: filme.imagem,
                    sinopse: filme.sinopse,
                    dataLancamento: filme.dataLancamento,
                    generos: filme.generos || []
                });
            }
        }

        res.json(filmes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        session.dispose();
    }
});

// adicionar filme à lista de interesse
app.post('/users/:userId/listaInteresse', async (req, res) => {
    const session = store.openSession();
    try {
        const { userId } = req.params;
        const { movieId } = req.body;
        if (!movieId) return res.status(400).json({ error: "movieId obrigatório" });

        const usuario = await session.load(userId);
        if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });

        usuario.listaInteresse = usuario.listaInteresse || [];
        if (!usuario.listaInteresse.includes(movieId)) {
            usuario.listaInteresse.push(movieId);
        }

        await session.saveChanges();
        res.json({ listaInteresse: usuario.listaInteresse });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        session.dispose();
    }
});

// remover filme da lista de interesse
app.delete('/users/:userId/listaInteresse/:movieId', async (req, res) => {
    const session = store.openSession();
    try {
        const { userId, movieId } = req.params;
        const usuario = await session.load(userId);
        if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });

        usuario.listaInteresse = (usuario.listaInteresse || []).filter(f => f !== movieId);

        await session.saveChanges();
        res.json({ listaInteresse: usuario.listaInteresse });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        session.dispose();
    }
});

// ------------------- LISTA DE ASSISTIDOS -------------------

// buscar lista de assistidos
app.get('/users/:userId/listaAssistido', async (req, res) => {
    const session = store.openSession();
    try {
        const { userId } = req.params;
        const usuario = await session.load(userId);
        if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });

        const filmes = [];
        for (let movieId of usuario.listaAssistido || []) {
            const filme = await session.load(movieId);
            if (filme) {
                filmes.push({
                    id: filme["@metadata"]["@id"],
                    titulo: filme.titulo,
                    imagem: filme.imagem
                });
            }
        }

        res.json(filmes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        session.dispose();
    }
});

// mover filme para assistidos
app.post('/users/:userId/listaAssistido', async (req, res) => {
    const session = store.openSession();
    try {
        const { userId } = req.params;
        const { movieId } = req.body;
        if (!movieId) return res.status(400).json({ error: "movieId obrigatório" });

        const usuario = await session.load(userId);
        if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });

        usuario.listaInteresse = (usuario.listaInteresse || []).filter(f => f !== movieId);
        usuario.listaAssistido = usuario.listaAssistido || [];
        if (!usuario.listaAssistido.includes(movieId)) {
            usuario.listaAssistido.push(movieId);
        }

        await session.saveChanges();
        res.json({ listaAssistido: usuario.listaAssistido });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        session.dispose();
    }
});

app.listen(5000, () => console.log('Backend rodando na porta 5000'));
