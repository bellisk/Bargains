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
c.imageSmoothingEnabled = false;
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

function inVisionRange(c, x, y) {
    return (x - c.x) * (x - c.x) + (y - c.y) * (y - c.y) <= c.type.visionRange * c.type.visionRange;
}

function draw() {
    c.fillStyle = "black";
    c.fillRect(0, 0, 800, 600);
    c.font = "8px Verdana";
    c.textAlign = "left";

    for (var y = 0; y < currentLevel.map.length; y++) {
        for (var x = 0; x < currentLevel.map[y].length; x++) {
            if (!inVisionRange(currentLevel.player, x, y)) { continue; }
            var animMs = totalMs % (currentLevel.map[y][x].type.animCycle * currentLevel.map[y][x].type.frames.length);
            var animFrame = Math.floor(animMs / currentLevel.map[y][x].type.animCycle);
            gblit(currentLevel.map[y][x].type.frames[animFrame][0], currentLevel.map[y][x].type.frames[animFrame][1], x * GRID_SIZE + scrollX, y * GRID_HEIGHT + scrollY);
        }
        currentLevel.monsters.forEach(function(m) {
            if (inVisionRange(currentLevel.player, m.x, m.y) && Math.floor(m.y + m.type.ySize) == y) { drawCreature(m); }
        });
        if (Math.floor(currentLevel.player.y + currentLevel.player.type.ySize) == y) { drawCreature(currentLevel.player); }
        currentLevel.shots.forEach(function(s) {
            if (s != null && inVisionRange(currentLevel.player, s.x, s.y) && Math.floor(s.y + s.type.ySize) == y) { drawShot(s); }
        });
        currentLevel.particles.forEach(function(p) { 
            if (p != null && inVisionRange(currentLevel.player, p.x, p.y) && Math.floor(p.y + p.type.ySize) == y) { drawParticle(p); }
        });
    }
    
    for (var i = 0; i < currentLevel.player.type.hp; i++) {
        gblit(i < currentLevel.player.hp ? 2 : 6, 2, buffer.width - (i + 1) * GRID_SIZE, 0);
    }
    
    c.fillStyle = "white";
    c.fillText("WASD: move, IJKL: attack, Space: magic", 5, buffer.height - 5);
    for (var i = 0; i < currentLevel.player.spells.length; i++) {
        c.fillStyle = currentLevel.player.spell == currentLevel.player.spells[i] ? "#ff55ff" : "#aa33aa";
        c.fillText((i + 1) + " " + currentLevel.player.spells[i].displayName, 5, 24 + i * 12);
    }

    if (currentLevel.bargainDialogue) {
        c.fillStyle = "#444444";
        c.fillRect(15, 15, 170, 120);
        blit(graphicsImage, currentLevel.bargainTile.type.frames[0][0] * (GRID_SIZE + 1), currentLevel.bargainTile.type.frames[0][1] * (GRID_SIZE + 1), GRID_SIZE, GRID_SIZE, 76, 20, 48, 48);
        c.fillStyle = "white";
        c.fillText("Do you wish to make this bargain?", 20, 80);
        c.fillText(currentLevel.bargainTile.gain.desc, 20, 95);
        c.fillText(currentLevel.bargainTile.loss.desc, 20, 110);
        c.fillStyle = "yellow";
        c.fillText("Y / N", 20, 125);
    }

    c.font = "20px Verdana";
    if (victory) {
        c.fillStyle = "#77ff77";
        c.textAlign = "center";
        c.fillText("VICTORY", buffer.width / 2, buffer.height / 3);
    }
    if (defeat) {
        c.fillStyle = "red";
        c.textAlign = "center";
        c.fillText("DEFEAT", buffer.width / 2, buffer.height / 3);
    }
    if (victory || defeat) {
        c.font = "8px Verdana";
        c.fillText("Press space to continue", buffer.width / 2, buffer.height / 3 + 30);
    }
    
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
    c.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
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
