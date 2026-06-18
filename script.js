const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const newgameBtn = document.getElementById('newgame');

let board = Array(9).fill(null); // null, 'X', 'O'
const human = 'X';
const ai = 'O';
let gameOver = false;

function createBoard(){
  boardEl.innerHTML = '';
  for(let i=0;i<9;i++){
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.addEventListener('click', onCellClick);
    boardEl.appendChild(cell);
  }
}

function onCellClick(e){
  const idx = +e.currentTarget.dataset.index;
  if(gameOver || board[idx]) return;
  makeMove(idx, human);
  if(checkWin(board, human)) return endGame('Você venceu!');
  if(isTie(board)) return endGame('Empate!');
  statusEl.textContent = 'Máquina jogando...';
  setTimeout(()=>{
    const move = bestMove();
    makeMove(move, ai);
    if(checkWin(board, ai)) return endGame('Máquina venceu!');
    if(isTie(board)) return endGame('Empate!');
    statusEl.textContent = 'Sua vez';
  },200);
}

function makeMove(index, player){
  board[index]=player;
  const cell = boardEl.querySelector(`[data-index="${index}"]`);
  cell.textContent = player;
  cell.classList.add('disabled');
}

function endGame(message){
  gameOver = true;
  statusEl.textContent = message;
  // highlight winning line if any
  const win = winningCombo(board);
  if(win){
    win.forEach(i=>{
      const c = boardEl.querySelector(`[data-index="${i}"]`);
      c.style.background = 'linear-gradient(180deg,var(--light-orange),#ffd6b3)';
      c.style.color = '#8a2b00';
    });
  }
}

function isTie(b){
  return b.every(Boolean) && !winningCombo(b);
}

function checkWin(b, player){
  return Boolean(winningCombo(b, player));
}

function winningCombo(b, player){
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for(const [a,c,d] of wins){
    if(b[a] && b[a]===b[c] && b[a]===b[d]){
      if(!player || b[a]===player) return [a,c,d];
      return [a,c,d];
    }
  }
  return null;
}

function bestMove(){
  const avail = board.map((v,i)=>v?null:i).filter(v=>v!==null);

  // Busca vitória imediata
  for(const i of avail){
    board[i]=ai;
    if(checkWin(board, ai)){
      board[i]=null;
      return i;
    }
    board[i]=null;
  }

  // Bloqueia vitória do humano
  for(const i of avail){
    board[i]=human;
    if(checkWin(board, human)){
      board[i]=null;
      return i;
    }
    board[i]=null;
  }

  // Antigravity: movimentos menos previsíveis com pesos dinâmicos
  const early = [4,0,2,6,8].filter(i=>board[i]===null);
  if(avail.length >= 7 && early.length){
    return early[Math.floor(Math.random() * early.length)];
  }

  const weights = [3,2,3,2,4,2,3,2,3];
  let bestScore = -Infinity;
  let move = null;
  for(const i of avail){
    let score = weights[i];
    score += lineBonus(i, ai) * 1.6;
    score -= lineBonus(i, human) * 1.3;
    score += forkPotential(i, ai) * 2.0;
    score -= opponentThreat(i) * 1.4;
    score += Math.random() * 1.2;
    if(score > bestScore){
      bestScore = score;
      move = i;
    }
  }
  return move;
}

function lineBonus(index, player){
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  let bonus = 0;
  for(const line of lines){
    if(line.includes(index)){
      const count = line.filter(i=>board[i]===player).length;
      const empty = line.filter(i=>board[i]===null).length;
      if(count && empty) bonus += count;
    }
  }
  return bonus;
}

function forkPotential(index, player){
  const temp = board.slice();
  temp[index] = player;
  const avail = temp.map((v,i)=>v?null:i).filter(v=>v!==null);
  let threats = 0;
  for(const i of avail){
    temp[i] = player;
    if(winningCombo(temp, player)) threats++;
    temp[i] = null;
  }
  return threats;
}

function opponentThreat(index){
  const temp = board.slice();
  temp[index] = ai;
  const avail = temp.map((v,i)=>v?null:i).filter(v=>v!==null);
  let threats = 0;
  for(const i of avail){
    temp[i] = human;
    if(winningCombo(temp, human)) threats++;
    temp[i] = null;
  }
  return threats;
}

function reset(startWithAI=false){
  board = Array(9).fill(null);
  gameOver = false;
  statusEl.textContent = 'Sua vez';
  createBoard();
  if(startWithAI){
    statusEl.textContent = 'Máquina começa...';
    setTimeout(()=>{
      const m = bestMove();
      makeMove(m, ai);
      statusEl.textContent = 'Sua vez';
    },300);
  }
}

restartBtn.addEventListener('click', ()=>reset(false));
newgameBtn.addEventListener('click', ()=>reset(true));

// inicializa
createBoard();