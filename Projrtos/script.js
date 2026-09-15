/* =========================================================
   REDE SOCIAL — INSTAGRAM + TIKTOK
   script.js
   Sem Firebase — dados salvos no localStorage
========================================================= */

"use strict";

/* =========================
   CONFIGURAÇÕES
========================= */

const STORAGE_KEY = "redeSocialDados";
const USER_KEY = "redeSocialUsuario";

let dados = carregarDados();
let usuarioAtual = carregarUsuario();

/* =========================
   DADOS INICIAIS
========================= */

function dadosIniciais() {
    return {
        usuarios: [
            {
                id: gerarId(),
                nome: "Mateus",
                username: "@mateus",
                bio: "Bem-vindo ao meu perfil 🚀",
                foto: "",
                seguidores: [],
                seguindo: []
            }
        ],

        posts: [
            {
                id: gerarId(),
                usuarioId: null,
                tipo: "texto",
                conteudo: "Bem-vindo à minha rede social! 🚀",
                imagem: "",
                video: "",
                legenda: "Meu primeiro post!",
                curtidas: [],
                comentarios: [],
                data: new Date().toISOString()
            }
        ],

        notificacoes: []
    };
}

/* =========================
   UTILIDADES
========================= */

function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function carregarDados() {
    const salvo = localStorage.getItem(STORAGE_KEY);

    if (salvo) {
        try {
            return JSON.parse(salvo);
        } catch (erro) {
            console.error("Erro ao carregar dados:", erro);
        }
    }

    const inicial = dadosIniciais();
    salvarDados(inicial);
    return inicial;
}

function salvarDados(novosDados = dados) {
    dados = novosDados;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

function carregarUsuario() {
    const salvo = localStorage.getItem(USER_KEY);

    if (!salvo) return null;

    try {
        return JSON.parse(salvo);
    } catch {
        return null;
    }
}

function salvarUsuario() {
    if (usuarioAtual) {
        localStorage.setItem(USER_KEY, JSON.stringify(usuarioAtual));
    } else {
        localStorage.removeItem(USER_KEY);
    }
}

function escaparHTML(texto) {
    if (!texto) return "";

    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function encontrarUsuario(id) {
    return dados.usuarios.find(usuario => usuario.id === id);
}

function usuarioLogado() {
    if (!usuarioAtual) return null;
    return encontrarUsuario(usuarioAtual.id);
}

function formatarData(data) {
    const agora = new Date();
    const dataPost = new Date(data);

    const segundos = Math.floor((agora - dataPost) / 1000);

    if (segundos < 60) return "agora";

    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `${minutos} min`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas} h`;

    const dias = Math.floor(horas / 24);
    if (dias < 7) return `${dias} d`;

    return dataPost.toLocaleDateString("pt-BR");
}

/* =========================
   LOGIN / CADASTRO
========================= */

function cadastrar(nome, username, bio = "") {

    nome = nome.trim();
    username = username.trim().toLowerCase();

    if (!nome || !username) {
        alert("Preencha nome e usuário.");
        return false;
    }

    if (!username.startsWith("@")) {
        username = "@" + username;
    }

    const existente = dados.usuarios.find(
        usuario => usuario.username.toLowerCase() === username
    );

    if (existente) {
        alert("Esse nome de usuário já está sendo usado.");
        return false;
    }

    const novoUsuario = {
        id: gerarId(),
        nome,
        username,
        bio,
        foto: "",
        seguidores: [],
        seguindo: []
    };

    dados.usuarios.push(novoUsuario);
    salvarDados();

    usuarioAtual = novoUsuario;
    salvarUsuario();

    atualizarInterface();

    return true;
}

function login(username) {

    username = username.trim().toLowerCase();

    if (!username.startsWith("@")) {
        username = "@" + username;
    }

    const usuario = dados.usuarios.find(
        item => item.username.toLowerCase() === username
    );

    if (!usuario) {
        alert("Usuário não encontrado.");
        return false;
    }

    usuarioAtual = usuario;
    salvarUsuario();

    atualizarInterface();

    return true;
}

function logout() {

    usuarioAtual = null;
    salvarUsuario();

    atualizarInterface();
}

/* =========================
   PUBLICAR
========================= */

function criarPost({
    tipo = "texto",
    conteudo = "",
    imagem = "",
    video = "",
    legenda = ""
}) {

    const usuario = usuarioLogado();

    if (!usuario) {
        alert("Faça login primeiro.");
        return;
    }

    if (!conteudo && !imagem && !video) {
        alert("Adicione algum conteúdo.");
        return;
    }

    const post = {
        id: gerarId(),
        usuarioId: usuario.id,
        tipo,
        conteudo,
        imagem,
        video,
        legenda,
        curtidas: [],
        comentarios: [],
        data: new Date().toISOString()
    };

    dados.posts.unshift(post);

    salvarDados();
    renderizarFeed();
    renderizarPerfil();

    alert("Publicado com sucesso! 🎉");
}

function excluirPost(postId) {

    const usuario = usuarioLogado();

    if (!usuario) return;

    const post = dados.posts.find(item => item.id === postId);

    if (!post) return;

    if (post.usuarioId !== usuario.id) {
        alert("Você só pode excluir suas próprias publicações.");
        return;
    }

    if (!confirm("Deseja excluir esta publicação?")) {
        return;
    }

    dados.posts = dados.posts.filter(item => item.id !== postId);

    salvarDados();

    renderizarFeed();
    renderizarPerfil();
}

/* =========================
   CURTIDAS
========================= */

function curtirPost(postId) {

    const usuario = usuarioLogado();

    if (!usuario) {
        alert("Faça login para curtir.");
        return;
    }

    const post = dados.posts.find(item => item.id === postId);

    if (!post) return;

    const indice = post.curtidas.indexOf(usuario.id);

    if (indice === -1) {
        post.curtidas.push(usuario.id);

        if (post.usuarioId !== usuario.id) {
            dados.notificacoes.push({
                id: gerarId(),
                usuarioId: post.usuarioId,
                texto: `${usuario.nome} curtiu sua publicação ❤️`,
                data: new Date().toISOString(),
                lida: false
            });
        }

    } else {
        post.curtidas.splice(indice, 1);
    }

    salvarDados();

    renderizarFeed();
}

/* =========================
   COMENTÁRIOS
========================= */

function comentarPost(postId, texto) {

    const usuario = usuarioLogado();

    if (!usuario) {
        alert("Faça login para comentar.");
        return;
    }

    texto = texto.trim();

    if (!texto) return;

    const post = dados.posts.find(item => item.id === postId);

    if (!post) return;

    post.comentarios.push({
        id: gerarId(),
        usuarioId: usuario.id,
        texto,
        data: new Date().toISOString()
    });

    salvarDados();

    renderizarFeed();
}

/* =========================
   SEGUIR USUÁRIO
========================= */

function seguirUsuario(usuarioId) {

    const usuario = usuarioLogado();

    if (!usuario) {
        alert("Faça login primeiro.");
        return;
    }

    if (usuario.id === usuarioId) return;

    const alvo = encontrarUsuario(usuarioId);

    if (!alvo) return;

    const seguindo = usuario.seguindo.includes(usuarioId);

    if (seguindo) {

        usuario.seguindo = usuario.seguindo.filter(
            id => id !== usuarioId
        );

        alvo.seguidores = alvo.seguidores.filter(
            id => id !== usuario.id
        );

    } else {

        usuario.seguindo.push(usuarioId);

        alvo.seguidores.push(usuario.id);

        dados.notificacoes.push({
            id: gerarId(),
            usuarioId: alvo.id,
            texto: `${usuario.nome} começou a seguir você 👤`,
            data: new Date().toISOString(),
            lida: false
        });
    }

    salvarDados();

    atualizarInterface();
}

/* =========================
   FEED
========================= */

function renderizarFeed() {

    const feed =
        document.querySelector("#feed") ||
        document.querySelector(".feed");

    if (!feed) return;

    if (dados.posts.length === 0) {
        feed.innerHTML = `
            <div class="estado-vazio">
                <h2>Nenhuma publicação</h2>
                <p>Comece publicando alguma coisa!</p>
            </div>
        `;
        return;
    }

    feed.innerHTML = dados.posts.map(post => {

        const usuario = encontrarUsuario(post.usuarioId);

        if (!usuario) return "";

        const logado = usuarioLogado();

        const curtiu =
            logado &&
            post.curtidas.includes(logado.id);

        const seguindo =
            logado &&
            logado.seguindo.includes(usuario.id);

        let conteudo = "";

        if (post.tipo === "video" && post.video) {

            conteudo = `
                <div class="post-video">
                    <video
                        src="${post.video}"
                        controls
                        playsinline
                        loop>
                    </video>
                </div>
            `;

        } else if (post.imagem) {

            conteudo = `
                <div class="post-imagem">
                    <img src="${post.imagem}" alt="Publicação">
                </div>
            `;

        } else if (post.conteudo) {

            conteudo = `
                <div class="post-texto">
                    ${escaparHTML(post.conteudo)}
                </div>
            `;
        }

        return `
            <article class="post" data-post-id="${post.id}">

                <header class="post-header">

                    <div class="post-user">

                        <div class="avatar">
                            ${
                                usuario.foto
                                ? `<img src="${usuario.foto}" alt="">`
                                : "👤"
                            }
                        </div>

                        <div>
                            <strong>${escaparHTML(usuario.nome)}</strong>
                            <span>${escaparHTML(usuario.username)}</span>
                        </div>

                    </div>

                    ${
                        logado && logado.id !== usuario.id
                        ? `
                            <button
                                class="btn-seguir"
                                onclick="seguirUsuario('${usuario.id}')">
                                ${seguindo ? "Seguindo" : "Seguir"}
                            </button>
                        `
                        : ""
                    }

                </header>

                ${conteudo}

                ${
                    post.legenda
                    ? `
                        <div class="post-legenda">
                            <strong>${escaparHTML(usuario.username)}</strong>
                            ${escaparHTML(post.legenda)}
                        </div>
                    `
                    : ""
                }

                <div class="post-acoes">

                    <button
                        class="${curtiu ? "curtido" : ""}"
                        onclick="curtirPost('${post.id}')">
                        ${curtiu ? "❤️" : "🤍"}
                        ${post.curtidas.length}
                    </button>

                    <button onclick="abrirComentarios('${post.id}')">
                        💬 ${post.comentarios.length}
                    </button>

                    <button onclick="compartilharPost('${post.id}')">
                        📤
                    </button>

                </div>

                <div class="post-data">
                    ${formatarData(post.data)}
                </div>

                ${
                    logado && usuario.id === logado.id
                    ? `
                        <button
                            class="btn-excluir"
                            onclick="excluirPost('${post.id}')">
                            🗑️ Excluir
                        </button>
                    `
                    : ""
                }

            </article>
        `;

    }).join("");
}

/* =========================
   COMENTÁRIOS NA TELA
========================= */

function abrirComentarios(postId) {

    const post = dados.posts.find(item => item.id === postId);

    if (!post) return;

    const comentarios = post.comentarios.map(comentario => {

        const usuario = encontrarUsuario(comentario.usuarioId);

        return `
            <div class="comentario">

                <strong>
                    ${escaparHTML(usuario?.username || "@usuario")}
                </strong>

                <span>
                    ${escaparHTML(comentario.texto)}
                </span>

            </div>
        `;

    }).join("");

    const texto = prompt(
        `Comentários:\n\n${
            post.comentarios.length
            ? post.comentarios.map(c => {
                const u = encontrarUsuario(c.usuarioId);
                return `${u?.username || "@usuario"}: ${c.texto}`;
            }).join("\n")
            : "Nenhum comentário ainda."
        }\n\nDigite um novo comentário:`
    );

    if (texto) {
        comentarPost(postId, texto);
    }
}

/* =========================
   COMPARTILHAR
========================= */

function compartilharPost(postId) {

    const url =
        window.location.origin +
        window.location.pathname +
        "?post=" +
        encodeURIComponent(postId);

    if (navigator.share) {

        navigator.share({
            title: "Confira esta publicação!",
            text: "Olha essa publicação!",
            url
        }).catch(() => {});

    } else {

        navigator.clipboard?.writeText(url);

        alert("Link copiado! 📋");
    }
}

/* =========================
   PERFIL
========================= */

function renderizarPerfil(usuarioId = null) {

    const perfil =
        document.querySelector("#perfil") ||
        document.querySelector(".perfil");

    if (!perfil) return;

    const usuario =
        usuarioId
        ? encontrarUsuario(usuarioId)
        : usuarioLogado();

    if (!usuario) return;

    const postsUsuario =
        dados.posts.filter(
            post => post.usuarioId === usuario.id
        );

    const logado = usuarioLogado();

    const seguindo =
        logado &&
        logado.seguindo.includes(usuario.id);

    perfil.innerHTML = `

        <section class="perfil-topo">

            <div class="perfil-foto">
                ${
                    usuario.foto
                    ? `<img src="${usuario.foto}" alt="">`
                    : "👤"
                }
            </div>

            <div class="perfil-info">

                <h2>${escaparHTML(usuario.nome)}</h2>

                <span>${escaparHTML(usuario.username)}</span>

                <p>${escaparHTML(usuario.bio)}</p>

                <div class="perfil-estatisticas">

                    <div>
                        <strong>${postsUsuario.length}</strong>
                        <span>Posts</span>
                    </div>

                    <div>
                        <strong>${usuario.seguidores.length}</strong>
                        <span>Seguidores</span>
                    </div>

                    <div>
                        <strong>${usuario.seguindo.length}</strong>
                        <span>Seguindo</span>
                    </div>

                </div>

                ${
                    logado &&
                    logado.id !== usuario.id
                    ? `
                        <button
                            onclick="seguirUsuario('${usuario.id}')">
                            ${seguindo ? "Deixar de seguir" : "Seguir"}
                        </button>
                    `
                    : ""
                }

            </div>

        </section>

        <section class="perfil-posts">

            ${
                postsUsuario.length
                ? postsUsuario.map(post => {

                    if (post.imagem) {
                        return `
                            <div class="perfil-post">
                                <img src="${post.imagem}">
                            </div>
                        `;
                    }

                    if (post.video) {
                        return `
                            <div class="perfil-post">
                                <video src="${post.video}"></video>
                            </div>
                        `;
                    }

                    return `
                        <div class="perfil-post perfil-post-texto">
                            ${escaparHTML(post.conteudo)}
                        </div>
                    `;

                }).join("")
                : `
                    <div class="estado-vazio">
                        <h3>Nenhuma publicação</h3>
                    </div>
                `
            }

        </section>
    `;
}

/* =========================
   PESQUISA
========================= */

function pesquisarUsuarios(texto) {

    texto = texto.trim().toLowerCase();

    if (!texto) {
        return dados.usuarios;
    }

    return dados.usuarios.filter(usuario =>
        usuario.nome.toLowerCase().includes(texto) ||
        usuario.username.toLowerCase().includes(texto)
    );
}

function mostrarPesquisa(texto) {

    const resultado =
        document.querySelector("#resultadoPesquisa");

    if (!resultado) return;

    const usuarios = pesquisarUsuarios(texto);

    resultado.innerHTML = usuarios.map(usuario => {

        const logado = usuarioLogado();

        const seguindo =
            logado &&
            logado.seguindo.includes(usuario.id);

        return `
            <div class="usuario-pesquisa">

                <div class="avatar">
                    ${
                        usuario.foto
                        ? `<img src="${usuario.foto}">`
                        : "👤"
                    }
                </div>

                <div class="usuario-pesquisa-info">
                    <strong>${escaparHTML(usuario.nome)}</strong>
                    <span>${escaparHTML(usuario.username)}</span>
                </div>

                ${
                    logado && logado.id !== usuario.id
                    ? `
                        <button onclick="seguirUsuario('${usuario.id}')">
                            ${seguindo ? "Seguindo" : "Seguir"}
                        </button>
                    `
                    : ""
                }

            </div>
        `;

    }).join("");
}

/* =========================
   NOTIFICAÇÕES
========================= */

function obterNotificacoes() {

    const usuario = usuarioLogado();

    if (!usuario) return [];

    return dados.notificacoes.filter(
        notificacao => notificacao.usuarioId === usuario.id
    );
}

function renderizarNotificacoes() {}

    const area =
        document.querySelector("#notificacoes");

    if (!area) return;

    const notificacoes = obterNotificacoes();

    area.innerHTML = notificacoes.length
        ? notificacoes.map(notificacao => `
            <div class="notificacao">
                <p>${escaparHTML(notificacao.conteudo)}</p>
            </div>
        `).join("")
        : `
            <div class="estado-vazio">
                <h3>Nenhuma notificação</h3>
            </div>
        `;