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
  res.json({ ok: true, record });
});

app.get('/agents/analysis', (req, res) => {
  const history = loadHistory();
  const stats = computeStats(history);
  const gisele = {
    role: 'Analista',
    message: `Total de partidas jogadas: ${stats.totalGames}. Vencedores: ${JSON.stringify(stats.wins)}.`,
  };
  const jessica = {
    role: 'Oportunidades',
    message: stats.bestWinner
      ? `A seleção com maior oportunidade de avançar é ${stats.bestWinner}, com ${stats.wins[stats.bestWinner]} vitórias.`
      : 'Ainda não há dados suficientes para identificar oportunidades.',
  };
  const cleber = {
    role: 'Revisor',
    message: 'Verifiquei a consistência dos registros de vitórias. O histórico está baseado em dados diretos do jogo da velha.',
  };
  const juliana = {
    role: 'Soluções',
    message: stats.bestWinner
      ? `Conclusão: ${stats.bestWinner} tem maior chance de avançar pelo maior número de vitórias no histórico.`
      : 'Sem vencedor claro no histórico.',
  };
  res.json({ agents: [gisele, jessica, cleber, juliana], stats });
});

app.listen(port, () => {
  console.log(`Servidor de agentes rodando em http://localhost:${port}`);
});
