const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Your game logic will go here
ctx.fillStyle = 'red';           // Set the color to red
const x = canvas.width / 2 - 50;  // Centering the rectangle horizontally
const y = canvas.height / 2 - 50; // Centering the rectangle vertically
ctx.fillRect(x, y, 100, 100);     // Draw the rectangle at the center

