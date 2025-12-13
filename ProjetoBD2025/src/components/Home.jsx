import React, { useState, useEffect } from 'react';
import {
  Container, Spinner, Alert, Card, Row, Col,
  Button, Form, InputGroup
} from 'react-bootstrap';

import Carrossel from './Carrossel.jsx';
import './Home.css';


import { listarFilmesDoUsuario, adicionarFilmeLista, removerFilmeLista, marcarAssistido } from "../services/usuario.js"; 
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
    const list = await listarFilmesDoUsuario(user.id);
    setUserMovies(list || []);
  };

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
      <h5 className="mt-4 mb-4">Catálogo</h5>

      {movies.length === 0 ? (
        <Alert variant="info" className="text-center">
          Nenhum filme encontrado.
        </Alert>
      ) : (
        <Row className="g-3">
          {movies.map(movie => (
            <Col key={movie.id} md={3}>
              <Card className="movie-card h-100">
                {movie.capa_filme && (
                  <Card.Img src={movie.capa_filme} style={styles.cardImage} />
                )}
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{movie.titulo}</Card.Title>
                  
                  <Card.Text style={styles.cardText}>
                    <b>Diretor(es):</b> {movie.diretor || "Sem roterista"}
                  </Card.Text>

                  <Card.Text style={styles.cardText}>
                    <b>Roteristas:</b> {movie.roteiro || "Sem roterista"}
                  </Card.Text>

                  <Card.Text>
                    <strong>Gênero:</strong> {(movie.generos || []).join(", ")}
                  </Card.Text>

                  <Card.Text>
                    <small>Lançamento: {movie.dt_lancamento || "N/A"}</small>
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
