const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');

// Game variables
let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Paddle dimensions
const paddleWidth = 10;
const paddleHeight = 80;

// Player paddle
const player = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

// Computer paddle
const computer = {
    x: canvas.width - paddleWidth - 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 5
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 5,
    dy: 5,
    speed: 5,
    maxSpeed: 10
};

// Keyboard input tracking
const keys = {
    arrowUp: false,
    arrowDown: false,
    mouseY: canvas.height / 2
};

// Event listeners for keyboard
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') keys.arrowUp = true;
    if (e.key === 'ArrowDown') keys.arrowDown = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') keys.arrowUp = false;
    if (e.key === 'ArrowDown') keys.arrowDown = false;
});

// Mouse movement tracking
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    keys.mouseY = e.clientY - rect.top;
});

// Button event listeners
startBtn.addEventListener('click', toggleGame);
resetBtn.addEventListener('click', resetScore);

function toggleGame() {
    gameRunning = !gameRunning;
    startBtn.textContent = gameRunning ? 'Pause Game' : 'Start Game';
    if (gameRunning) {
        gameLoop();
    }
}

function resetScore() {
    playerScore = 0;
    computerScore = 0;
    updateScoreboard();
    resetBall();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 10;
    ball.speed = 5;
}

function updateScoreboard() {
    playerScoreDisplay.textContent = playerScore;
    computerScoreDisplay.textContent = computerScore;
}

function drawRectangle(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawLine(x1, y1, x2, y2, color, width = 2) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawGame() {
    // Clear canvas
    drawRectangle(0, 0, canvas.width, canvas.height, '#1a1a2e');

    // Draw center line
    for (let i = 0; i < canvas.height; i += 15) {
        drawLine(canvas.width / 2, i, canvas.width / 2, i + 10, '#667eea', 2);
    }

    // Draw paddles
    drawRectangle(player.x, player.y, player.width, player.height, '#00ff88');
    drawRectangle(computer.x, computer.y, computer.width, computer.height, '#ff006e');

    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#ffd60a');
}

function updatePlayerPaddle() {
    // Arrow keys movement
    if (keys.arrowUp && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys.arrowDown && player.y + player.height < canvas.height) {
        player.y += player.speed;
    }

    // Mouse movement
    const mouseTarget = keys.mouseY - player.height / 2;
    const distance = mouseTarget - player.y;
    
    if (Math.abs(distance) > player.speed) {
        player.y += distance > 0 ? player.speed : -player.speed;
    } else {
        player.y = mouseTarget;
    }

    // Keep paddle in bounds
    player.y = Math.max(0, Math.min(player.y, canvas.height - player.height));
}

function updateComputerPaddle() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    const distance = ballCenter - computerCenter;

    if (Math.abs(distance) > computer.speed) {
        computer.y += distance > 0 ? computer.speed : -computer.speed;
    }

    // Keep paddle in bounds
    computer.y = Math.max(0, Math.min(computer.y, canvas.height - computer.height));
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (top and bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(ball.y, canvas.height - ball.radius));
    }

    // Player paddle collision
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.radius;

        // Add spin based on paddle hit location
        const paddleCenter = player.y + player.height / 2;
        const hitPos = (ball.y - paddleCenter) / (player.height / 2);
        ball.dy += hitPos * 3;

        // Increase speed slightly
        ball.speed = Math.min(ball.speed + 0.5, ball.maxSpeed);
        ball.dx = ball.dx > 0 ? ball.speed : -ball.speed;
    }

    // Computer paddle collision
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;

        // Add spin based on paddle hit location
        const paddleCenter = computer.y + computer.height / 2;
        const hitPos = (ball.y - paddleCenter) / (computer.height / 2);
        ball.dy += hitPos * 3;

        // Increase speed slightly
        ball.speed = Math.min(ball.speed + 0.5, ball.maxSpeed);
        ball.dx = ball.dx > 0 ? ball.speed : -ball.speed;
    }

    // Scoring
    if (ball.x - ball.radius < 0) {
        computerScore++;
        updateScoreboard();
        resetBall();
    }

    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        updateScoreboard();
        resetBall();
    }
}

function gameLoop() {
    drawGame();
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();

    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Initialize display
updateScoreboard();
drawGame();
