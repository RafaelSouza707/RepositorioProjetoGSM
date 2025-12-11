import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Container, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';

function TelaADM() {

  const atualizarPagina = () => {
    window.location.reload();
  };
  
  const [showModal, setShowModal] = useState(false);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editarFilme, setEditarFilme] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [dataLancamento, setDataLancamento] = useState('');
  const [sinopse, setSinopse] = useState('');
  const [imagem, setImagem] = useState('');
  const [generos, setGeneros] = useState([]);

  const opcoesGeneros = ["Ação", "Comédia", "Drama", "Fantasia", "Terror"];

  const handleShowAdicionar = () => {
    setEditarFilme(null);
    setTitulo('');
    setDataLancamento('');
    setSinopse('');
    setImagem('');
    setGeneros([]);
    setShowModal(true);
  };

  const handleEditar = (movie) => {
    setEditarFilme(movie);
    setTitulo(movie.titulo || '');
    setDataLancamento(movie.dataLancamento || '');
    setSinopse(movie.sinopse || '');
    setImagem(movie.imagem || '');
    setGeneros(movie.generos || []);
    setShowModal(true);
  };

  const handleDelete = async (movie) => {
    if(!window.confirm (`Deseja realmente excluir o filme "${movie.titulo}"?`)) return;

    try {
        const response = await fetch(`http://localhost:5000/movies/${movie['@metadata']['@id']}`, {
            method: 'DELETE'
        });

        if ( !response.ok ) throw new error("Erro ao deletar filme");

        setMovies(prev => prev.filter( m => m['@metadata']['@id'] !== movie['@metadata']['@id']));
    } catch (err) {
        alert(err.message);
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

// https://uauposters.com.br/media/catalog/product/cache/1/thumbnail/800x930/9df78eab33525d08d6e5fb8d27136e95/2/1/214920140608-uau-posters-filmes-infantis-animacao-carros-cars--3.jpg

  const handleSave = async () => {
    const filme = { titulo, dataLancamento, sinopse, imagem, generos };

    try {
      let response;
      if (editarFilme) {
        // Atualizar
        response = await fetch(`http://localhost:5000/movies/${editarFilme.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filme)
    });

      } else {
        // Criar
        response = await fetch('http://localhost:5000/movies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filme)
        });
      }

      if (!response.ok) throw new Error('Erro ao salvar filme');

      const movieAtualizado = await response.json();

      if (editarFilme) {
            setMovies(prev => prev.map(m => m.id === movieAtualizado.id ? movieAtualizado : m));
        } else {
            setMovies(prev => [...prev, movieAtualizado]);
        }

      setEditarFilme(null);
      setTitulo('');
      setDataLancamento('');
      setSinopse('');
      setImagem('');
      setGeneros([]);
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    }
    atualizarPagina();
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:5000/movies');
        if (!response.ok) throw new Error(`Erro: ${response.statusText}`);
        const data = await response.json();
        setMovies(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
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
              <Form.Label>Nome do Filme</Form.Label>
              <Form.Control type="text" value={titulo} onChange={e => setTitulo(e.target.value)} autoFocus />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ano de Publicação</Form.Label>
              <Form.Control type="number" value={dataLancamento} onChange={e => setDataLancamento(e.target.value)} min="1900" max="2100" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Sinopse</Form.Label>
              <Form.Control as="textarea" rows={3} value={sinopse} onChange={e => setSinopse(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>URL da Imagem</Form.Label>
              <Form.Control type="text" value={imagem} onChange={e => setImagem(e.target.value)} />
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
              {movie.imagem && <Card.Img variant="top" src={movie.imagem} className='card-img-fixed' />}
              <Card.Body className="d-flex flex-column">
                <Card.Title>{movie.titulo || 'Sem título'}</Card.Title>
                <Card.Text className="flex-grow-1">
                    {truncateText(movie.sinopse, 100)}
                </Card.Text>
                <Card.Text>
                  <strong>Gêneros:</strong> {(movie.generos || []).join(', ')}
                </Card.Text>
                <Card.Text>
                  <small>Lançamento: {movie.dataLancamento || 'N/A'}</small>
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