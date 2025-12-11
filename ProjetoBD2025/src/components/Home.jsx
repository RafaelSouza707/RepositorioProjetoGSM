import React, { useState, useEffect } from 'react';
import {
  Container, Spinner, Alert, Card, Row, Col,
  Button, Form, InputGroup
} from 'react-bootstrap';

import Carrossel from './Carrossel.jsx';
import './Home.css';


import {
  listarFilmes,
  listarFilmesDoUsuario,
  adicionarFilmeLista,
  removerFilmeLista,
  marcarAssistido
} from "../services/usuario.js"; 


const styles = {
  cardImage: { height: '280px', objectFit: 'cover' },
  cardTitle: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cardText: {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  }
};

export default function Home({ user }) {
  const [movies, setMovies] = useState([]);
  const [userMovies, setUserMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [allGenres, setAllGenres] = useState([]);

  // ========= Carregar catálogo ==========
  useEffect(() => {
    async function carregar() {
      try {
        const data = await listarFilmes(); // Apenas chamada
        setMovies(data || []);

        const genresSet = new Set();
        (data || []).forEach(m =>
          m.generos?.forEach(g => genresSet.add(g))
        );
        setAllGenres([...genresSet].sort());
      } catch {
        setError("Erro ao carregar filmes");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  // ========= Buscar lista do usuário ==========
  const fetchUserMovies = async () => {
    if (!user?.id) return;
    const list = await listarFilmesDoUsuario(user.id);
    setUserMovies(list || []);
  };

  // ========= FILTRO ==========
  const filteredMovies = movies.filter(movie => {
    const byTitle = movie.titulo?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const byGenre = !selectedGenre || movie.generos?.includes(selectedGenre);

    return byTitle && byGenre;
  });

  // ========= AÇÕES ==========
  const handleAdicionar = async (movie) => {
    await adicionarFilmeLista(user?.id, movie.id);
    setSuccessMessage(`${movie.titulo} adicionado!`);
    fetchUserMovies();
  };

  const handleRemover = async (movie) => {
    await removerFilmeLista(user?.id, movie.id);
    setSuccessMessage(`${movie.titulo} removido!`);
    fetchUserMovies();
  };

  const handleAssistido = async (movie) => {
    await marcarAssistido(user?.id, movie.id);
    setSuccessMessage(`${movie.titulo} marcado como assistido!`);
    fetchUserMovies();
  };

  if (loading)
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </Container>
    );

  return (
    <Container className="p-4" style={{ fontFamily: 'Inter, sans-serif' }}>

      <Carrossel />

      {/* PESQUISA + FILTROS */}
      <Row className="mb-4 mt-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              placeholder="Pesquisar por filme..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>

        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>🎬</InputGroup.Text>
            <Form.Select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="">Todos os gêneros</option>
              {allGenres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* LISTA DO USUÁRIO */}
      {user && userMovies.length > 0 && (
        <>
          <h5 className="mb-3">Sua Lista</h5>
          <Row className="flex-nowrap overflow-auto g-2 pb-3">
            {userMovies.map(movie => (
              <Col key={movie.id} xs={6} md={3} lg={2}>
                <Card className="user-list-card">
                  {movie.imagem && (
                    <Card.Img src={movie.imagem} style={styles.cardImage} />
                  )}
                  <Card.Body>
                    <Card.Title style={styles.cardTitle}>{movie.titulo}</Card.Title>

                    <Button size="sm" variant="danger" onClick={() => handleRemover(movie)}>
                      Remover
                    </Button>

                    <Button size="sm" className="ms-2" variant="success"
                      onClick={() => handleAssistido(movie)}
                    >
                      Assistido
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* CATÁLOGO */}
      <h5 className="mt-4 mb-4">Catálogo</h5>

      {filteredMovies.length === 0 ? (
        <Alert variant="info" className="text-center">
          Nenhum filme encontrado.
        </Alert>
      ) : (
        <Row className="g-3">
          {filteredMovies.map(movie => (
            <Col key={movie.id} md={2}>
              <Card className="movie-card h-100">
                {movie.imagem && (
                  <Card.Img src={movie.imagem} style={styles.cardImage} />
                )}
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{movie.titulo}</Card.Title>

                  <Card.Text style={styles.cardText}>
                    {movie.sinopse || "Sem sinopse"}
                  </Card.Text>

                  <Card.Text>
                    <strong>Gênero:</strong> {(movie.generos || []).join(", ")}
                  </Card.Text>

                  <Card.Text>
                    <small>Lançamento: {movie.dataLancamento || "N/A"}</small>
                  </Card.Text>

                  <Button
                    className="mt-auto"
                    variant="primary"
                    onClick={() => handleAdicionar(movie)}
                  >
                    Adicionar à lista
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

    </Container>
  );
}
