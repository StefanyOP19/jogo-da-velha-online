Agentes de IA para análise do Jogo da Velha Web.

Implantação automática:
- Ao iniciar o servidor, os agentes são carregados automaticamente dos arquivos `.json` em `agents/` (exceto `game-history.json`).
- Cada agente deve ter os campos: `name`, `role`, `function`.
- Arquivos inválidos não interrompem o servidor: são ignorados com aviso e fallback.

Endpoints:
  GET /agents/stats - estatísticas do histórico do jogo
  POST /agents/history - salva um registro de partida
  GET /agents/analysis - devolve relatórios de Gisele, Jessica, Cleber e Juliana

Funções cadastradas dos agentes (`GET /agents/analysis`):
- Gisele
  - role: `Analista`
  - function: `analisar_estatisticas`
- Jessica
  - role: `Oportunidades`
  - function: `identificar_oportunidade`
- Cleber
  - role: `Revisor`
  - function: `revisar_consistencia`
- Juliana
  - role: `Soluções`
  - function: `concluir_solucao`

Contrato de resposta (`GET /agents/analysis`):
```json
{
  "ok": true,
  "endpoint": "/agents/analysis",
  "agents": [
    {
      "name": "Gisele",
      "role": "Analista",
      "function": "analisar_estatisticas",
      "message": "Total de partidas jogadas: 10. Vencedores: {\"X\":6,\"O\":4}."
    }
  ],
  "stats": {
    "totalGames": 10,
    "processedGames": 10,
    "ignoredGames": 0,
    "wins": {
      "X": 6,
      "O": 4
    },
    "bestWinner": "X",
    "byAgent": {
      "Jogador": {
        "games": 10,
        "wins": 6,
        "losses": 3,
        "draws": 1,
        "winRate": 60
      }
    },
    "bestPerformer": {
      "name": "Jogador",
      "games": 10,
      "wins": 6,
      "losses": 3,
      "draws": 1,
      "winRate": 60
    }
  },
  "warnings": []
}
```
