const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById('score');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;
const COLORS = [
  '#00f0f0', '#0000f0', '#f0a000', '#f0f000', '#00f000', '#a000f0', '#f00000'
];

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[2, 0, 0], [2, 2, 2]], // J
  [[0, 0, 3], [3, 3, 3]], // L
  [[4, 4], [4, 4]], // O
  [[0, 5, 5], [5, 5, 0]], // S
  [[0, 6, 0], [6, 6, 6]], // T
  [[7, 7, 0], [0, 7, 7]] // Z
];

function randomPiece() {
  const typeId = Math.floor(Math.random() * SHAPES.length);
  const shape = SHAPES[typeId];
  return {
    x: Math.floor((COLS - shape[0].length) / 2),
    y: 0,
    shape,
    typeId
  };
}

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let piece = randomPiece();
let score = 0;
let dropInterval = 500;
let lastDrop = Date.now();
let gameOver = false;

function drawBlock(x, y, colorId) {
  ctx.fillStyle = COLORS[colorId - 1];
  ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  ctx.strokeStyle = '#222';
  ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) drawBlock(x, y, board[y][x]);
    }
  }
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) drawBlock(piece.x + x, piece.y + y, piece.shape[y][x]);
    }
  }
}

function collide(board, piece) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        // Check if out of bounds vertically
        if (piece.y + y >= ROWS || piece.x + x < 0 || piece.x + x >= COLS) {
          return true;
        }
        // Check collision with existing blocks
        if (board[piece.y + y] && board[piece.y + y][piece.x + x]) {
          return true;
        }
      }
    }
  }
  return false;
}

function merge(board, piece) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        board[piece.y + y][piece.x + x] = piece.shape[y][x];
      }
    }
  }
}

function rotate(shape) {
  return shape[0].map((_, i) => shape.map(row => row[i]).reverse());
}

function drop() {
  piece.y++;
  if (collide(board, piece)) {
    piece.y--;
    merge(board, piece);
    clearLines();
    resetPiece();
    // If new piece immediately collides, game over
    if (collide(board, piece)) {
      gameOver = true;
      alert('Game Over!');
    }
  }
  lastDrop = Date.now();
}

function resetPiece() {
  piece = randomPiece();
}

function clearLines() {
  let lines = 0;
  outer: for (let y = ROWS - 1; y >= 0; y--) {
    for (let x = 0; x < COLS; x++) {
      if (!board[y][x]) continue outer;
    }
    board.splice(y, 1);
    board.unshift(Array(COLS).fill(0));
    lines++;
    y++;
  }
  if (lines) {
    score += lines * 100;
    scoreDiv.textContent = 'Score: ' + score;
  }
}

function move(dir) {
  piece.x += dir;
  if (collide(board, piece)) piece.x -= dir;
}

function rotatePiece() {
  const oldShape = piece.shape;
  piece.shape = rotate(piece.shape);
  if (collide(board, piece)) piece.shape = oldShape;
}

document.addEventListener('keydown', e => {
  if (gameOver) return;
  if (e.key === 'ArrowLeft') move(-1);
  else if (e.key === 'ArrowRight') move(1);
  else if (e.key === 'ArrowDown') drop();
  else if (e.key === 'ArrowUp') rotatePiece();
  draw();
});

function update() {
  if (gameOver) return;
  if (Date.now() - lastDrop > dropInterval) drop();
  draw();
  requestAnimationFrame(update);
}

draw();
update();
