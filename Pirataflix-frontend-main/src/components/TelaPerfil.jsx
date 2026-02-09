import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Spinner, Button, Modal, Form, Table } from "react-bootstrap";
import IconeUsuario from "../components/InconeUsuario";
import "./TelaPerfil.css";
import "./Home.css";
import { Trash, Pencil } from "react-bootstrap-icons";
import { atualizarUsuario, deletarUsuario, removerAssistido } from "../services/usuario";

function TelaPerfil({ user }) {
  const [assistidos, setAssistidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usuarioAtual, setUsuarioAtual] = useState(user);

  // Modais
  const [showModal, setShowModal] = useState(false);
  const [showModalAdmin, setShowModalAdmin] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [nome, setNome] = useState(user?.nome || "");
  const [email, setEmail] = useState(user?.email || "");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const navigate = useNavigate();
  const isAdmin = user?.tipo === "adm";

  useEffect(() => {
    setUsuarioAtual(user);
  }, [user]);

  useEffect(() => {
    if (usuarioAtual) {
      setNome(usuarioAtual.nome || "");
      setEmail(usuarioAtual.email || "");
    }
  }, [usuarioAtual, showModal]);

  // BUSCAR ASSISTIDOS 
  useEffect(() => {
    const fetchAssistidos = async () => {
      if (!user || isAdmin) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`http://localhost:5000/usuarios/${user.id}/assistidos`);

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
  }, [user, isAdmin]);

  // BUSCAR USUARIOS 
  useEffect(() => {
    const fetchUsuarios = async () => {
      if (!isAdmin) return;

      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/usuarios`);
        const data = await res.json();
        setUsuarios(data);
      } catch (err) {
        setError("Erro ao carregar usuários");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, [isAdmin]);

  // editar perfil próprio
  const handleSalvarPerfil = async () => {
    if (!nome.trim()) {
      alert("O nome não pode ficar vazio.");
      return;
    }

    if (!window.confirm("Deseja salvar as alterações?")) return;

    try {
      setSalvando(true);
      const dadosAtualizacao = { nome: nome.trim() };

      // Admin pode atualizar email também
      if (isAdmin && email.trim()) {
        dadosAtualizacao.email = email.trim();
      }

      const usuarioAtualizado = await atualizarUsuario(usuarioAtual.id, dadosAtualizacao);

      setUsuarioAtual(usuarioAtualizado);
      localStorage.setItem("user", JSON.stringify(usuarioAtualizado));
      setShowModal(false);
    } catch (err) {
      alert("Erro ao atualizar perfil.");
    } finally {
      setSalvando(false);
    }
  };

  // admin editar usuário
  const handleSalvarAdmin = async () => {
    if (!nome.trim()) return;
    if (!window.confirm("Deseja salvar as alterações?")) return;

    setSalvando(true);
    await atualizarUsuario(usuarioSelecionado.id, { nome, email });
    setUsuarios((prev) =>
      prev.map((u) => (u.id === usuarioSelecionado.id ? { ...u, nome, email } : u))
    );
    setShowModalAdmin(false);
    setSalvando(false);
  };

  // admin excluir usuário
  const handleExcluirUsuarioAdmin = async (id) => {
    if (!window.confirm("Deseja excluir este usuário?")) return;

    await deletarUsuario(id);
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };

  // excluir própria conta
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

  // remover filme assistido
  const handleRemoverAssistido = async (movieId) => {
    if (!window.confirm("Deseja remover este filme da lista de assistidos?")) return;

    try {
      await removerAssistido(user.id, movieId);
      setAssistidos((prev) => prev.filter((movie) => movie.id !== movieId));
    } catch (err) {
      alert("Erro ao remover filme da lista de assistidos.");
    }
  };

  if (!user) {
    return (
      <Container className="text-center mt-5">
        <h3>Você precisa estar logado para acessar o perfil.</h3>
      </Container>
    );
  }

  if (!usuarioAtual) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }


  return (
    <Container className="home mt-5" style={{ fontFamily: 'Inter, sans-serif' }}>

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

        {/* Botões de editar e excluir */}
        <div className="d-flex flex-column align-items-end gap-2">
          <Button
            variant="light"
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
      <br />

      {/* ADMIN TABELA DE USUÁRIOS */}
      {isAdmin ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4 lista-header">
            <h2 className="m-0 titulo-lista">
              <span className="barra-titulo"></span>
              Gerenciar Usuários <span className="text-secondary">({usuarios.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" />
            </div>
          ) : (
              <div className="table-container"> {/* tabela de usuários */}
              <Table responsive hover className="admin-table align-middle table-dark">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Email</th>
                    <th className="text-center">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <IconeUsuario name={u.nome} size={35} />
                          <span className="fw-semibold">{u.nome}</span>
                        </div>
                      </td>

                      <td className="text-secondary">{u.email}</td>

                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-2"
                          onClick={() => {
                            setUsuarioSelecionado(u);
                            setNome(u.nome);
                            setEmail(u.email);
                            setShowModalAdmin(true);
                          }}
                        >
                          <Pencil size={14} />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleExcluirUsuarioAdmin(u.id)}
                        >
                          <Trash size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </>

      ) : (

        /* USUARIO */

        /* Lista de Assistidos USUARIO */
        <div className="assistidos-section">
          <div className="lista-header mb-3">
          <span className="barra-titulo"></span>
          <h2 className="titulo-lista">Filmes assistidos <span className="contador">({assistidos.length})</span></h2>
        </div>

          <br />

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
                  <Card className="perfil-card h-100 movie-card">
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
                        style={{ width: "80%", borderRadius: "20px", height: "30px" }}
                        onClick={() => handleRemoverAssistido(movie.id)}
                      >
                        Remover
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      )}


      {/* MODAL EDITAR PERFIL USUÁRIO */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: "#1d1d1d" }}>
          <Modal.Title>Editar Perfil</Modal.Title>
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
              <Form.Label style={isAdmin ? {} : { color: "#a3a3a3" }}>Email</Form.Label>
              <Form.Control
                type="email"
                value={isAdmin ? email : usuarioAtual.email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isAdmin}
                style={isAdmin ? {} : { color: "#a3a3a3", cursor: "not-allowed", backgroundColor: "#585858" }}
              />
              {!isAdmin && (
                <Form.Text style={{ color: "#d31a1a" }}>
                  O email não pode ser alterado.
                </Form.Text>
              )}
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


      {/* MODAL EXCLUIR CONTA USUÁRIO */}
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


      {/* MODAL EDITAR USUARIO ADMIN */}
          <Modal show={showModalAdmin} onHide={() => setShowModalAdmin(false)} centered>
            <Modal.Header closeButton style={{ backgroundColor: "#1d1d1d" }}>
              <Modal.Title>Editar usuário</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group>
                  <Form.Label>Nome</Form.Label>
                  <Form.Control value={nome} onChange={(e) => setNome(e.target.value)} />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control value={email} onChange={(e) => setEmail(e.target.value)} />
                </Form.Group>
              </Form>

            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModalAdmin(false)}>
                Cancelar
              </Button>
              <Button variant="success" onClick={handleSalvarAdmin} disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar"}
              </Button>
            </Modal.Footer>
          </Modal>
          
    </Container>
  );
}

export default TelaPerfil;