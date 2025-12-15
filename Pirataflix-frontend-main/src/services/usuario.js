import api from "./api";

export async function listarUsuarios() {
    const resposta = await api.get("/usuarios");
    return resposta;
}

export async function criarUsuario(dados) {
    const resposta = await api.post("/usuarios", dados);
    return resposta.data;
}

export async function login(email, senha) {
    const resposta = await api.post("/login", { email, senha});
    return resposta.data;
}

export async function atualizarUsuario(dados) {
    const resposta = await api.put(`/usuarios/${id}`, dados);
    return respota.data;
}

export async function listarFilmesDoUsuario() {
    return [];
}

export async function adicionarFilmeLista() {}

export async function removerFilmeLista() {}

export async function marcarAssistido() {}