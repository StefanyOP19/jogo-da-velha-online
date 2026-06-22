const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
const historyPath = path.join(__dirname, 'game-history.json');
const agentsDirectoryPath = __dirname;

const defaultAgents = [
  {
    name: 'Gisele',
    role: 'Analista',
    function: 'analisar_estatisticas',
  },
  {
    name: 'Jessica',
    role: 'Oportunidades',
    function: 'identificar_oportunidade',
  },
  {
    name: 'Cleber',
    role: 'Revisor',
    function: 'revisar_consistencia',
  },
  {
    name: 'Juliana',
    role: 'Soluções',
    function: 'concluir_solucao',
  },
];

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

function isValidAgentDefinition(agent) {
  return Boolean(
    agent
    && typeof agent.name === 'string'
    && typeof agent.role === 'string'
    && typeof agent.function === 'string'
    && agent.name.trim()
    && agent.role.trim()
    && agent.function.trim()
  );
}

function loadAgentsFromDirectory() {
  let files = [];
  try {
    files = fs.readdirSync(agentsDirectoryPath);
  } catch (error) {
    return {
      agents: defaultAgents,
      warnings: [`Não foi possível ler o diretório de agentes: ${error.message}`],
    };
  }

  const warnings = [];
  const agents = [];

  for (const fileName of files) {
    if (!fileName.endsWith('.json') || fileName === 'game-history.json') {
      continue;
    }

    const filePath = path.join(agentsDirectoryPath, fileName);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      const list = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of list) {
        if (isValidAgentDefinition(item)) {
          agents.push({
            name: item.name.trim(),
            role: item.role.trim(),
            function: item.function.trim(),
          });
        } else {
          warnings.push(`Agente inválido ignorado em ${fileName}. Campos obrigatórios: name, role, function.`);
        }
      }
    } catch (error) {
      warnings.push(`Falha ao carregar ${fileName}: ${error.message}`);
    }
  }

  if (!agents.length) {
    warnings.push('Nenhum agente válido encontrado em arquivos JSON. Usando agentes padrão.');
    return { agents: defaultAgents, warnings };
  }

  return { agents, warnings };
}

function normalizeRecord(rawRecord) {
  if (!rawRecord || typeof rawRecord !== 'object') {
    return null;
  }

  const players = {
    X: rawRecord.players && typeof rawRecord.players.X === 'string' && rawRecord.players.X.trim()
      ? rawRecord.players.X.trim()
      : (typeof rawRecord.playerX === 'string' && rawRecord.playerX.trim() ? rawRecord.playerX.trim() : 'X'),
    O: rawRecord.players && typeof rawRecord.players.O === 'string' && rawRecord.players.O.trim()
      ? rawRecord.players.O.trim()
      : (typeof rawRecord.playerO === 'string' && rawRecord.playerO.trim() ? rawRecord.playerO.trim() : 'O'),
  };

  const winnerValue = typeof rawRecord.winner === 'string' ? rawRecord.winner.trim() : '';
  const drawValues = ['Empate', 'DRAW', 'draw', 'tie', 'TIE'];
  const isDraw = drawValues.includes(winnerValue);

  let winner = null;
  if (!isDraw) {
    if (winnerValue === 'X' || winnerValue === 'O') {
      winner = players[winnerValue];
    } else if (winnerValue === players.X || winnerValue === players.O) {
      winner = winnerValue;
    }
  }

  return {
    players,
    winner,
    isDraw,
    hasKnownOutcome: isDraw || Boolean(winner),
    rawWinner: winnerValue || null,
  };
}

function computeStats(history) {
  const totalGames = history.length;
  const byAgent = {};
  const wins = history.reduce((acc, item) => {
    if (item && item.winner) {
      acc[item.winner] = (acc[item.winner] || 0) + 1;
    }
    return acc;
  }, {});

  let processedGames = 0;
  let ignoredGames = 0;

  for (const record of history) {
    const normalized = normalizeRecord(record);

    if (!normalized) {
      ignoredGames += 1;
      continue;
    }

    const participants = [normalized.players.X, normalized.players.O];
    for (const participant of participants) {
      if (!byAgent[participant]) {
        byAgent[participant] = {
          games: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          winRate: 0,
        };
      }
      byAgent[participant].games += 1;
    }

    if (normalized.isDraw) {
      byAgent[normalized.players.X].draws += 1;
      byAgent[normalized.players.O].draws += 1;
      processedGames += 1;
      continue;
    }

    if (!normalized.winner) {
      ignoredGames += 1;
      continue;
    }

    const loser = normalized.winner === normalized.players.X
      ? normalized.players.O
      : normalized.players.X;

    byAgent[normalized.winner].wins += 1;
    byAgent[loser].losses += 1;
    processedGames += 1;
  }

  const byAgentEntries = Object.entries(byAgent).map(([name, item]) => {
    const winRate = item.games ? Number(((item.wins / item.games) * 100).toFixed(2)) : 0;
    return [name, { ...item, winRate }];
  });
  const byAgentWithRates = Object.fromEntries(byAgentEntries);

  const bestPerformer = byAgentEntries.reduce((best, [name, item]) => {
    if (!best) {
      return { name, ...item };
    }
    if (item.winRate > best.winRate) {
      return { name, ...item };
    }
    if (item.winRate === best.winRate && item.wins > best.wins) {
      return { name, ...item };
    }
    return best;
  }, null);

  const bestWinner = Object.keys(wins).reduce((best, player) => {
    if (!best || wins[player] > wins[best]) {
      return player;
    }
    return best;
  }, null);

  return {
    totalGames,
    processedGames,
    ignoredGames,
    wins,
    bestWinner,
    byAgent: byAgentWithRates,
    bestPerformer,
  };
}

function createAgentMessage(agent, stats) {
  const winnersList = Object.keys(stats.wins).length ? JSON.stringify(stats.wins) : '{}';

  if (agent.function === 'analisar_estatisticas') {
    return `Total de partidas: ${stats.totalGames}. Partidas processadas: ${stats.processedGames}. Vencedores brutos: ${winnersList}.`;
  }

  if (agent.function === 'identificar_oportunidade') {
    if (!stats.bestPerformer) {
      return 'Ainda não há dados suficientes para identificar oportunidade de desempenho.';
    }
    return `Melhor desempenho atual: ${stats.bestPerformer.name}, taxa de vitória ${stats.bestPerformer.winRate}% (${stats.bestPerformer.wins} vitórias em ${stats.bestPerformer.games} partidas).`;
  }

  if (agent.function === 'revisar_consistencia') {
    if (stats.ignoredGames > 0) {
      return `Foram detectadas ${stats.ignoredGames} partidas com dados incompletos e aplicamos fallback para manter a análise disponível.`;
    }
    return 'Histórico consistente: nenhuma partida foi ignorada por dados incompletos.';
  }

  if (agent.function === 'concluir_solucao') {
    if (!stats.bestPerformer) {
      return 'Sem volume suficiente para conclusão de desempenho por agente.';
    }
    return `Conclusão: ${stats.bestPerformer.name} lidera com taxa de vitória de ${stats.bestPerformer.winRate}%.`;
  }

  return `Análise automática executada por ${agent.name}. Total de partidas analisadas: ${stats.totalGames}.`;
}

function createAgentsAnalysis(agentDefinitions, stats) {
  return agentDefinitions.map((agent) => ({
    ...agent,
    message: createAgentMessage(agent, stats),
  }));
}

app.get('/agents/stats', (req, res) => {
  const history = loadHistory();
  res.json(computeStats(history));
});

app.post('/agents/history', (req, res) => {
  const { winner, moves, date, players, playerX, playerO } = req.body;
  if (!winner) {
    return res.status(400).json({ error: 'O registro deve incluir o vencedor.' });
  }

  const history = loadHistory();
  const record = {
    winner,
    moves: moves || [],
    date: date || new Date().toISOString(),
    players: {
      X: players && typeof players.X === 'string' && players.X.trim()
        ? players.X.trim()
        : (typeof playerX === 'string' && playerX.trim() ? playerX.trim() : 'X'),
      O: players && typeof players.O === 'string' && players.O.trim()
        ? players.O.trim()
        : (typeof playerO === 'string' && playerO.trim() ? playerO.trim() : 'O'),
    },
  };

  history.push(record);
  saveHistory(history);

  return res.json({ ok: true, record });
});

app.get('/agents/analysis', (req, res) => {
  const history = loadHistory();
  const { agents, warnings } = loadAgentsFromDirectory();
  const stats = computeStats(history);
  const analyzedAgents = createAgentsAnalysis(agents, stats);

  res.json({
    ok: true,
    endpoint: '/agents/analysis',
    agents: analyzedAgents,
    stats,
    warnings,
  });
});

const startupAgents = loadAgentsFromDirectory();
if (startupAgents.warnings.length) {
  startupAgents.warnings.forEach((warning) => {
    console.warn(`[agents] ${warning}`);
  });
}
console.log(`[agents] ${startupAgents.agents.length} agente(s) carregado(s) automaticamente.`);

app.listen(port, () => {
  console.log(`Servidor de agentes rodando em http://localhost:${port}`);
});
