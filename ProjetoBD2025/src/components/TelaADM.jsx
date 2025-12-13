import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Container, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import { listarFilmes, criarFilme, atualizarFilme, deletarFilme } from "../services/filme";

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
    if(!window.confirm (`Deseja realmente excluir o filme "${movie.titulo}"?`)) return;

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

        setMovies(prev=> prev.map(m=> (m.id === filmeSalvo.id ? filmeSalvo : m)))
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
        <Button variant="primary" onClick={handleShowAdicionar}>+ Adicionar Filme</Button>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editarFilme ? 'Editar Filme' : 'Adicionar Filme'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Titulo do Filme</Form.Label>
              <Form.Control type="text" value={titulo} onChange={e => setTitulo(e.target.value)} autoFocus />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Data de publicação</Form.Label>
              <Form.Control type="date" value={dt_lancamento} onChange={e => setDt_lancamento(e.target.value)} min="1900"/>
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
          <Button variant="primary" onClick={handleSave}>
            {editarFilme ? 'Salvar Alterações' : 'Adicionar Filme'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Lista de filmes */}
      <Row className="g-3">
        {movies.map(movie => (
          <Col key={movie.id} md={2}>
            <Card className="movie-card">
              {movie.capa_filme && <Card.Img variant="top" src={movie.capa_filme} className='card-img-fixed' />}
              <Card.Body className="d-flex flex-column">
                <Card.Title>{movie.titulo || 'Sem título'}</Card.Title>
                <Card.Text className="flex-grow-1">
                    {truncateText(movie.diretor, 100)}
                </Card.Text>
                <Card.Text className="flex-grow-1">
                    {truncateText(movie.roteiro, 100)}
                </Card.Text>
                <Card.Text>
                  <strong>Gêneros:</strong> {(movie.generos || []).join(', ')}
                </Card.Text>
                <Card.Text>
                  <small>Lançamento: {movie.dt_lancamento || 'N/A'}</small>
                </Card.Text>
                <div className="d-flex justify-content-between mt-2">
                  <Button variant="primary" onClick={() => handleEditar(movie)}>Editar</Button>
                  <Button variant="danger" style={{ marginLeft: "10px" }} onClick={() => handleDelete(movie)}>
                    Excluir
                  </Button>

                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default TelaADM;