// =========================================================================
// ⚠️ ATENÇÃO: COLE AQUI A URL GERADA NO NOVO DEPLOY DO SEU APPS SCRIPT
// =========================================================================
const API_URL = "https://script.google.com/macros/s/AKfycbyAwf24lDSzrdRnpxCEXjSKBLESuenWueT7Vv8PYMHVaw6KLog6qJB8jDNNO9ujvEKw/exec"; 

let numeroSelecionado = null;
let listaProdutosOriginal = [];

async function carregarDados() {
  try {
    const resposta = await fetch(API_URL);
    const json = await resposta.json();
    
    if (json.status === "sucesso") {
      renderizar(json.dados);
    } else {
      mostrarMensagem("Erro: " + json.mensagem);
    }
  } catch (erro) {
    mostrarMensagem("Erro ao conectar com a planilha.");
    console.error(erro);
  }
}

function renderizar(dados) {
  listaProdutosOriginal = dados; 
  const container = document.getElementById("lista");
  container.innerHTML = "";

  dados.forEach(item => {
    let botaoReserva = "";

    if (item.status === "Disponível") {
      botaoReserva = `<button class="btn-disponivel" onclick="abrirModal(${item.numero})">Reservar</button>`;
    } else if (item.status === "Reservado") {
      botaoReserva = `<button class="btn-reservado" disabled>Reservado</button>`;
    } else {
      botaoReserva = `<button class="btn-indisponivel" disabled>Indisponível</button>`;
    }

    const botaoLink = item.link 
      ? `<a class="btn-ver" href="${item.link}" target="_blank">Ver produto</a>` 
      : "";

    // As imagens dos produtos continuam vindo dinamicamente da planilha
    const imagem = item.imagem 
      ? `<img class="imagem" src="${item.imagem}">` 
      : `<div class="imagem"></div>`;

    container.innerHTML += `
      <div class="card">
        ${imagem}
        <div class="conteudo">
          <div class="numero">Nº ${item.numero}</div>
          <div class="produto">${item.produto}</div>
          <div class="botoes">
            ${botaoLink}
            ${botaoReserva}
          </div>
        </div>
      </div>
    `;
  });
}

function abrirModal(numero) {
  numeroSelecionado = numero;
  
  const item = listaProdutosOriginal.find(i => i.numero == numero);
  if(item) {
    document.getElementById("infoItem").innerText = `Nº ${item.numero} - ${item.produto}`;
  }

  const viewport = document.getElementById("viewportMeta");
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  }

  // Adiciona a classe para mostrar o modal com animação
  document.getElementById("modal").classList.add("mostrar");
  window.scrollTo(0, 0); 
}

function fecharModal() {
  // Remove a classe para esconder o modal com animação
  document.getElementById("modal").classList.remove("mostrar");
  
  // Limpa os campos
  document.getElementById("nome").value = "";
  document.getElementById("contato").value = "";

  const viewport = document.getElementById("viewportMeta");
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
  }
}

function mostrarMensagem(texto) {
  document.getElementById("mensagemTexto").innerText = texto;
  document.getElementById("mensagemBox").style.display = "flex";

  setTimeout(() => {
    document.getElementById("mensagemBox").style.display = "none";
  }, 2500);
}

async function confirmarReserva() {
  const nome = document.getElementById("nome").value.trim();
  const contato = document.getElementById("contato").value.trim();
  const btn = document.getElementById("btnConfirmar");

  if (!nome || !contato) {
    mostrarMensagem("Preencha nome e contato!");
    return;
  }

  btn.innerText = "Salvando...";
  btn.disabled = true;

  try {
    const resposta = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        numero: numeroSelecionado,
        nome: nome,
        contato: contato
      })
    });
    
    const json = await resposta.json();
    
    mostrarMensagem(json.mensagem);
    
    if(json.status === "sucesso") {
      fecharModal();
      carregarDados(); 
    }
  } catch (erro) {
    mostrarMensagem("Erro ao salvar reserva.");
    console.error(erro);
  } finally {
    btn.innerText = "Confirmar";
    btn.disabled = false;
  }
}

// Inicia o carregamento ao abrir a página
carregarDados();