# Jogo da Velha Online

Projeto web de Jogo da Velha com IA e agentes Node.js para analisar estatísticas de partidas.

## Caracteristicas

- Jogo contra a maquina no navegador
- Estatisticas de partidas jogadas
- Registro de vencedor por partida
- Analise por agentes: Gisele, Jessica, Cleber e Juliana

## Como executar

1. Instale dependencias:

```bash
npm install
```

2. Inicie o servidor:

```bash
npm start
```

3. Acesse no navegador:

```text
http://localhost:3000
```

## Endpoints dos agentes

- `GET /agents/stats`
- `POST /agents/history`
- `GET /agents/analysis`

## Estrutura principal

- `index.html`: interface do jogo
- `style.css`: estilos
- `script.js`: logica do jogo e envio do historico
- `agents/server.js`: API Node.js dos agentes
- `agents/game-history.json`: armazenamento do historico
