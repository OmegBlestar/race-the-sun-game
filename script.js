const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

// Rocket properties
let rocket = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 100, // Moved slightly up
    width: 30,
    height: 40,
    speed: 5,
    angle: 0,
    alive: true
};

// Obstacles and Bullets
let obstacles = [];
let bullets = [];
let score = 0;
let highScore = 0;
let difficulty = 1; // Increases as score rises
let lastFireTime = 0; // Tracks when the last bullet was fired

// Controls
let keys = {
    ArrowLeft: false,
    ArrowRight: false,
    " ": false // Spacebar for fire
};

// Handle key presses for desktop
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Mobile Controls for Left, Right, and Fire
document.getElementById('leftBtn').addEventListener('mousedown', () => keys['ArrowLeft'] = true);  // For mobile touch
document.getElementById('rightBtn').addEventListener('mousedown', () => keys['ArrowRight'] = true); // For mobile touch

document.getElementById('leftBtn').addEventListener('mouseup', () => keys['ArrowLeft'] = false);   // Stop on touch release
document.getElementById('rightBtn').addEventListener('mouseup', () => keys['ArrowRight'] = false);  // Stop on touch release

// Prevent stopping the movement while the button is pressed
document.getElementById('leftBtn').addEventListener('touchstart', () => keys['ArrowLeft'] = true);
document.getElementById('rightBtn').addEventListener('touchstart', () => keys['ArrowRight'] = true);

document.getElementById('leftBtn').addEventListener('touchend', () => keys['ArrowLeft'] = false);
document.getElementById('rightBtn').addEventListener('touchend', () => keys['ArrowRight'] = false);

// Fire Button with cooldown logic (0.7 seconds)
let fireCooldown = 700; // 0.7 seconds cooldown time
let lastFireTimestamp = 0; // Time when fire button was last tapped

document.getElementById('fireBtn').addEventListener('click', () => handleFire());
document.getElementById('fireBtn').addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent the default mobile behavior (text selection)
    handleFire();
});

function handleFire() {
    const currentTimestamp = Date.now();
    if (currentTimestamp - lastFireTimestamp >= fireCooldown) { // Check cooldown
        // Fire the rocket
        keys[' '] = true;
        lastFireTimestamp = currentTimestamp; // Update the timestamp when fire happens

        // Disable the fire after 100ms to simulate a shot
        setTimeout(() => {
            keys[' '] = false;
        }, 100);
    }
}

// Game Loop
function gameLoop(timestamp) {
    if (!rocket.alive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rocket Movement
    if (keys['ArrowLeft'] && rocket.x > 0) rocket.x -= rocket.speed;
    if (keys['ArrowRight'] && rocket.x + rocket.width < canvas.width) rocket.x += rocket.speed;
    if (keys['ArrowUp']) rocket.angle = -15;
    if (keys['ArrowDown']) rocket.angle = 15;
    if (!keys['ArrowUp'] && !keys['ArrowDown']) rocket.angle = 0;

    // Draw Rocket (Triangle Shape)
    ctx.save();
    ctx.translate(rocket.x + rocket.width / 2, rocket.y + rocket.height / 2);
    ctx.rotate((rocket.angle * Math.PI) / 180);
    ctx.beginPath();
    ctx.moveTo(0, -rocket.height / 2);
    ctx.lineTo(rocket.width / 2, rocket.height / 2);
    ctx.lineTo(-rocket.width / 2, rocket.height / 2);
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.restore();

    // Generate Obstacles (Harder as Score Increases)
    if (Math.random() < 0.02 + (score * 0.0005)) {
        let randomX = Math.random() * (canvas.width - 40);
        let randomSpeed = 3 + Math.random() * difficulty;
        obstacles.push({ x: randomX, y: -50, width: 40, height: 50, speed: randomSpeed });
    }

    // Move Obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.y += obstacle.speed;
        obstacle.x += Math.sin(obstacle.y / 50) * 2; // Wavy motion for difficulty

        if (obstacle.y > canvas.height) obstacles.splice(index, 1);

        // Check Collision
        if (
            rocket.x < obstacle.x + obstacle.width &&
            rocket.x + rocket.width > obstacle.x &&
            rocket.y < obstacle.y + obstacle.height &&
            rocket.y + rocket.height > obstacle.y
        ) {
            rocket.alive = false;
            document.getElementById('replayButton').style.display = 'block';
        }

        // Draw Obstacles
        ctx.fillStyle = "blue";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Fire Bullets with a cooldown of 0.7 seconds
    if (keys[' '] && timestamp - lastFireTimestamp >= fireCooldown) { // 0.7 seconds cooldown
        bullets.push({ x: rocket.x + rocket.width / 2 - 5, y: rocket.y, width: 10, height: 20, speed: 5 });
        lastFireTimestamp = timestamp;
    }

    // Move Bullets
    bullets.forEach((bullet, bulletIndex) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) bullets.splice(bulletIndex, 1);

        // Check Collision with Obstacles
        obstacles.forEach((obstacle, obstacleIndex) => {
            if (
                bullet.x < obstacle.x + obstacle.width &&
                bullet.x + bullet.width > obstacle.x &&
                bullet.y < obstacle.y + obstacle.height &&
                bullet.y + bullet.height > obstacle.y
            ) {
                bullets.splice(bulletIndex, 1);
                obstacles.splice(obstacleIndex, 1);
                score++;
                difficulty += 0.05; // Increase difficulty
                if (score > highScore) highScore = score;
            }
        });

        // Draw Bullet
        ctx.fillStyle = "yellow";
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Update Score
    document.getElementById('score').innerText = score;
    document.getElementById('highScore').innerText = highScore;

    // Draw the bottom line
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 50);
    ctx.lineTo(canvas.width, canvas.height - 50);
    ctx.stroke();

    requestAnimationFrame(gameLoop);
}

// Restart Game
function restartGame() {
    rocket.alive = true;
    rocket.x = canvas.width / 2 - 15;
    rocket.y = canvas.height - 100;
    obstacles = [];
    bullets = [];
    score = 0;
    difficulty = 1;
    document.getElementById('replayButton').style.display = 'none';
    gameLoop(0);
}

// Start the Game
gameLoop(0);
