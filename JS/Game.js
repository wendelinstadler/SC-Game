const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const highscoreDisplay = document.getElementById("highscore");
const missesDisplay = document.getElementById("misses");
const restartBtn = document.getElementById("restartBtn");

canvas.style.cursor = "none";

let score = 0;
let highscore = 0;
let misses = 0;
const maxMisses = 5;
let gameOver = false;

let targets = [];
let mouseX = 0;
let mouseY = 0;

const scopeRadius = 130;
const zoomFactor = 2.5;

// =========================
// Highscore Funktionen
// =========================
function saveHighscore(newScore) {
    let stored = localStorage.getItem("highscore");

    if (!stored || newScore > parseInt(stored)) {
        localStorage.setItem("highscore", newScore);
    }
}

function loadHighscore() {
    let stored = localStorage.getItem("highscore");
    return stored ? parseInt(stored) : 0;
}

// Highscore beim Start laden
highscore = loadHighscore();
highscoreDisplay.textContent = highscore;

// =========================
// Target Klasse
// =========================
class Target {
    constructor(x, y, size, speedX, speedY) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x + this.size > canvas.width)
            this.speedX *= -1;

        if (this.y < 0 || this.y + this.size > canvas.height)
            this.speedY *= -1;
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

// =========================
// Spawn Targets
// =========================
function spawnTarget() {
    if (gameOver) return;

    const size = Math.random() * 8 + 4;
    const x = Math.random() * (canvas.width - size);
    const y = Math.random() * (canvas.height - size);
    const speedX = (Math.random() - 0.5) * 2;
    const speedY = (Math.random() - 0.5) * 2;

    targets.push(new Target(x, y, size, speedX, speedY));
}

// =========================
// Maus Events
// =========================
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener("click", () => {

    if (gameOver) return;

    let hit = false;

    for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];

        if (
            mouseX >= t.x &&
            mouseX <= t.x + t.size &&
            mouseY >= t.y &&
            mouseY <= t.y + t.size
        ) {
            targets.splice(i, 1);
            score++;
            scoreDisplay.textContent = score;
            hit = true;

            if (score > highscore) {
                highscore = score;
                highscoreDisplay.textContent = highscore;
                saveHighscore(highscore);
            }
        }
    }

    if (hit) {
        if (misses > 0) {
            misses = 0;
            missesDisplay.textContent = misses;
        }
    } else {
        misses++;
        missesDisplay.textContent = misses;

        if (misses >= maxMisses) {
            gameOver = true;
        }
    }
});

// =========================
// Restart
// =========================
function restartGame() {
    score = 0;
    misses = 0;
    targets = [];
    gameOver = false;

    scoreDisplay.textContent = 0;
    missesDisplay.textContent = 0;

    restartBtn.style.display = "none";

    for (let i = 0; i < 25; i++) spawnTarget();
}

restartBtn.addEventListener("click", restartGame);

// =========================
// Drawing
// =========================
function drawWorld() {
    targets.forEach(t => {
        const dx = (t.x + t.size / 2) - mouseX;
        const dy = (t.y + t.size / 2) - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > scopeRadius) {
            t.draw();
        }
    });
}

function drawScope() {

    ctx.save();

    ctx.beginPath();
    ctx.arc(mouseX, mouseY, scopeRadius, 0, Math.PI * 2);
    ctx.clip();

    ctx.translate(mouseX, mouseY);
    ctx.scale(zoomFactor, zoomFactor);
    ctx.translate(-mouseX, -mouseY);

    targets.forEach(t => {
        const dx = (t.x + t.size / 2) - mouseX;
        const dy = (t.y + t.size / 2) - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= scopeRadius) {
            t.draw();
        }
    });

    ctx.restore();

    ctx.beginPath();
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 6;
    ctx.arc(mouseX, mouseY, scopeRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(mouseX - scopeRadius, mouseY);
    ctx.lineTo(mouseX + scopeRadius, mouseY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(mouseX, mouseY - scopeRadius);
    ctx.lineTo(mouseX, mouseY + scopeRadius);
    ctx.stroke();
}

function drawCrosshair() {
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(mouseX - 8, mouseY);
    ctx.lineTo(mouseX + 8, mouseY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(mouseX, mouseY - 8);
    ctx.lineTo(mouseX, mouseY + 8);
    ctx.stroke();
}

// =========================
// Update & Draw Loop
// =========================
function update() {
    if (gameOver) return;
    targets.forEach(t => t.update());
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawWorld();

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawScope();
    drawCrosshair();

    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "red";
        ctx.font = "50px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

        restartBtn.style.display = "inline-block";
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start
for (let i = 0; i < 25; i++) spawnTarget();
setInterval(spawnTarget, 800);

gameLoop();
