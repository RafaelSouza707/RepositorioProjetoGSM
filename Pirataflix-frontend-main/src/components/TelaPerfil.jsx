import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import IconeUsuario from "../components/InconeUsuario";
import "./TelaPerfil.css";

function TelaPerfil({ user }) {
  const [assistidos, setAssistidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // buscar lista de assistidos 
  useEffect(() => {
    const fetchAssistidos = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `http://localhost:5000/users/${user.id}/listaAssistido`
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Erro ao buscar assistidos");
        }

        const data = await res.json();
        setAssistidos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssistidos();
  }, [user]);

  if (!user) {
    return (
      <Container className="text-center mt-5">
        <h3>Você precisa estar logado para acessar o perfil.</h3>
      </Container>
    );
  }

  return (
    <Container className="perfil-container py-5">
      {/* Header do perfil */}
      <div className="perfil-header d-flex align-items-center mb-5">
        <div className="perfil-icone me-3">
          <IconeUsuario name={user.nome || user.name} size={90} />
        </div>
        <div>
          <h2 className="perfil-nome">{user.nome || user.name}</h2>
          <p className="perfil-email">{user.email}</p>
        </div>
      </div>

      {/* Lista de Assistidos */}
      <h4 className="mb-3">Filmes Assistidos</h4>

      {loading && (
        <div className="d-flex justify-content-center my-4">
          <Spinner animation="border" />
        </div>
      )}

      {error && (
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          {assistidos.length === 0 ? (
            <p>
              Você ainda não marcou nenhum filme como assistido.
            </p>
          ) : (
            <Row className="g-3">
              {assistidos.map((movie) => (
                <Col key={movie.id} xs={6} sm={4} md={3} lg={2}>
                  <Card className="perfil-card h-100">
                    {movie.imagem && (
                      <Card.Img
                        variant="top"
                        src={movie.imagem}
                        className="perfil-card-img"
                      />
                    )}
                    <Card.Body className="text-center">
                      <Card.Title className="perfil-card-titulo">
                        {movie.titulo}
                      </Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}
    </Container>
  );
}

export default TelaPerfil;
