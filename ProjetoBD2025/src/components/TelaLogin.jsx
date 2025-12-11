import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { Button, Row } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "/src/components/TelaLogin.css";
import { criarUsuario, login } from "../services/usuario";

function TelaLogin({ setUser }) {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [modoCadastro, setModoCadastro] = useState(false);
    const [showSenha, setShowSenha] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const data = await login(email, senha);

            setUser(data);
            localStorage.setItem("user", JSON.stringify(data));

            navigate("/");
        } catch (err) {
            alert(err.message);
        }
    };


    const handleCadastro = async (e) => {
        e.preventDefault();

        try {
            const resultado = await criarUsuario({
                nome,
                email,
                senha
            });

            console.log("Usuário criado: ", resultado);
            alert("Usuário criado")
            setModoCadastro(false);

        } catch (err) {
            console.error("Erro ao criar usuário:", err);
            alert("Erro ao criar usuário");
        }
    };

    return (
        <section className="d-flex justify-content-center align-items-center">
            <Form
                className="card-login"
                onSubmit={modoCadastro ? handleCadastro : handleLogin}
            >
                {modoCadastro && (
                    <Form.Group className="mb-3">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Digite seu nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />
                    </Form.Group>
                )}

                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="exemplo@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Senha</Form.Label>
                    <Form.Control
                        type={showSenha ? "text" : "password"}
                        placeholder="* * * *"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Check
                        type="checkbox"
                        label="Mostrar senha"
                        checked={showSenha}
                        onChange={() => setShowSenha(!showSenha)}
                    />
                </Form.Group>

                <Row>
                    <Button type="submit" variant="light" className="botao-form">
                        {modoCadastro ? "Cadastrar" : "Entrar"}
                    </Button>
                    <Button
                        type="button"
                        variant="light"
                        className="botao-form"
                        onClick={() => setModoCadastro(!modoCadastro)}
                    >
                        {modoCadastro ? "Já tenho conta" : "Cadastre-se"}
                    </Button>
                </Row>
            </Form>
        </section>
    );
}

export default TelaLogin;
