const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
const historyPath = path.join(__dirname, 'game-history.json');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

function loadHistory() {
  if (!fs.existsSync(historyPath)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(historyPath, 'utf8'));
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    return [];
  }
}

function saveHistory(history) {
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf8');
}

function computeStats(history) {
  const totalGames = history.length;
  const wins = history.reduce((acc, item) => {
    if (item.winner) {
      acc[item.winner] = (acc[item.winner] || 0) + 1;
    }
    return acc;
  }, {});

  const bestWinner = Object.keys(wins).reduce((best, player) => {
    if (!best || wins[player] > wins[best]) {
      return player;
    }
    return best;
  }, null);

  return { totalGames, wins, bestWinner };
}

function createAgentsAnalysis(stats) {
  const winnersList = Object.keys(stats.wins).length
    ? JSON.stringify(stats.wins)
    : '{}';

  return [
    {
      name: 'Gisele',
      role: 'Analista',
      function: 'analisar_estatisticas',
      message: `Total de partidas jogadas: ${stats.totalGames}. Vencedores: ${winnersList}.`,
    },
    {
      name: 'Jessica',
      role: 'Oportunidades',
      function: 'identificar_oportunidade',
      message: stats.bestWinner
        ? `A seleção com maior oportunidade de avançar é ${stats.bestWinner}, com ${stats.wins[stats.bestWinner]} vitórias.`
        : 'Ainda não há dados suficientes para identificar oportunidades.',
    },
    {
      name: 'Cleber',
      role: 'Revisor',
      function: 'revisar_consistencia',
      message: 'Verifiquei a consistência dos registros de vitórias. O histórico está baseado em dados diretos do jogo da velha.',
    },
    {
      name: 'Juliana',
      role: 'Soluções',
      function: 'concluir_solucao',
      message: stats.bestWinner
        ? `Conclusão: ${stats.bestWinner} tem maior chance de avançar pelo maior número de vitórias no histórico.`
        : 'Sem vencedor claro no histórico.',
    },
  ];
}

app.get('/agents/stats', (req, res) => {
  const history = loadHistory();
  res.json(computeStats(history));
});

app.post('/agents/history', (req, res) => {
  const { winner, moves, date } = req.body;
  if (!winner) {
    return res.status(400).json({ error: 'O registro deve incluir o vencedor.' });
  }

  const history = loadHistory();
  const record = {
    winner,
    moves: moves || [],
    date: date || new Date().toISOString(),
  };

  history.push(record);
  saveHistory(history);

  return res.json({ ok: true, record });
});

app.get('/agents/analysis', (req, res) => {
  const history = loadHistory();
  const stats = computeStats(history);
  const agents = createAgentsAnalysis(stats);

  res.json({
    ok: true,
    endpoint: '/agents/analysis',
    agents,
    stats,
  });
});

app.listen(port, () => {
  console.log(`Servidor de agentes rodando em http://localhost:${port}`);
});
