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

// Draw coordinates of a creature are top left.
function drawCreature(creature, ms) {
    var imgs = creature.type.image(creature, ms);
    for (var i = 0; i < imgs.length; i++) {
        gblit(imgs[i][0], imgs[i][1], creature.x * GRID_SIZE + scrollX, creature.y * GRID_HEIGHT + scrollY);
    }
}

function drawParticle(p) {
    if (p == null) { return; }
    if (p.type.frames) {
        var animMs = totalMs % (p.type.animCycle * p.type.frames.length);
        var animFrame = Math.floor(animMs / p.type.animCycle);
        gblit(p.type.frames[animFrame][0], p.type.frames[animFrame][1], p.x * GRID_SIZE + scrollX, p.y * GRID_HEIGHT + scrollY - p.z * GRID_HEIGHT + GRID_HEIGHT);
    } else {
        c.fillStyle = p.type.colour;
        c.fillRect(p.x * GRID_SIZE + scrollX, p.y * GRID_HEIGHT + scrollY - p.z * GRID_HEIGHT + GRID_HEIGHT, p.type.xSize * GRID_SIZE, p.type.ySize * GRID_HEIGHT);
    }
}

function drawShot(s) {
    if (s == null) { return; }
    var animMs = totalMs % (s.type.animCycle * s.type.frames.length);
    var animFrame = Math.floor(animMs / s.type.animCycle);
    gblit(s.type.frames[animFrame][0], s.type.frames[animFrame][1], s.x * GRID_SIZE + scrollX, s.y * GRID_HEIGHT + scrollY);
}

function inVisionRange(c, x, y) {
    var cx = c.x + c.type.xSize / 2;
    var cy = c.y + c.type.ySize / 2;
    if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= c.type.visionRange * c.type.visionRange) {
        return isLitFrom(cx, cy, x, y, blocksSightAt);
    } else {
        return false;
    }
}

function fullyVisible(c, x, y) {
    var cx = c.x + c.type.xSize / 2;
    var cy = c.y + c.type.ySize / 2;
    if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= (c.type.visionRange - 1) * (c.type.visionRange - 1)) {
        return isFullyLitFrom(cx, cy, x, y, blocksSightAt);
    } else {
        return false;
    }
}

function pickupable() {
    var item = null;
    creatureCorners(currentLevel.player).forEach(function(t) {
        if (item) { return; }
        item = t.item;
    });
    return item;
}

function draw() {
    c.fillStyle = "black";
    c.fillRect(0, 0, 800, 600);
    c.font = "8px Verdana";
    c.textAlign = "left";

    var gridY = Math.round(scrollY);
    for (var y = 0; y < currentLevel.map.length; y++) {
        var gridX = Math.round(scrollX);
        for (var x = 0; x < currentLevel.map[y].length; x++) {
            if (inVisionRange(currentLevel.player, x, y)) {
                currentLevel.map[y][x].mapped = true;
                var animMs = totalMs % (currentLevel.map[y][x].type.animCycle * currentLevel.map[y][x].type.frames.length);
                var animFrame = Math.floor(animMs / currentLevel.map[y][x].type.animCycle);
                gblit(currentLevel.map[y][x].type.frames[animFrame][0], currentLevel.map[y][x].type.frames[animFrame][1], gridX, gridY);
                if (currentLevel.map[y][x].item) {
                    gblit(currentLevel.map[y][x].item.type.frames[animFrame][0], currentLevel.map[y][x].item.type.frames[animFrame][1], gridX, gridY);
                }
                if (!fullyVisible(currentLevel.player, x, y)) {
                    gblit(0, 6, gridX, gridY);
                }
            }
            gridX += GRID_SIZE;
        }
        currentLevel.monsters.forEach(function(m) {
            if (inVisionRange(currentLevel.player, m.x, m.y) && Math.floor(m.y + m.type.ySize) == y) { drawCreature(m, totalMs); }
        });
        if (Math.floor(currentLevel.player.y + currentLevel.player.type.ySize) == y) { drawCreature(currentLevel.player, totalMs); }
        currentLevel.shots.forEach(function(s) {
            if (s != null && inVisionRange(currentLevel.player, s.x, s.y) && Math.floor(s.y + s.type.ySize) == y) { drawShot(s); }
        });
        currentLevel.particles.forEach(function(p) { 
            if (p != null && inVisionRange(currentLevel.player, p.x, p.y) && Math.floor(p.y + p.type.ySize) == y) { drawParticle(p); }
        });
        gridY += GRID_HEIGHT;
    }
    
    for (var i = 0; i < currentLevel.player.type.hp; i++) {
        gblit(i < currentLevel.player.hp ? 2 : 6, 2, buffer.width - (i + 1) * GRID_SIZE, 0);
    }

    var itemX = 0;
    for (var k in currentLevel.player.inventory) {
        var item = currentLevel.player.inventory[k];
        gblit(item.type.frames[0][0], item.type.frames[0][1], buffer.width - (itemX++ + 1) * GRID_SIZE, GRID_SIZE);
    }
    
    for (var y = 0; y < currentLevel.map.length; y++) {
        for (var x = 0; x < currentLevel.map[y].length; x++) {
            if (currentLevel.map[y][x].mapped) {
                c.fillStyle = currentLevel.map[y][x].type.minimapColor;
            } else {
                c.fillStyle = "black";
            }
            c.fillRect(200 - currentLevel.map[y].length + x, GRID_SIZE * 2 + y, 1, 1);
        }
    }
    c.fillStyle = "#bd3737";
    c.fillRect(200 - currentLevel.map[0].length + Math.floor(currentLevel.player.x), GRID_SIZE * 2 + Math.floor(currentLevel.player.y), 1, 1);
    
    c.fillStyle = "white";
    var pAble = pickupable();
    if (pAble && currentLevel.player.pickupCooldown <= 0) {
        c.fillText("P: Pick up " + pAble.type.name, 5, buffer.height - 5);
    } else {
        c.fillText("WASD: move, IJKL: attack, Space: magic", 5, buffer.height - 5);
    }
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
