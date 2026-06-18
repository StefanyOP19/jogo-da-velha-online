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
  // Minimax to choose best move for AI
  const avail = board.map((v,i)=>v?null:i).filter(v=>v!==null);
  let bestScore = -Infinity;
  let move = null;
  for(const i of avail){
    board[i]=ai;
    const score = minimax(board,0,false);
    board[i]=null;
    if(score>bestScore){bestScore=score;move=i}
  }
  return move;
}

function minimax(b, depth, isMaximizing){
  if(winningCombo(b, ai)) return 10 - depth;
  if(winningCombo(b, human)) return depth - 10;
  if(b.every(Boolean)) return 0;

  const avail = b.map((v,i)=>v?null:i).filter(v=>v!==null);
  if(isMaximizing){
    let best = -Infinity;
    for(const i of avail){
      b[i]=ai;
      best = Math.max(best, minimax(b, depth+1, false));
      b[i]=null;
    }
    return best;
  } else {
    let best = Infinity;
    for(const i of avail){
      b[i]=human;
      best = Math.min(best, minimax(b, depth+1, true));
      b[i]=null;
    }
    return best;
  }
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
