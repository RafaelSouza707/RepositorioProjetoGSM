import api from "./api";

export async function listarFilmes() {
    const resposta = await api.get("/filme");
    return resposta;
}

export async function criarFilme(dados) {
    const resposta = await api.post("/filme", dados);
    return resposta.data;
}

export async function atualizarFilme(dados) {
    const resposta = await api.put(`/filme/${id}`, dados);
    return resposta.data;
}

export async function deletarFilme() {
    const resposta = await api.delete(`/filme/${id}`);
    return resposta.data;
}