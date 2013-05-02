const GRID_SIZE = 16;
const GRID_HEIGHT = 8;
const SCALE = 4;
var canvas = document.getElementById("gameCanvas");
var buffer = document.createElement("canvas");
buffer.width = canvas.width / SCALE;
buffer.height = canvas.height / SCALE;
var canvasContext = canvas.getContext("2d");
canvasContext.imageSmoothingEnabled = false;
var c = buffer.getContext("2d");
var keys = {};
var graphicsImage = new Image();
graphicsImage.src = "graphicsImage.png";


function drawCreature(creature) {
    var s = creature.type.image(creature);
    gblit(s[0], s[1], creature.x * GRID_SIZE + scrollX, creature.y * GRID_HEIGHT + scrollY);
}

function draw() {
    c.fillStyle = "black";
    c.fillRect(0, 0, 800, 600);
    for (var y = 0; y < currentLevel.map.length; y++) {
        for (var x = 0; x < currentLevel.map[y].length; x++) {
            if (!currentLevel.map[y][x].type.wall) {
                gblit(currentLevel.map[y][x].type.sx, currentLevel.map[y][x].type.sy, x * GRID_SIZE + scrollX, y * GRID_HEIGHT + scrollY - GRID_SIZE + GRID_HEIGHT);
            }
        }
    }
    
    drawCreature(currentLevel.player);
    
    for (var y = 0; y < currentLevel.map.length; y++) {
        for (var x = 0; x < currentLevel.map[y].length; x++) {
            if (currentLevel.map[y][x].type.wall) {
                gblit(currentLevel.map[y][x].type.sx, currentLevel.map[y][x].type.sy, x * GRID_SIZE + scrollX, y * GRID_HEIGHT + scrollY - GRID_SIZE + GRID_HEIGHT);
            }
        }
    }
    
    c.fillStyle = "white";
    c.fillText(fps, 10, 10);
}

function canvasKeyDown(e) {
    keys[String.fromCharCode(e.which)] = true;
}

function canvasKeyUp(e) {
    keys[String.fromCharCode(e.which)] = false;
}

$('body').keydown(canvasKeyDown);
$('body').keyup(canvasKeyUp);

function keyDown(key) {
    return !!keys[key];
}

function blit(img, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (dx > buffer.width || dy > buffer.height || dx + dw < 0 || dy + dh < 0) { return; }
    c.drawImage(img, sx, sy, sw, sh, Math.floor(dx), Math.floor(dy), dw, dh);
}

function gblit(sx, sy, dx, dy) {
    blit(graphicsImage, sx * (GRID_SIZE + 1), sy * (GRID_SIZE + 1), GRID_SIZE, GRID_SIZE, dx, dy, GRID_SIZE, GRID_SIZE);
}

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var lastUpdate = new Date().getTime();

function nextFrame() {
    var currentTime = new Date().getTime();
    update(currentTime - lastUpdate);
    draw();
    canvasContext.drawImage(buffer, 0, 0, 800, 600);
    lastUpdate = currentTime;
    requestAnimationFrame(nextFrame);
}

requestAnimationFrame(nextFrame);
