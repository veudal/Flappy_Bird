let canvas;
let ctx;
let width = 0;
let height = 0;
let image;

const tps = 60;
const boost = 768;
const birdSize = 100;
const pipeWidth = 125;
const pipeDistance = 500;
const pipeGap = 3.5 * birdSize;
const pipeDelay = 2000;
const bottom = 50;
let gravity = 3000;
let inputAllowed = true;
let speed;
let x = 0;
let y = 0;
let velocity = 0;
let pipes = [];
let backgroundDiv;
let backgroundX = 0;
let gameStarted = false;

document.addEventListener("DOMContentLoaded", function () {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    backgroundDiv = document.getElementById('repeated-background');
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        ctx.imageSmoothingEnabled = false;
    }

    addEventListener('resize', resize);
    resize();

    setInterval(update, 1000 / tps);
    requestAnimationFrame(render);
    startGame();
});

function startGame() {
    gravity = 3000;
    inputAllowed = true;
    speed = 0; 
    x = 0;
    y = height / 2;
    velocity = 0;
    pipes.length = 0;
    gameStarted = false;
}

document.addEventListener("keyup", (event) => {
    if (inputAllowed && event.code === 'Space') {
        if (!gameStarted) {
            gameStarted = true;
            speed = 300;
        }
        if (y + birdSize / 2 >= height) {
            y = height - birdSize / 2;
            velocity = 0;
        } else {
            velocity = boost;
        }
    }
});

let timestamp = 0;

function update() {
    const now = performance.now() / 1000;
    const dt = now - timestamp;
    timestamp = now;

    if (!gameStarted) {
        y += Math.sin(now * 3) * 2;
        return;
    }

    velocity -= gravity * dt;
    x += speed * dt;
    y += velocity * dt;

    if (y + birdSize / 2 >= height) {
        y = height - birdSize / 2;
        velocity = 0;
    }

    if (y <= 0) {
        startGame();
    } else {
        y = Math.min(y, height);
    }

    calculatePipes();
}

function calculatePipes() {
    if (gameStarted && Math.floor(x / pipeDistance) > pipes.length - 5) {
        pipes[pipes.length] = [pipeDelay + pipes.length * pipeDistance, random(0.2, 0.8)];
    }

    if (inputAllowed && checkCollision()) {
        inputAllowed = false;
        velocity = -100
        gravity = 150;
        speed = 0;
    }
}

function checkCollision() {
    let birdTop = y - birdSize / 2;
    let birdBottom = y + birdSize / 2;
    let birdLeft = width * 0.15 - birdSize / 2;
    let birdRight = width * 0.15 + birdSize / 2;

    for (let i = 0; i < pipes.length; i++) {
        let pipeX = pipes[i][0] - x;
        let pipeTop = pipes[i][1] * height - pipeGap / 2;
        let pipeBottom = pipes[i][1] * height + pipeGap / 2;

        if (
            birdRight > pipeX && birdLeft < pipeX + pipeWidth &&
            (birdTop < pipeTop || birdBottom > pipeBottom)
        ) {
            return true;
        }
    }

    return false;
}

function render() {
    ctx.fillStyle = '#4dc1cb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < pipes.length; i++) {
        renderPipe(pipes[i][0], pipes[i][1]);
    }

    let screen_x = width * 0.15;
    let screen_y = height - y;

    ctx.save();
    ctx.translate(screen_x, screen_y);
    ctx.rotate(-velocity / 1500 - 0.6);

    ctx.translate(-screen_x, -screen_y);
    let i = "1";
    if (velocity > 250)
        i = "2";

    img = document.getElementById("img-" + i);
    ctx.drawImage(img, screen_x - birdSize / 2, screen_y - birdSize / 2, birdSize, birdSize);
    ctx.restore();

    ctx.fillStyle = 'white';
    ctx.textAlign = "center";
    ctx.font = "bold 86px Futura";
    const points = Math.floor(Math.max(0, (x + pipeDistance + width * 0.15 - pipeDelay)) / pipeDistance);
    ctx.fillText(points, width / 2, height / 6);
    if(inputAllowed)
        animateBackground();

    requestAnimationFrame(render);
}

function animateBackground() {
    backgroundX -= 6;
    backgroundDiv.style.backgroundPosition = backgroundX + 'px 0';
}

function renderPipe(world_x, world_y) {
    let screen_x = world_x - x;

    ctx.fillStyle = '#007F00';
    ctx.fillRect(screen_x, height, pipeWidth, -(world_y * height - pipeGap / 2));

    ctx.fillRect(screen_x, 0, pipeWidth, height - world_y * height - pipeGap / 2);
}

function random(min, max) {
    return min + Math.random() * (max - min);
}
