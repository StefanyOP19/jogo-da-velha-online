Agentes de IA para análise do Jogo da Velha Web.

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
    "wins": {
      "X": 6,
      "O": 4
    },
    "bestWinner": "X"
  }
}
```
