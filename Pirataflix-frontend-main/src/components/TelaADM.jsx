import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Container, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import { listarFilmes, criarFilme, atualizarFilme, deletarFilme } from "../services/filme";
import "./TelaAdm.css";

function TelaADM() {

  const [showModal, setShowModal] = useState(false);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editarFilme, setEditarFilme] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [dt_lancamento, setDt_lancamento] = useState('');
  const [generos, setGeneros] = useState([]);
  const [diretor, setDiretor] = useState('');
  const [roteiro, setRoteiro] = useState('');
  const [capa_filme, setCapa_filme] = useState('');

  const limparFormulario = () => {
    setEditarFilme(null);
    setTitulo('');
    setDiretor('');
    setRoteiro('');
    setGeneros([]);
    setDt_lancamento('');
    setCapa_filme('');
  };

  const opcoesGeneros = ["Ação", "Comédia", "Drama", "Fantasia", "Terror"];

  const handleShowAdicionar = () => {
    setEditarFilme(null);
    setTitulo('');
    setDiretor('');
    setRoteiro('');
    setDt_lancamento('');
    setGeneros([]);
    setCapa_filme('');
    setShowModal(true);
  };

  const handleEditar = (movie) => {
    setEditarFilme(movie);
    setTitulo(movie.titulo || '');
    setDiretor(movie.diretor || '');
    setRoteiro(movie.roteiro || '');
    setGeneros(movie.generos || []);
    setDt_lancamento(movie.dt_lancamento || '');
    setCapa_filme(movie.capa_filme || '');
    setShowModal(true);

  };

  const handleDelete = async (movie) => {
    if (!window.confirm(`Deseja realmente excluir o filme "${movie.titulo}"?`)) return;

    try {
      await deletarFilme(movie.id);
      setMovies(prev => prev.filter(m => m.id !== movie.id));
    } catch (err) {
      alert("Erro ao deletar filme");
    }
  }

  const handleGeneroChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setGeneros(prev => [...prev, value]);
    } else {
      setGeneros(prev => prev.filter(g => g !== value));
    }
  };

  const handleSave = async () => {
    if (titulo.trim().length < 3) {
      return;
    }

    const filme = {
      titulo,
      diretor,
      dt_lancamento,
      roteiro,
      capa_filme
    };

    try {
      let filmeSalvo;

      if (editarFilme) {
        filmeSalvo = await atualizarFilme(editarFilme.id, filme);
        setMovies(prev => prev.map(m => (m.id === filmeSalvo.id ? filmeSalvo : m)))
      } else {
        filmeSalvo = await criarFilme(filme);
        setMovies(prev => [...prev, filmeSalvo]);
      }

      setShowModal(false);
      limparFormulario();
    } catch (err) {
      alert("Erro ao salvar filme");
    }
  };

  useEffect(() => {
    const carregarFilmes = async () => {
      try {
        const data = await listarFilmes();
        setMovies(data);
      } catch (err) {
        setError("Erro ao carregar filmes");
      } finally {
        setLoading(false);
      }
    };

    carregarFilmes();
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const truncateText = (text, maxLength) => {
    if (!text) return "Sem sinopse";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <Container className="p-4">
      <div className="d-flex justify-content-end mb-3">
        <Button variant="success" style={{ borderRadius: "50px" }} onClick={handleShowAdicionar}>+ Adicionar Filme</Button>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editarFilme ? 'Editar Filme' : 'Adicionar Filme'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Título do Filme <span className="text-danger">*</span> </Form.Label>
              <Form.Control
                type="text"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                autoFocus
                isInvalid={titulo.trim().length < 3 && titulo.length > 0}
              />
              <Form.Control.Feedback type="invalid">
                O título deve ter pelo menos 3 caracteres.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Data de publicação</Form.Label>
              <Form.Control type="date" value={dt_lancamento} onChange={e => setDt_lancamento(e.target.value)} min="1900" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Diretor</Form.Label>
              <Form.Control type="text" rows={3} value={diretor} onChange={e => setDiretor(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Roteristas</Form.Label>
              <Form.Control type="text" rows={3} value={roteiro} onChange={e => setRoteiro(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>URL da Imagem</Form.Label>
              <Form.Control type="text" value={capa_filme} onChange={e => setCapa_filme(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Gêneros</Form.Label>
              <div>
                {opcoesGeneros.map(g => (
                  <Form.Check
                    inline
                    key={g}
                    type="checkbox"
                    label={g}
                    value={g}
                    checked={generos.includes(g)}
                    onChange={handleGeneroChange}
                  />
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Fechar</Button>
          <Button variant="success" disabled={titulo.trim().length < 3} onClick={handleSave}>
            {editarFilme ? 'Salvar Alterações' : 'Adicionar Filme'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Lista de filmes */}
      <Row className="g-3">
        {movies.map(movie => (
          <Col key={movie.id} md={3}>
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

                <Button variant="success" onClick={() => handleEditar(movie)}>Editar</Button>
                <Button variant="danger" onClick={() => handleDelete(movie)}>
                  Excluir
                </Button>

              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default TelaADM;