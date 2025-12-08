const form = document.querySelector("form");
const listaCards = document.getElementById("lista-cards");

const container = document.querySelector(".container-global");
const containerEsquerda = document.querySelector(".container-esquerda");

// Tipo do usuário
const tipo = localStorage.getItem("tipoUsuario");

// Esconde botões de admin
function aplicarPermissoes() {
  if (tipo !== "admin") {
    document.querySelectorAll(".admin-only").forEach(btn => {
      btn.style.display = "none";
    });
  }
}

// Criar card
function criarCard(item) {
    const div = document.createElement("div");
    div.classList.add("card");

    div.innerHTML = `
        <h2 class="h2">${item.nome}</h2>
        <p><strong>Quantidade:</strong> ${item.quantidade}</p>
        <p><strong>Local/descrição:</strong> ${item.local}</p>

        <button class="btn-editar admin-only"
            data-id="${item.id_produtos}"
            data-nome="${item.nome}"
            data-qtd="${item.quantidade}"
            data-local="${item.local}">
            Editar
        </button>

        <button class="btn-remover admin-only"
            data-id="${item.id_produtos}">
            Remover
        </button>
    `;

    if (tipo !== "admin") {
        div.querySelectorAll(".admin-only").forEach(btn => {
            btn.style.display = "none";
        });
    }

    listaCards.appendChild(div);
}

/* === Mensagem quando não houver itens === */
function mostrarMensagemVazia() {
  if (document.querySelector(".empty-msg")) return;

  const msg = document.createElement("div");
  msg.className = "empty-msg";
  msg.innerHTML = `
      <p>Nenhum equipamento cadastrado ainda.<br>
      Use o formulário acima para registrar.</p>
  `;

    form.insertAdjacentElement("afterend", msg);

  requestAnimationFrame(() => msg.classList.add("show"));
}

function removerMensagemVazia() {
  const msg = document.querySelector(".empty-msg");
  if (msg) {
    msg.classList.remove("show");
    msg.addEventListener("transitionend", () => {
      msg.remove();
    }, { once: true });
  }
}

/* === Carregar Lista === */
async function carregarLista() {
    listaCards.innerHTML = "";

    const resposta = await fetch("/inventario/listar");
    const dados = await resposta.json();

    // Se NÃO tem itens
    if (!dados || dados.length === 0) {
        container.classList.add("sem-itens");
        mostrarMensagemVazia();
        return;
    }

    // Se tem itens
    container.classList.remove("sem-itens");
    removerMensagemVazia();

    dados.forEach(item => criarCard(item));
    aplicarPermissoes();
}

carregarLista();

function mostrarMensagemSucesso() {
    const msg = document.getElementById("msg-sucesso");

    msg.classList.add("show");

    // Some após 2.5 segundos
    setTimeout(() => {
        msg.classList.remove("show");
    }, 2500);
}

/* === Registrar Item === */
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = document.getElementById("equipamento").value;
    const quantidade = document.getElementById("quantidade").value;
    const local = document.getElementById("local").value;

    const dados = { equipamento: nome, quantidade, local };

    const resposta = await fetch("/inventario/adicionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });

    await resposta.json();

    form.reset();
    mostrarMensagemSucesso();
    carregarLista();
});

/* === Eventos editar/remover === */
listaCards.addEventListener("click", (event) => {
    const botao = event.target;

    if (botao.classList.contains("btn-editar")) {
        const id = botao.dataset.id;
        const nome = botao.dataset.nome;
        const qtd = botao.dataset.qtd;

        editarProduto(id, nome, qtd);
    }

    if (botao.classList.contains("btn-remover")) {
        removerProduto(botao.dataset.id);
    }
});

// EDITAR
async function editarProduto(id, nomeAtual, qtdAtual, localAtual) {
    const novoNome = prompt("Novo equipamento:", nomeAtual);
    if (!novoNome) return;

    const novaQuantidade = prompt("Nova quantidade:", qtdAtual);
    if (!novaQuantidade) return;

    const novoLocal = prompt("Novo local/descrição:", localAtual);
    if (!novoLocal) return;

    await fetch(`/inventario/editar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nome: novoNome,
            quantidade: novaQuantidade,
            local: novoLocal
        })
    });

    alert("Produto atualizado!");
    carregarLista();
}

// REMOVER
async function removerProduto(id) {
    if (!confirm("Tem certeza que deseja remover este item?")) return;

    await fetch(`/inventario/deletar/${id}`, {
        method: "DELETE"
    });

    carregarLista();
}