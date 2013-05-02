var currentLevel = {
    map: [],
    player: {
        type: creatureTypes.player,
        direction: SOUTH,
        attackDirection: SOUTH,
        x: 3,
        y: 3,
        reload: 0,
        attackTime: 0
    }
};

var scrollX = 0;
var scrollY = 0;

for (var y = 0; y < 100; y++) {
    var row = [];
    for (var x = 0; x < 100; x++) {
        row.push({
            type: (y % 8 == 0 || x % 8 == 0) && !((y + 2) % 8 == 0 || (x + 2) % 8 == 0) ? tileTypes.stoneWall : tileTypes.stoneFloor
        });
    }
    currentLevel.map.push(row);
}

var fps = "?";
var msBuffer = [];

function tileAt(x, y) {
    return currentLevel.map[Math.floor(y)][Math.floor(x)];
}

function moveCreature(creature, dx, dy) {
    if (dx > 0) {
        var newX = creature.x + dx;
        var rectRight = newX + 0.75;
        var rectTop = creature.y + 0.75;
        var rectBottom = creature.y + 1.25;
        if (tileAt(rectRight, rectTop).type.wall || tileAt(rectRight, rectBottom).type.wall) {
            creature.x = Math.floor(rectRight) - 0.76;
        } else {
            creature.x = newX;
        }
        creature.direction = WEST;
    }
    
    if (dx < 0) {
        var newX = creature.x + dx;
        var rectLeft = newX + 0.25;
        var rectTop = creature.y + 0.75;
        var rectBottom = creature.y + 1.25;
        if (tileAt(rectLeft, rectTop).type.wall || tileAt(rectLeft, rectBottom).type.wall) {
            creature.x = Math.floor(rectLeft) + 0.76;
        } else {
            creature.x = newX;
        }
        creature.direction = EAST;
    }
    
    if (dy > 0) {
        var newY = creature.y + dy;
        var rectBottom = newY + 1.25;
        var rectLeft = creature.x + 0.25;
        var rectRight = creature.x + 0.75;
        if (tileAt(rectLeft, rectBottom).type.wall || tileAt(rectRight, rectBottom).type.wall) {
            creature.y = Math.floor(rectBottom) - 1.26;
        } else {
            creature.y = newY;
        }
        creature.direction = SOUTH;
    }
    
    if (dy < 0) {
        var newY = creature.y + dy;
        var rectTop = newY + 0.75;
        var rectLeft = creature.x + 0.25;
        var rectRight = creature.x + 0.75;
        if (tileAt(rectLeft, rectTop).type.wall || tileAt(rectRight, rectTop).type.wall) {
            creature.y = Math.floor(rectTop) + 0.26;
        } else {
            creature.y = newY;
        }
        creature.direction = NORTH;
    }
}

function attack(c, direction) {
    c.attackDirection = direction;
    c.attackTime = c.type.attackTime;
}

function tickCreature(c, ms) {
    if (c.attackTime > 0) {
        c.attackTime -= ms;
        if (c.attackTime <= 0) {
            c.reload = c.type.reload;
        }
    }
    if (c.reload > 0) {
        c.reload -= ms;
    }
}

function update(ms) {
    msBuffer.push(ms);
    if (msBuffer.length > 10) {
        msBuffer.shift();
    }
    fps = Math.round(1000 / (msBuffer.reduce(function(a, b) { return a + b; }, 0.0) / msBuffer.length));
    
    var time = ms * FRAMERATE / 1000;
    
    if (keyDown("W")) { moveCreature(currentLevel.player, 0, -currentLevel.player.type.speed * time); }
    if (keyDown("A")) { moveCreature(currentLevel.player, -currentLevel.player.type.speed * time, 0); }
    if (keyDown("S")) { moveCreature(currentLevel.player, 0, currentLevel.player.type.speed * time); }
    if (keyDown("D")) { moveCreature(currentLevel.player, currentLevel.player.type.speed * time, 0); }
    
    if (currentLevel.player.attackTime <= 0 && currentLevel.player.reload <= 0) {
        if (keyDown("I")) { attack(currentLevel.player, NORTH); }
        if (keyDown("J")) { attack(currentLevel.player, WEST); }
        if (keyDown("K")) { attack(currentLevel.player, SOUTH); }
        if (keyDown("L")) { attack(currentLevel.player, EAST); }
    }
    
    scrollX = -currentLevel.player.x * GRID_SIZE + buffer.width / 2 - GRID_SIZE / 2;
    scrollY = -currentLevel.player.y * GRID_HEIGHT + buffer.height / 2 - GRID_HEIGHT / 2;
    
    tickCreature(currentLevel.player, ms);
}

