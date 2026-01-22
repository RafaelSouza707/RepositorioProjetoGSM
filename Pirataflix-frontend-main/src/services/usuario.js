import api from "./api";

export async function listarUsuarios() {
    const resposta = await api.get("/usuarios");
    return resposta.data;
}

export async function criarUsuario(dados) {
    const resposta = await api.post("/usuarios", dados);
    return resposta.data;
}

export async function login(email, senha) {
    const resposta = await api.post("/login", { email, senha});
    return resposta.data;
}

export async function atualizarUsuario(id_usuario, dados) {
    const resposta = await api.put(`/usuarios/${id_usuario}`, dados);
    return resposta.data;
}

export async function listarFavoritos(id_usuario) {
    const resposta = await api.get(`/usuarios/${id_usuario}/favoritos`);
    return resposta.data;
}

export async function adicionarFavorito(id_usuario, id_filme) {
    const resposta = await api.post(`/usuarios/${id_usuario}/favoritos/${id_filme}`);
    return resposta.data;
}

export async function removerFavorito(id_usuario, id_filme) {
    const resposta = await api.delete(`/usuarios/${id_usuario}/favoritos/${id_filme}`);
    return resposta.data;
}

export async function marcarAssistido(id_usuario, id_filme) {
    const resposta = await api.post(`/usuarios/${id_usuario}/assistidos/${id_filme}`);
    return resposta.data;
}

export async function removerAssistido(id_usuario, id_filme) {
    const resposta = await api.delete(`/usuarios/${id_usuario}/assistidos/${id_filme}`);
    return resposta.data;
}