// FINAL FIXED GAME — SPEED NAIK STABIL SETIAP 100 SCORE
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ==== FIX CANVAS HEIGHT ====
function resizeCanvas() {
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = "300px";

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = 300 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ==== GAME STATE ====
let gameRunning = false;
let showPlayButton = true;

// ==== DINO ====
let dino = { 
    x: 80, 
    y: 210,
    width: 40, 
    height: 40, 
    dy: 0, 
    jumpForce: 13, 
    gravity: 0.6, 
    grounded: true 
};

let obstacles = [];
let score = 0;
let scoreCounter = 0;
let speed = 6;

// ==== DRAW ====
function drawDino() {
    ctx.fillStyle = "black";
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
}

function drawObstacle(obs) {
    ctx.fillStyle = "green";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
}

function drawGround() {
    ctx.fillStyle = "#444";
    ctx.fillRect(0, 260, canvas.width / (window.devicePixelRatio || 1), 5);
}

function drawPlayButton() {
    const W = canvas.width / (window.devicePixelRatio || 1);
    const H = 300;

    const bw = 200, bh = 100;
    const bx = W / 2 - bw / 2;
    const by = H / 2 - bh / 2;

    ctx.fillStyle = "rgba(50,50,50,0.9)";
    ctx.fillRect(bx, by, bw, bh);

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("PLAY", bx + 50, by + 60);
}

// ==== CLICK ANYWHERE TO START (ONE CLICK ONLY) ====
canvas.addEventListener("click", () => {
    if (!showPlayButton) return;

    // FIX: langsung disable sebelum start → agar tidak perlu klik 2x
    showPlayButton = false;

    startNewGame();
});

// ==== JUMP ====
document.addEventListener("keydown", (e) => {
    if (!gameRunning) return;
    if (e.code === "Space" && dino.grounded) {
        dino.dy = -dino.jumpForce;
        dino.grounded = false;
    }
});

// ==== SPAWN CACTUS ====
function spawnNewCactus() {
    const sizes = [20, 30, 40, 50, 60, 70, 80];
    const w = sizes[Math.floor(Math.random() * sizes.length)];

    obstacles.push({
        x: canvas.width / (window.devicePixelRatio || 1),
        y: 210,
        width: w,
        height: 50,
        passed: false
    });
}

// ==== GAME LOOP ====
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGround();

    if (!gameRunning) {
        if (showPlayButton) drawPlayButton();
        requestAnimationFrame(update);
        return;
    }

    // === PHYSICS ===
    dino.y += dino.dy;
    dino.dy += dino.gravity;

    if (dino.y >= 210) {
        dino.y = 210;
        dino.dy = 0;
        dino.grounded = true;
    }

    drawDino();

    // === OBSTACLES ===
    obstacles.forEach((obs, i) => {
        obs.x -= speed;
        drawObstacle(obs);

        // COLLISION
        if (
            dino.x < obs.x + obs.width &&
            dino.x + dino.width > obs.x &&
            dino.y < obs.y + obs.height &&
            dino.y + dino.height > obs.y
        ) {
            return gameOver();
        }

        if (!obs.passed && obs.x + obs.width < dino.x) {
            obs.passed = true;
            spawnNewCactus();
        }

        if (obs.x < -200) obstacles.splice(i, 1);
    });

    // === SCORE LAMBAT ===
    scoreCounter++;
    if (scoreCounter >= 6) {
        score++;
        document.getElementById("score").innerText = score;
        scoreCounter = 0;
    }

    // === SPEED NAIK SETIAP 100 ===
    let level = Math.floor(score / 100);
    speed = 6 + level;

    requestAnimationFrame(update);
}
update();

// ==== GAME OVER ====
function gameOver() {
    gameRunning = false;
    showPlayButton = true;

    fetch("/api/highscores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Player", score: score })
    });
}

// ==== START NEW GAME ====
function startNewGame() {
    dino.y = 210;
    dino.dy = 0;
    dino.grounded = true;

    score = 0;
    scoreCounter = 0;
    speed = 6;

    obstacles = [];
    spawnNewCactus();

    gameRunning = true;
    document.getElementById("score").innerText = "0";
}
