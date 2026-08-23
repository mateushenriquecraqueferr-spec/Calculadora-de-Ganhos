// ==========================================
// CALCULADORA PRO
// ==========================================

// Lista dos dias
let dias = JSON.parse(localStorage.getItem("diasCalculadora")) || [];

// ==========================================
// FORMATAR DINHEIRO
// ==========================================

function formatarMoeda(valor) {

    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}

// ==========================================
// FORMATAR DATA
// ==========================================

function formatarData(data) {

    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}

// ==========================================
// ADICIONAR DIA
// ==========================================

function adicionarDia() {

    const data = document.getElementById("data").value;

    const ganhos =
        parseFloat(document.getElementById("ganhos").value) || 0;

    const despesas =
        parseFloat(document.getElementById("despesas").value) || 0;

    // Verificar data
    if (!data) {

        alert("Escolha uma data.");

        return;
    }

    // Verificar valores
    if (ganhos === 0 && despesas === 0) {

        alert("Digite um valor de ganho ou despesa.");

        return;
    }

    // Calcular líquido
    const liquido = ganhos - despesas;

    // Criar novo dia
    const novoDia = {

        id: Date.now(),

        data: data,

        ganhos: ganhos,

        despesas: despesas,

        liquido: liquido

    };

    // Adicionar na lista
    dias.push(novoDia);

    // Salvar
    salvarDados();

    // Atualizar tela
    atualizarTela();

    // Limpar campos
    limparCampos();

}

// ==========================================
// LIMPAR CAMPOS
// ==========================================

function limparCampos() {

    document.getElementById("data").value = "";

    document.getElementById("ganhos").value = "";

    document.getElementById("despesas").value = "";

}

// ==========================================
// SALVAR NO CELULAR
// ==========================================

function salvarDados() {

    localStorage.setItem(
        "diasCalculadora",
        JSON.stringify(dias)
    );

}

// ==========================================
// MOSTRAR OS DIAS
// ==========================================

function atualizarTela() {

    const lista =
        document.getElementById("historicoLista");

    lista.innerHTML = "";

    // Se não tiver dias
    if (dias.length === 0) {

        lista.innerHTML = `
            <div class="vazio">
                Nenhum dia adicionado ainda.
            </div>
        `;

        atualizarResumo();

        return;
    }

    // Mostrar dias do mais recente para o mais antigo
    const diasOrdenados = [...dias].sort(
        (a, b) => new Date(b.data) - new Date(a.data)
    );

    diasOrdenados.forEach(dia => {

        lista.innerHTML += `

            <div class="dia">

                <div class="dia-header">

                    <h3>
                        📅 ${formatarData(dia.data)}
                    </h3>

                </div>

                <div class="dia-info">

                    <p class="ganho">
                        💵 Ganhos:
                        <strong>
                            ${formatarMoeda(dia.ganhos)}
                        </strong>
                    </p>

                    <p class="despesa">
                        💸 Despesas:
                        <strong>
                            ${formatarMoeda(dia.despesas)}
                        </strong>
                    </p>

                    <p class="liquido">
                        💰 Líquido:
                        ${formatarMoeda(dia.liquido)}
                    </p>

                </div>

                <div class="acoes">

                    <button
                        class="btn-editar"
                        onclick="editarDia(${dia.id})">
                        ✏️ Editar
                    </button>

                    <button
                        class="btn-excluir"
                        onclick="excluirDia(${dia.id})">
                        🗑️ Excluir
                    </button>

                </div>

            </div>

        `;

    });

    atualizarResumo();

}

// ==========================================
// ATUALIZAR RESUMO
// ==========================================

function atualizarResumo() {

    let totalGanhos = 0;

    let totalDespesas = 0;

    let totalLiquido = 0;

    dias.forEach(dia => {

        totalGanhos += dia.ganhos;

        totalDespesas += dia.despesas;

        totalLiquido += dia.liquido;

    });

    document.getElementById("totalGanhos").textContent =
        formatarMoeda(totalGanhos);

    document.getElementById("totalDespesas").textContent =
        formatarMoeda(totalDespesas);

    document.getElementById("totalLiquido").textContent =
        formatarMoeda(totalLiquido);

}

// ==========================================
// EXCLUIR DIA
// ==========================================

function excluirDia(id) {

    const confirmar = confirm(
        "Tem certeza que deseja excluir este dia?"
    );

    if (!confirmar) {
        return;
    }

    dias = dias.filter(dia => dia.id !== id);

    salvarDados();

    atualizarTela();

}

// ==========================================
// EDITAR DIA
// ==========================================

function editarDia(id) {

    const dia = dias.find(item => item.id === id);

    if (!dia) {
        return;
    }

    document.getElementById("data").value =
        dia.data;

    document.getElementById("ganhos").value =
        dia.ganhos;

    document.getElementById("despesas").value =
        dia.despesas;

    // Remover o antigo
    dias = dias.filter(item => item.id !== id);

    salvarDados();

    atualizarTela();

    // Ir para o formulário
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

// ==========================================
// INICIAR APLICATIVO
// ==========================================

atualizarTela();