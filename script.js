const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

// Load images
const bgImage = new Image();
bgImage.src = 'background.jpg'; // Ensure this file exists

const obstacleImage = new Image();
obstacleImage.src = 'obstacle.png'; // Ensure this file is in the correct location

const rocketImage = new Image();
rocketImage.src = 'rocket.png'; // Ensure this file is in the correct location

// Rocket properties
// Rocket properties (Increased size)
let rocket = {
    x: canvas.width / 2 - 30, // Adjusted to center properly
    y: canvas.height - 120,
    width: 60, // Larger width
    height: 90, // Larger height
    speed: 5,
    alive: true
};


// Obstacles and Bullets
let obstacles = [];
let bullets = [];
let score = 0;
let highScore = 0;
let difficulty = 1;
let obstacleSpawnRate = 0.01;

// Controls
let keys = {
    ArrowLeft: false,
    ArrowRight: false
};

// Handle key presses for desktop
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Mobile Touch Controls
canvas.addEventListener('touchstart', (e) => {
    let touchX = e.touches[0].clientX;
    if (touchX < canvas.width / 2) {
        keys['ArrowLeft'] = true;
    } else {
        keys['ArrowRight'] = true;
    }
});

canvas.addEventListener('touchend', () => {
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
});

// Automatic firing (Fire rate fixed to 0.1s)
setInterval(() => {
    if (rocket.alive) {
        bullets.push({ x: rocket.x + rocket.width / 2, y: rocket.y, radius: 5, speed: 5 });
    }
}, 100);

// Game Loop
function gameLoop() {
    if (!rocket.alive) return;

    // Draw Background
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Rocket Movement
    if (keys['ArrowLeft'] && rocket.x > 0) rocket.x -= rocket.speed;
    if (keys['ArrowRight'] && rocket.x + rocket.width < canvas.width) rocket.x += rocket.speed;

    // Draw Rocket as Image
    ctx.drawImage(rocketImage, rocket.x, rocket.y, rocket.width, rocket.height);

    // Generate Obstacles
   // Generate Obstacles
    if (Math.random() < obstacleSpawnRate + (score * 0.0002)) {
        let randomX = Math.random() * (canvas.width - 50);
        
        // Increase obstacle base speed and make them faster as score increases
        let baseSpeed = 3; // Was 2 before
        let speedIncrease = score * 0.05; // Increases slightly with score
        let randomSpeed = baseSpeed + Math.random() * difficulty + speedIncrease;

        obstacles.push({ x: randomX, y: -50, radius: 25, speed: randomSpeed });
    }


    // Move and Draw Obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.y += obstacle.speed;
        
        if (obstacle.y > canvas.height) {
            rocket.alive = false;
            document.getElementById('replayButton').style.display = 'block';
        }
        
        // Check Collision with Rocket (Circular)
        let dx = rocket.x + rocket.width / 2 - obstacle.x;
        let dy = rocket.y + rocket.height / 2 - obstacle.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < obstacle.radius + rocket.width / 2) {
            rocket.alive = false;
            document.getElementById('replayButton').style.display = 'block';
        }

        // Draw Circular Obstacle with Image Filling Entire Area
        ctx.save();
        ctx.beginPath();
        ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Ensure the image fully covers the obstacle
        ctx.drawImage(obstacleImage, 
            obstacle.x - obstacle.radius, obstacle.y - obstacle.radius, 
            obstacle.radius * 2, obstacle.radius * 2
        );

        ctx.restore();
    });

    // Move and Draw Bullets
    bullets.forEach((bullet, bulletIndex) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) bullets.splice(bulletIndex, 1);

        // Check Collision with Obstacles
        obstacles.forEach((obstacle, obstacleIndex) => {
            let dx = bullet.x - obstacle.x;
            let dy = bullet.y - obstacle.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < obstacle.radius) {
                bullets.splice(bulletIndex, 1);
                obstacles.splice(obstacleIndex, 1);
                score++;
                difficulty += 0.02;
                if (score > highScore) highScore = score;
            }
        });

        // Draw Circular Bullet
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    // Update Score
    document.getElementById('score').innerText = score;
    document.getElementById('highScore').innerText = highScore;

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
    obstacleSpawnRate = 0.01;
    document.getElementById('replayButton').style.display = 'none';
    gameLoop();
}

// Start game after images are loaded
rocketImage.onload = () => {
    gameLoop();
};
