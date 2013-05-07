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

function drawParticle(p) {
    if (p == null) { return; }
    var animMs = totalMs % (p.type.animCycle * p.type.frames.length);
    var animFrame = Math.floor(animMs / p.type.animCycle);
    gblit(p.type.frames[animFrame][0], p.type.frames[animFrame][1], p.x * GRID_SIZE + scrollX, p.y * GRID_HEIGHT + scrollY);
}

function drawShot(s) {
    if (s == null) { return; }
    var animMs = totalMs % (s.type.animCycle * s.type.frames.length);
    var animFrame = Math.floor(animMs / s.type.animCycle);
    gblit(s.type.frames[animFrame][0], s.type.frames[animFrame][1], s.x * GRID_SIZE + scrollX, s.y * GRID_HEIGHT + scrollY);
}

function draw() {
    c.fillStyle = "black";
    c.fillRect(0, 0, 800, 600);

    for (var y = 0; y < currentLevel.map.length; y++) {
        for (var x = 0; x < currentLevel.map[y].length; x++) {
            var animMs = totalMs % (currentLevel.map[y][x].type.animCycle * currentLevel.map[y][x].type.frames.length);
            var animFrame = Math.floor(animMs / currentLevel.map[y][x].type.animCycle);
            gblit(currentLevel.map[y][x].type.frames[animFrame][0], currentLevel.map[y][x].type.frames[animFrame][1], x * GRID_SIZE + scrollX, y * GRID_HEIGHT + scrollY);
        }
        currentLevel.monsters.forEach(function(m) {
            if (Math.floor(m.y + m.type.ySize) == y) { drawCreature(m); }
        });
        if (Math.floor(currentLevel.player.y + currentLevel.player.type.ySize) == y) { drawCreature(currentLevel.player); }
        currentLevel.shots.forEach(function(s) {
            if (s != null && Math.floor(s.y + s.type.ySize) == y) { drawShot(s); }
        });
        currentLevel.particles.forEach(function(p) { 
            if (p != null && Math.floor(p.y + p.type.ySize) == y) { drawParticle(p); }
        });
    }
    
    for (var i = 0; i < currentLevel.player.type.hp; i++) {
        gblit(i < currentLevel.player.hp ? 2 : 6, 2, buffer.width - (i + 1) * GRID_SIZE, 0);
    }
    
    c.fillStyle = "white";
    c.fillText("WASD to move, IJKL to attack", 5, buffer.height - 15);
    c.fillText("Space to make braziers explode", 5, buffer.height - 5);
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
