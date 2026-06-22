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

## Implantacao automatica dos agentes

- Na inicializacao do servidor, todos os arquivos `.json` em `agents/` (exceto `game-history.json`) sao carregados automaticamente.
- Cada agente valido deve ter: `name`, `role`, `function`.
- Nao e necessario editar codigo para registrar novos agentes: basta adicionar um JSON valido em `agents/`.
- Em caso de arquivo invalido, o sistema ignora o item com aviso e segue disponivel com fallback.

## Analise automatica de partidas

- O front-end exibe a analise em tempo real abaixo do tabuleiro.
- A analise inclui:
  - total de partidas
  - partidas processadas e com fallback
  - vitorias/derrotas/empates por agente
  - taxa de vitoria por agente
  - agente com melhor desempenho

## Estrutura principal

- `index.html`: interface do jogo
- `style.css`: estilos
- `script.js`: logica do jogo e envio do historico
- `agents/server.js`: API Node.js dos agentes
- `agents/game-history.json`: armazenamento do historico
