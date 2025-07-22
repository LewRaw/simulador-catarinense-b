// Objeto para armazenar todos os confrontos diretos do campeonato
const confrontosDiretos = {};

// Dados iniciais das equipes, conforme a tabela da 8ª rodada
const timesIniciais = [
  { nome: "Blumenau", P: 15, J: 8, V: 4, E: 3, D: 1, GP: 13, GC: 5, SG: 8, CA: 16, CV: 1 },
  { nome: "Juventus", P: 12, J: 7, V: 3, E: 3, D: 1, GP: 9, GC: 4, SG: 5, CA: 24, CV: 0 },
  { nome: "Metropolitano", P: 11, J: 7, V: 3, E: 2, D: 2, GP: 8, GC: 6, SG: 2, CA: 25, CV: 0 },
  { nome: "Carlos Renaux", P: 11, J: 7, V: 3, E: 2, D: 2, GP: 7, GC: 5, SG: 2, CA: 23, CV: 0 },
  { nome: "Camboriú", P: 10, J: 7, V: 3, E: 1, D: 3, GP: 9, GC: 7, SG: 2, CA: 17, CV: 1 },
  { nome: "Nação", P: 10, J: 7, V: 2, E: 4, D: 1, GP: 7, GC: 6, SG: 1, CA: 19, CV: 2 },
  { nome: "Tubarão", P: 8, J: 7, V: 2, E: 2, D: 3, GP: 10, GC: 7, SG: 3, CA: 17, CV: 0 },
  { nome: "Fluminense-SC", P: 6, J: 7, V: 1, E: 3, D: 3, GP: 5, GC: 7, SG: -2, CA: 22, CV: 2 },
  { nome: "Porto", P: 3, J: 7, V: 1, E: 0, D: 6, GP: 4, GC: 25, SG: -21, CA: 18, CV: 0 }
];

// Estado atual dos times (será modificado pela simulação)
let times = JSON.parse(JSON.stringify(timesIniciais));

// Função para registrar o resultado de um confronto direto
function registrarConfronto(timeA, timeB, golsA, golsB) {
  const chave = [timeA, timeB].sort().join('-');
  if (!confrontosDiretos[chave]) {
    confrontosDiretos[chave] = {};
  }
  confrontosDiretos[chave][timeA] = golsA;
  confrontosDiretos[chave][timeB] = golsB;
}

// Função para preencher os confrontos das rodadas anteriores (dados fictícios para demonstração)
function preencherConfrontosAnteriores() {
  // OBS: Estes são resultados fictícios criados para fazer o critério de desempate funcionar.
  // Em uma aplicação real, estes dados viriam de um banco de dados.
  registrarConfronto("Blumenau", "Metropolitano", 1, 0);
  registrarConfronto("Blumenau", "Carlos Renaux", 2, 2);
  registrarConfronto("Carlos Renaux", "Metropolitano", 1, 0);
  registrarConfronto("Nação", "Camboriú", 1, 1);
  // ... e assim por diante para todos os jogos já ocorridos.
}

// Função principal de simulação
function simular() {
  times = JSON.parse(JSON.stringify(timesIniciais)); // Reseta para o estado inicial
  const partidas = [
    { t1: "Juventus",      t2: "Metropolitano", g1: parseInt(document.getElementById("j1t1").value) || 0, g2: parseInt(document.getElementById("j1t2").value) || 0 },
    { t1: "Camboriú",      t2: "Carlos Renaux", g1: parseInt(document.getElementById("j2t1").value) || 0, g2: parseInt(document.getElementById("j2t2").value) || 0 },
    { t1: "Nação",         t2: "Tubarão",       g1: parseInt(document.getElementById("j3t1").value) || 0, g2: parseInt(document.getElementById("j3t2").value) || 0 },
    { t1: "Porto",         t2: "Fluminense-SC", g1: parseInt(document.getElementById("j4t1").value) || 0, g2: parseInt(document.getElementById("j4t2").value) || 0 }
  ];

  partidas.forEach(jogo => {
    const timeA = times.find(t => t.nome === jogo.t1);
    const timeB = times.find(t => t.nome === jogo.t2);

    if (!timeA || !timeB) return;

    // Registra o confronto para o critério de desempate
    registrarConfronto(timeA.nome, timeB.nome, jogo.g1, jogo.g2);

    // Atualiza estatísticas básicas
    timeA.J++; timeB.J++;
    timeA.GP += jogo.g1; timeA.GC += jogo.g2;
    timeB.GP += jogo.g2; timeB.GC += jogo.g1;
    timeA.SG = timeA.GP - timeA.GC;
    timeB.SG = timeB.GP - timeB.GC;

    // Atualiza Pontos, Vitórias, Empates e Derrotas
    if (jogo.g1 > jogo.g2) {
      timeA.P += 3; timeA.V++;
      timeB.D++;
    } else if (jogo.g1 < jogo.g2) {
      timeB.P += 3; timeB.V++;
      timeA.D++;
    } else {
      timeA.P += 1; timeA.E++;
      timeB.P += 1; timeB.E++;
    }
  });

  ordenarTabela();
  renderTabela();
}

// Função que retorna o resultado do confronto direto para o sort
function desempateConfrontoDireto(timeA, timeB) {
    const chave = [timeA.nome, timeB.nome].sort().join('-');
    const confronto = confrontosDiretos[chave];
    if (!confronto) return 0; // Se não se enfrentaram, não há critério

    const golsA = confronto[timeA.nome];
    const golsB = confronto[timeB.nome];

    return golsB - golsA; // Retorna positivo se B fez mais gols, negativo se A fez mais
}

// Ordena os times com base em todos os critérios do regulamento
function ordenarTabela() {
    times.sort((a, b) => {
        return (
            b.P - a.P ||                         // 1. Pontos
            b.V - a.V ||                         // 2. Vitórias
            b.SG - a.SG ||                       // 3. Saldo de Gols
            b.GP - a.GP ||                       // 4. Gols Pró
            desempateConfrontoDireto(b, a) ||    // 5. Confronto Direto
            a.CV - b.CV ||                       // 6. Menos Cartões Vermelhos
            a.CA - b.CA ||                       // 7. Menos Cartões Amarelos
            Math.random() - 0.5                  // 8. Sorteio
        );
    });
}


// Renderiza a tabela na tela
function renderTabela() {
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = "";

  times.forEach((t, index) => {
    const linha = document.createElement("tr");
    const pos = index + 1;

    // Define a classe da linha para estilização (classificação/rebaixamento)
    if (pos <= 2) {
      linha.className = 'semifinal';
    } else if (pos >= 3 && pos <= 6) {
      linha.className = 'segunda-fase';
    } else if (pos === times.length) {
      linha.className = 'rebaixado';
    }
    
    const aproveitamento = t.J > 0 ? Math.round((t.P / (t.J * 3)) * 100) : 0;

    linha.innerHTML = `
      <td class="pos">${pos}º</td>
      <td class="time">${t.nome}</td>
      <td>${t.P}</td>
      <td>${t.J}</td>
      <td>${t.V}</td>
      <td>${t.E}</td>
      <td>${t.D}</td>
      <td>${t.GP}</td>
      <td>${t.GC}</td>
      <td>${t.SG}</td>
      <td>${aproveitamento}%</td>
    `;
    corpoTabela.appendChild(linha);
  });
}

// Função para limpar os campos e resetar a tabela
function resetarSimulacao() {
    document.getElementById("j1t1").value = "";
    document.getElementById("j1t2").value = "";
    document.getElementById("j2t1").value = "";
    document.getElementById("j2t2").value = "";
    document.getElementById("j3t1").value = "";
    document.getElementById("j3t2").value = "";
    document.getElementById("j4t1").value = "";
    document.getElementById("j4t2").value = "";
    
    times = JSON.parse(JSON.stringify(timesIniciais));
    ordenarTabela();
    renderTabela();
}


// Inicialização da página
window.onload = () => {
    preencherConfrontosAnteriores();
    ordenarTabela();
    renderTabela();
};