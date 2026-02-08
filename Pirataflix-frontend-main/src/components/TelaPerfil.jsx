import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Spinner, Button, Modal, Form } from "react-bootstrap";
import IconeUsuario from "../components/InconeUsuario";
import "./TelaPerfil.css";
import { Trash, Pencil } from "react-bootstrap-icons";
import { atualizarUsuario, deletarUsuario, removerAssistido } from "../services/usuario";

function TelaPerfil({ user }) {
  const [assistidos, setAssistidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usuarioAtual, setUsuarioAtual] = useState(user);

  // modal editar
  const [showModal, setShowModal] = useState(false);
  const [nome, setNome] = useState(user?.nome || user?.name || "");
  const [salvando, setSalvando] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setUsuarioAtual(user);
  }, [user]);

  useEffect(() => {
    if (usuarioAtual) {
      setNome(usuarioAtual.nome || "");
    }
  }, [usuarioAtual, showModal]);

  // buscar lista de assistidos
  useEffect(() => {
    const fetchAssistidos = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `http://localhost:5000/usuarios/${user.id}/assistidos`
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

  const handleSalvarPerfil = async () => {
    if (!nome.trim()) {
      alert("O nome não pode ficar vazio.");
      return;
    }

    try {
      setSalvando(true);

      const usuarioAtualizado = await atualizarUsuario(usuarioAtual.id, {
        nome: nome.trim(),
      });

      // atualiza estado
      setUsuarioAtual(usuarioAtualizado);

      // atualiza localStorage
      localStorage.setItem("user", JSON.stringify(usuarioAtualizado));

      setShowModal(false);
    } catch (err) {
      alert("Erro ao atualizar perfil.");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirConta = async () => {
    try {
      setExcluindo(true);

      await deletarUsuario(usuarioAtual.id);
      localStorage.removeItem("user");

      navigate("/tela-login");
    } catch (err) {
      alert("Erro ao excluir conta.");
    } finally {
      setExcluindo(false);
      setShowConfirm(false);
    }
  };

  if (!usuarioAtual) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  const handleRemoverAssistido = async (movieId) => {

    const confirmar = window.confirm(
    "Deseja remover este filme da lista de assistidos?"
  );

  if (!confirmar) return;

    try {
      await removerAssistido(user.id, movieId);

      setAssistidos((prev) =>
        prev.filter((movie) => movie.id !== movieId)
      );
    } catch (err) {
      alert("Erro ao remover filme da lista de assistidos.");
    }
  };

  return (
    <Container className="perfil-container py-5">

      {/* Header do perfil */}
      <div className="perfil-header d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          <div className="perfil-icone me-3">
            <IconeUsuario name={usuarioAtual.nome || usuarioAtual.name} size={90} />
          </div>

          <div>
            <h2 className="perfil-nome">{usuarioAtual.nome || usuarioAtual.name}</h2>
            <p className="perfil-email">{usuarioAtual.email}</p>
          </div>
        </div>

        {/* Botões */}
        <div className="d-flex flex-column align-items-end gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowModal(true)}
            style={{ borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "2px" }}
          >
            <Pencil className="me-2" />
            Editar perfil
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowConfirm(true)}
            style={{ borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "1px" }}
          >
            <Trash className="me-1" />
            Excluir conta
          </Button>
        </div>
      </div>

      <hr />

      <div className="assistidos-section">
        <h4 className="p-3">Filmes Assistidos</h4>

        {loading && (
          <div className="d-flex justify-content-center my-4">
            <Spinner animation="border" />
          </div>
        )}

        {assistidos.length === 0 ? (
          <p style={{ color: "#bbb", paddingLeft: "15px" }}>
            Você ainda não marcou nenhum filme como assistido.
          </p>
        ) : (
          <Row className="g-3">
            {assistidos.map((movie) => (
              <Col key={movie.id} xs={6} sm={4} md={3} lg={2}>
                <Card className="perfil-card h-100">
                  {movie.capa_filme && (
                    <Card.Img
                      variant="top"
                      src={movie.capa_filme}
                      className="perfil-card-img"
                    />
                  )}
                  <Card.Body className="text-center">
                    <Card.Title className="perfil-card-titulo">
                      {movie.titulo}
                    </Card.Title>

                    <Button
                      variant="danger"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleRemoverAssistido(movie.id)}
                    >
                      Remover da lista
                    </Button>

                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>


      {/* Modal Editar Perfil */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: "#1d1d1d" }}>
          <Modal.Title >Editar Perfil</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label style={{ color: "#a3a3a3" }}>Email</Form.Label>
              <Form.Control
                type="email"
                value={usuarioAtual.email}
                disabled
                style={{ color: "#a3a3a3", cursor: "not-allowed", backgroundColor: "#585858" }}
              />
              <Form.Text style={{ color: "#d31a1a" }}>
                O email não pode ser alterado.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleSalvarPerfil} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </Modal.Footer>
      </Modal>


      {/* Modal Excluir Conta */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: "#202020" }}>
          <Modal.Title>Excluir conta</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>
            Tem certeza que deseja <strong>excluir sua conta</strong>?
          </p>
          <p className="text-danger mb-0">
            Essa ação não poderá ser desfeita.
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirm(false)}
            disabled={excluindo}
          >
            Cancelar
          </Button>

          <Button
            variant="danger"
            onClick={handleExcluirConta}
            disabled={excluindo}
          >
            {excluindo ? "Excluindo..." : "Excluir conta"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TelaPerfil;
