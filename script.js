const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');

// State Game
let score = 0;
let highScore = localStorage.getItem('neonDodgeHighScore') || 0;
highScoreEl.textContent = highScore;

let gameOver = false;
let animationId;
let spawnTimer = 0;
let difficultyMultiplier = 1;

// Objek Player
const player = {
  width: 36,
  height: 36,
  x: canvas.width / 2 - 18,
  y: canvas.height - 60,
  speed: 6,
  dx: 0,
  color: '#58a6ff'
};

// Array Rintangan
let obstacles = [];

// Input Keyboard
const keys = {
  left: false,
  right: false
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
  if (e.key === ' ' && gameOver) resetGame();
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
});

function spawnObstacle() {
  const size = Math.random() * 25 + 20;
  const x = Math.random() * (canvas.width - size);
  const speed = (Math.random() * 2.5 + 3) * difficultyMultiplier;

  obstacles.push({
    x,
    y: -size,
    width: size,
    height: size,
    speed,
    color: '#f85149'
  });
}

function update() {
  if (gameOver) return;

  // Gerak Player
  if (keys.left && player.x > 0) {
    player.x -= player.speed;
  }
  if (keys.right && player.x + player.width < canvas.width) {
    player.x += player.speed;
  }

  // Spawn Rintangan secara berkala
  spawnTimer++;
  const spawnRate = Math.max(18, Math.floor(45 / difficultyMultiplier));
  if (spawnTimer >= spawnRate) {
    spawnObstacle();
    spawnTimer = 0;
  }

  // Update Posisi Rintangan & Cek Tabrakan
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.y += obs.speed;

    // AABB Collision Detection
    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      endGame();
      return;
    }

    // Hapus rintangan yang keluar layar & tambah skor
    if (obs.y > canvas.height) {
      obstacles.splice(i, 1);
      score += 10;
      scoreEl.textContent = score;
      difficultyMultiplier = 1 + score / 500;
    }
  }
}

function draw() {
  // Bersihkan canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Gambar Grid Latar Belakang Tipis
  ctx.strokeStyle = '#21262d';
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }

  // Gambar Player (dengan efek glow)
  ctx.shadowBlur = 12;
  ctx.shadowColor = player.color;
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Gambar Rintangan
  obstacles.forEach((obs) => {
    ctx.shadowBlur = 10;
    ctx.shadowColor = obs.color;
    ctx.fillStyle = obs.color;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  });

  // Reset shadow
  ctx.shadowBlur = 0;

  // Layar Game Over
  if (gameOver) {
    ctx.fillStyle = 'rgba(13, 17, 23, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f85149';
    ctx.font = 'bold 36px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = '#e6edf3';
    ctx.font = '18px Courier New';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillStyle = '#8b949e';
    ctx.font = '14px Courier New';
    ctx.fillText('Tekan SPASI untuk main lagi', canvas.width / 2, canvas.height / 2 + 55);
  }
}

function gameLoop() {
  update();
  draw();
  if (!gameOver) {
    animationId = requestAnimationFrame(gameLoop);
  }
}

function endGame() {
  gameOver = true;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('neonDodgeHighScore', highScore);
    highScoreEl.textContent = highScore;
  }
  draw();
}

function resetGame() {
  score = 0;
  difficultyMultiplier = 1;
  obstacles = [];
  player.x = canvas.width / 2 - player.width / 2;
  scoreEl.textContent = score;
  gameOver = false;
  gameLoop();
}

// Mulai Game
gameLoop();