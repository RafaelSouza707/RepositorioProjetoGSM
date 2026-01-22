import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { Button, Row } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "/src/components/TelaLogin.css";
import { criarUsuario, login } from "../services/usuario";
import Alert from "react-bootstrap/Alert";

function TelaLogin({ setUser }) {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [modoCadastro, setModoCadastro] = useState(false);
    const [showSenha, setShowSenha] = useState(false);
    const navigate = useNavigate();

    const [errors, setErrors] = useState({});
    const [mensagemErro, setMensagemErro] = useState("");
    const [mensagemSucesso, setMensagemSucesso] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        try {
            const data = await login(email, senha);
            setUser(data);
            localStorage.setItem("user", JSON.stringify(data));
            navigate(data.tipo === "adm" ? "/tela-adm" : "/");

        } catch (err) {
            const mensagens = {
                404: "Esse email não está cadastrado",
                401: "Credenciais inválidas.",
            };

            if (err.response) {
                setMensagemErro(
                    mensagens[err.response.status] || "Erro ao tentar login. Tente novamente."
                );
            } else {
                setMensagemErro("Erro de conexão com o servidor");
            }
            setMensagemSucesso("");
        }
    };

    const handleCadastro = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        try {
            await criarUsuario({ nome, email, senha });
            setMensagemSucesso("Usuário criado com sucesso!");
            setMensagemErro("");
            setModoCadastro(false);

        } catch (err) {
            const mensagens = {
                409: "Esse email já está cadastrado",
            };

            if (err.response) {
                setMensagemErro(
                    mensagens[err.response.status] || "Erro ao criar usuário. Tente novamente."
                );
            } else {
                setMensagemErro("Erro de conexão com o servidor");
            }

            setMensagemSucesso("");
        }
    };
    useEffect(() => {


        if (mensagemErro || mensagemSucesso) {
            const timer = setTimeout(() => {
                setMensagemErro("");
                setMensagemSucesso("");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [mensagemErro, mensagemSucesso]);

    const validarEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validarFormulario = () => {
        const novosErros = {};

        if (!validarEmail(email)) {
            novosErros.email = "Email inválido";
        }

        if (modoCadastro) {
            if (nome.trim().length < 3) {
                novosErros.nome = "Nome deve ter pelo menos 3 letras";
            }

            if (senha.length < 6) {
                novosErros.senha = "Senha deve ter no mínimo 6 caracteres";
            }
        }

        setErrors(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const formPreenchido = modoCadastro
        ? nome.trim() !== "" && email.trim() !== "" && senha.trim() !== ""
        : email.trim() !== "" && senha.trim() !== "";

    const limparErro = (campo) => {
        setErrors((prev) => ({
            ...prev,
            [campo]: undefined,
        }));
    };

    const limparMensagens = () => {
        setMensagemErro("");
        setMensagemSucesso("");
    };

    return (

        <section className="login-container">
            <Form
                className="card-login"
                onSubmit={modoCadastro ? handleCadastro : handleLogin}
            >
                <h2 className="login-title">
                    {modoCadastro ? "Criar conta" : "Entrar"}
                </h2>

                {mensagemErro && (
                    <Alert variant="danger" dismissible onClose={() => setMensagemErro("")}>{mensagemErro}</Alert>
                )}

                {mensagemSucesso && (
                    <Alert variant="success" dismissible onClose={() => setMensagemSucesso("")}> {mensagemSucesso}</Alert>
                )}

                {modoCadastro && (
                    <Form.Group className="mb-3">
                        <Form.Label>Nome <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            isInvalid={!!errors.nome}
                            value={nome}
                            onChange={(e) => { setNome(e.target.value); limparErro("nome"); limparMensagens(); }}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.nome}
                        </Form.Control.Feedback>
                    </Form.Group>
                )}

                <Form.Group className="mb-3">
                    <Form.Label>Email <span className="text-danger">*</span> </Form.Label>
                    <Form.Control
                        type="email"
                        isInvalid={!!errors.email}
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); limparErro("email") }}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.email}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Senha <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                        type={showSenha ? "text" : "password"}
                        isInvalid={!!errors.senha}
                        value={senha}
                        onChange={(e) => { setSenha(e.target.value); limparErro("senha") }}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.senha}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Check
                    className="mb-3"
                    type="checkbox"
                    label="Mostrar senha"
                    checked={showSenha}
                    onChange={() => setShowSenha(!showSenha)}
                />

                <Button type="submit" className="botao-primario w-100 mb-2" disabled={!formPreenchido}>
                    {modoCadastro ? "Cadastrar" : "Entrar"}
                </Button>

                <Button
                    type="button"
                    variant="link"
                    className="botao-secundario w-100 text-center"
                    onClick={() => setModoCadastro(!modoCadastro)}
                >
                    {modoCadastro ? "Já tenho conta" : "Criar conta"}
                </Button>
            </Form>
        </section>
    );
}

export default TelaLogin;
