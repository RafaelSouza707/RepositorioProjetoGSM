import React, { useState, useEffect } from 'react';
import {
  Container, Spinner, Alert, Card, Row, Col,
  Button, Form, InputGroup
} from 'react-bootstrap';

import Carrossel from './Carrossel.jsx';
import './Home.css';

import { listarFavoritos, adicionarFavorito, removerFavorito, marcarAssistido } from "../services/usuario.js";
import { listarFilmes } from "../services/filme.js";


const styles = {
  cardImage: { height: '500px', objectFit: 'cover' },
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

  useEffect(() => {
    async function carregar() {
      try {
        const data = await listarFilmes();
        setMovies(data);

      } catch (err) {
        console.log(err);
        setError("Erro ao carregar filmes");

      } finally {
        setLoading(false);

      }
    }

    carregar();
  }, []);

  useEffect(() => {
    console.log("MOVIES ATUALIZADO:", movies);
  }, [movies]);

  const fetchUserMovies = async () => {
    if (!user?.id) return;
    const list = await listarFavoritos(user.id);
    setUserMovies(list || []);
  };

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError("");
        setSuccessMessage("");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const handleAdicionar = async (movie) => {
    if (!user) {
      setError("Você precisa estar logado para adicionar filmes à lista.");
      return;
    }

    await adicionarFavorito(user.id, movie.id);
    setSuccessMessage(`${movie.titulo} adicionado!`);
    fetchUserMovies();
  };

  const handleRemover = async (movie) => {
    await removerFavorito(user?.id, movie.id);
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
    <>
      <Carrossel />

      <Container className="home" style={{ fontFamily: 'Inter, sans-serif' }}>

        {error && <Alert dismissible variant="danger" onClose={() => setError("")}> {error}</Alert>}
        {successMessage && <Alert dismissible variant="success" onClose={() => setSuccessMessage("")}>{successMessage}</Alert>}

        {/* LISTA DO USUÁRIO */}
        {user && userMovies.length > 0 && (
          <>
            <h5 className="mb-3">Sua Lista</h5>
            <Row className="catalogo-row g-3 flex-nowrap overflow-auto">
              {userMovies.map(movie => (
                <Col key={movie.id} xs={6} md={3} lg={2}>
                  <Card className="user-list-card">
                    {movie.capa_filme && (
                      <Card.Img src={movie.capa_filme} style={styles.cardImage} />
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
        <div className="catalogo-section">
          <h5 className="catalogo-title">Catálogo</h5>

          {movies.length === 0 ? (
            <Alert variant="info" className="text-center">
              Nenhum filme encontrado.
            </Alert>
          ) : (
            <Row className="catalogo-row g-3">
              {movies.map(movie => (
                <Col key={movie.id} xs={6} sm={4} md={3} lg={2}>
                  <Card className="movie-card">
                    <div className="movie-cover">
                      <img src={movie.capa_filme} alt={movie.titulo} />
                    </div>

                    <div className="movie-info">
                      <h6>{movie.titulo}</h6>

                      <p><strong>Diretor:</strong> {movie.diretor || "N/A"}</p>

                      <p><strong>Roteiro:</strong> {movie.roteiro || "N/A"}</p>

                      <p><strong>Gênero:</strong> {(movie.generos || []).join(", ")}</p>

                      <small>Lançamento: {movie.dt_lancamento || "N/A"}</small>

                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAdicionar(movie)}
                      >
                        + Adicionar à lista
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Container>
    </>
  );
}
