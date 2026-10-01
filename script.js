const API_URL = "http://localhost:3000/jogos";

let jogos = [];
let editandoId = null;

const form = document.getElementById("jogoForm");
const listaJogos = document.getElementById("listaJogos");
const pesquisa = document.getElementById("pesquisa");
const filtroStatus = document.getElementById("filtroStatus");
const ordenacao = document.getElementById("ordenacao");
const mensagem = document.getElementById("mensagem");

const titulo = document.getElementById("titulo");
const genero = document.getElementById("genero");
const plataforma = document.getElementById("plataforma");
const nota = document.getElementById("nota");
const status = document.getElementById("status");
const jogoId = document.getElementById("jogoId");

const tituloFormulario = document.getElementById("tituloFormulario");
const salvarBtn = document.getElementById("salvarBtn");
const cancelarBtn = document.getElementById("cancelarBtn");

document.addEventListener("DOMContentLoaded", () => {
    carregarJogos();
    carregarTema();
});

form.addEventListener("submit", salvarJogo);
cancelarBtn.addEventListener("click", limparFormulario);
pesquisa.addEventListener("input", renderizarJogos);
filtroStatus.addEventListener("change", renderizarJogos);
ordenacao.addEventListener("change", renderizarJogos);

document.getElementById("temaBtn").addEventListener("click", alternarTema);

async function carregarJogos() {
    mostrarMensagem("");

    try {
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os jogos.");
        }

        jogos = await resposta.json();
        atualizarDashboard();
        renderizarJogos();
    } catch (erro) {
        console.error("Erro:", erro);
        listaJogos.innerHTML = `
            <div class="vazio">
                Não foi possível conectar com a API.<br>
                <small>Verifique se o JSON Server está ligado em http://localhost:3000.</small>
            </div>
        `;
        atualizarDashboard();
        mostrarMensagem("Não foi possível conectar com a API. Ligue o JSON Server e tente novamente.");
    }
}

function renderizarJogos() {
    const termo = pesquisa.value.trim().toLowerCase();
    const statusSelecionado = filtroStatus.value;

    let jogosFiltrados = jogos.filter((jogo) => {
        const correspondePesquisa = jogo.titulo.toLowerCase().includes(termo);
        const correspondeStatus =
            statusSelecionado === "Todos" || jogo.status === statusSelecionado;

        return correspondePesquisa && correspondeStatus;
    });

    if (ordenacao.value === "tituloAsc") {
        jogosFiltrados.sort((a, b) => a.titulo.localeCompare(b.titulo));
    }

    if (ordenacao.value === "notaDesc") {
        jogosFiltrados.sort((a, b) => Number(b.nota) - Number(a.nota));
    }

    if (ordenacao.value === "notaAsc") {
        jogosFiltrados.sort((a, b) => Number(a.nota) - Number(b.nota));
    }

    document.getElementById("contadorResultados").textContent =
        `${jogosFiltrados.length} ${jogosFiltrados.length === 1 ? "jogo" : "jogos"}`;

    if (jogosFiltrados.length === 0) {
        listaJogos.innerHTML = `
            <div class="vazio">
                Nenhum jogo encontrado com esses filtros.
            </div>
        `;
        return;
    }

    listaJogos.innerHTML = jogosFiltrados.map(criarCard).join("");
}

function criarCard(jogo) {
    const statusClasse = {
        "Jogando": "status-jogando",
        "Finalizado": "status-finalizado",
        "Quero jogar": "status-quero",
        "Abandonado": "status-abandonado"
    }[jogo.status] || "";

    return `
        <article class="jogo-card ${Number(jogo.nota) >= 9 ? "nota-alta" : ""}">
            <h3>${escaparHTML(jogo.titulo)}</h3>
            <p class="info-jogo">
                ${escaparHTML(jogo.genero)} • ${escaparHTML(jogo.plataforma)}
            </p>
            <p class="nota">★ Nota ${Number(jogo.nota).toFixed(1).replace(".0", "")}</p>
            <span class="status ${statusClasse}">
                ${escaparHTML(jogo.status)}
            </span>
            <div class="acoes-card">
                <button class="btn-editar" onclick="editarJogo('${jogo.id}')">
                    EDITAR
                </button>
                <button class="btn-excluir" onclick="excluirJogo('${jogo.id}')">
                    EXCLUIR
                </button>
            </div>
        </article>
    `;
}

async function salvarJogo(evento) {
    evento.preventDefault();

    const dados = {
        titulo: titulo.value.trim(),
        genero: genero.value.trim(),
        plataforma: plataforma.value.trim(),
        nota: Number(nota.value),
        status: status.value
    };

    const erro = validarJogo(dados);

    if (erro) {
        mostrarMensagem(erro);
        return;
    }

    try {
        const url = editandoId ? `${API_URL}/${editandoId}` : API_URL;
        const metodo = editandoId ? "PUT" : "POST";

        const resposta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            throw new Error("Erro ao salvar o jogo.");
        }

        const jogoSalvo = await resposta.json();

        mostrarMensagem(
            editandoId
                ? `"${jogoSalvo.titulo}" foi atualizado com sucesso!`
                : `"${jogoSalvo.titulo}" foi cadastrado com sucesso!`,
            "sucesso"
        );

        limparFormulario();
        await carregarJogos();
    } catch (erro) {
        console.error("Erro:", erro);
        mostrarMensagem("Não foi possível salvar o jogo. Verifique se a API está funcionando.");
    }
}

async function editarJogo(id) {
    const jogo = jogos.find((item) => String(item.id) === String(id));

    if (!jogo) {
        mostrarMensagem("Jogo não encontrado.");
        return;
    }

    editandoId = jogo.id;
    jogoId.value = jogo.id;

    titulo.value = jogo.titulo;
    genero.value = jogo.genero;
    plataforma.value = jogo.plataforma;
    nota.value = jogo.nota;
    status.value = jogo.status;

    tituloFormulario.textContent = "Editar jogo";
    salvarBtn.textContent = "Salvar alterações";
    cancelarBtn.textContent = "Cancelar edição";

    document.querySelector(".formulario-painel").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

async function excluirJogo(id) {
    const jogo = jogos.find((item) => String(item.id) === String(id));

    if (!jogo) {
        mostrarMensagem("Jogo não encontrado.");
        return;
    }

    const confirmar = confirm(`Tem certeza que deseja excluir "${jogo.titulo}"?`);

    if (!confirmar) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!resposta.ok) {
            throw new Error("Erro ao excluir o jogo.");
        }

        mostrarMensagem(`"${jogo.titulo}" foi excluído com sucesso!`, "sucesso");
        await carregarJogos();
    } catch (erro) {
        console.error("Erro:", erro);
        mostrarMensagem("Não foi possível excluir o jogo. Verifique a conexão com a API.");
    }
}

function validarJogo(dados) {
    if (!dados.titulo) {
        return "Informe o título do jogo.";
    }

    if (!dados.genero) {
        return "Informe o gênero do jogo.";
    }

    if (!dados.plataforma) {
        return "Informe a plataforma do jogo.";
    }

    if (nota.value === "") {
        return "Informe uma nota entre 0 e 10.";
    }

    if (Number.isNaN(dados.nota) || dados.nota < 0 || dados.nota > 10) {
        return "A nota precisa estar entre 0 e 10.";
    }

    if (!dados.status) {
        return "Selecione um status para o jogo.";
    }

    return null;
}

function limparFormulario() {
    form.reset();
    editandoId = null;
    jogoId.value = "";
    tituloFormulario.textContent = "Cadastrar novo jogo";
    salvarBtn.textContent = "Cadastrar jogo";
    cancelarBtn.textContent = "Limpar";
}

function atualizarDashboard() {
    const total = jogos.length;
    const jogando = jogos.filter((jogo) => jogo.status === "Jogando").length;
    const finalizados = jogos.filter((jogo) => jogo.status === "Finalizado").length;

    const media = total
        ? jogos.reduce((soma, jogo) => soma + Number(jogo.nota), 0) / total
        : 0;

    document.getElementById("totalJogos").textContent = total;
    document.getElementById("totalJogando").textContent = jogando;
    document.getElementById("totalFinalizados").textContent = finalizados;
    document.getElementById("mediaNotas").textContent = media.toFixed(1);
}

function mostrarMensagem(texto, tipo = "erro") {
    mensagem.textContent = texto;

    if (tipo === "sucesso") {
        mensagem.style.background = "#eaf8f1";
        mensagem.style.color = "#249a68";
        mensagem.style.borderColor = "#c8eddc";
    } else {
        mensagem.style.background = "";
        mensagem.style.color = "";
        mensagem.style.borderColor = "";
    }

    if (texto) {
        setTimeout(() => {
            if (mensagem.textContent === texto) {
                mensagem.textContent = "";
            }
        }, 4500);
    }
}

function escaparHTML(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function alternarTema() {
    document.body.classList.toggle("dark");

    const escuro = document.body.classList.contains("dark");
    localStorage.setItem("gametrackTema", escuro ? "dark" : "light");

    document.getElementById("temaBtn").textContent =
        escuro ? "☀ Modo claro" : "☾ Modo escuro";
}

function carregarTema() {
    const tema = localStorage.getItem("gametrackTema");

    if (tema === "dark") {
        document.body.classList.add("dark");
        document.getElementById("temaBtn").textContent = "☀ Modo claro";
    }
}