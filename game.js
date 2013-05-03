var currentLevel = null;

var scrollX = 0;
var scrollY = 0;

function setup() {
    currentLevel = {
        map: [],
        player: {
            type: creatureTypes.player,
            direction: SOUTH,
            attackDirection: SOUTH,
            x: 3,
            y: 3,
            reload: 0,
            attackTime: 0,
            hp: 10
        },
        monsters: [],
        particles: [null],
        firstEmptyParticle: 0
    };

    scrollX = 0;
    scrollY = 0;

    for (var y = 0; y < 100; y++) {
        var row = [];
        for (var x = 0; x < 100; x++) {
            row.push({
                type: ((y % 8 == 0 || x % 8 == 0) && !((y + 2) % 8 == 0 || (x + 2) % 8 == 0)) || (y == 0 || y == 99 || x == 0 || x == 99) ? tileTypes.stoneWall : tileTypes.stoneFloor
            });
        }
        currentLevel.map.push(row);
    }
    
    for (var i = 0; i < 100; i++) {
        var x = randint(0, 100);
        var y = randint(0, 100);
        if (!wallAt(x, y)) {
            currentLevel.monsters.push({
                type: creatureTypes.floobler,
                direction: randint(0, 4),
                attackDirection: 0,
                x: x,
                y: y,
                reload: 0,
                attackTime: 0,
                hp: 5
            });
        }
    }
}

function randint(from, to) {
    return from + Math.floor(Math.random() * (to - from - 0.0000000001));
}

function dieRoll(d) {
    return Math.random() < 1.0 / d;
}

var fps = "?";
var msBuffer = [];

function tileAt(x, y) {
    return currentLevel.map[Math.floor(y)][Math.floor(x)];
}

function wallAt(x, y) {
    var t = tileAt(x, y);
    return !t || t.type.wall;
}

setup();

function moveCreature(creature, dx, dy) {
    if (dx > 0) {
        var newX = creature.x + dx;
        var rectRight = newX + 0.75;
        var rectTop = creature.y + 0.75;
        var rectBottom = creature.y + 1.25;
        if (wallAt(rectRight, rectTop) || wallAt(rectRight, rectBottom)) {
            creature.x = Math.floor(rectRight) - 0.76;
        } else {
            creature.x = newX;
        }
        creature.direction = EAST;
    }
    
    if (dx < 0) {
        var newX = creature.x + dx;
        var rectLeft = newX + 0.25;
        var rectTop = creature.y + 0.75;
        var rectBottom = creature.y + 1.25;
        if (wallAt(rectLeft, rectTop) || wallAt(rectLeft, rectBottom)) {
            creature.x = Math.floor(rectLeft) + 0.76;
        } else {
            creature.x = newX;
        }
        creature.direction = WEST;
    }
    
    if (dy > 0) {
        var newY = creature.y + dy;
        var rectBottom = newY + 1.25;
        var rectLeft = creature.x + 0.25;
        var rectRight = creature.x + 0.75;
        if (wallAt(rectLeft, rectBottom) || wallAt(rectRight, rectBottom)) {
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
        if (wallAt(rectLeft, rectTop) || wallAt(rectRight, rectTop)) {
            creature.y = Math.floor(rectTop) + 0.26;
        } else {
            creature.y = newY;
        }
        creature.direction = NORTH;
    }
}

function attack(c, direction) {
    if (c.attackTime > 0 || c.reload > 0) { return; }
    c.attackDirection = direction;
    c.attackTime = c.type.attackTime;
    var ax = c.x + 0.5 + dirDx(direction) * 0.5;
    var ay = c.y + 0.5 + dirDy(direction) * 0.5;
    if (c == currentLevel.player) {
        var hitMonsters = currentLevel.monsters.filter(function(m) {
            return m.x <= ax && m.x + 1 >= ax && m.y <= ay && m.y + 1 >= ay;
        });
        if (hitMonsters.length > 0) {
            addParticle(0, 2, ax - 0.5, ay - 0.5, 300);
        }
        hitMonsters.forEach(function(m) {
           m.hp--; 
        });
    } else {
        if (currentLevel.player.x <= ax && currentLevel.player.x + 1 >= ax && currentLevel.player.y <= ay && currentLevel.player.y + 1 >= ay) {
            addParticle(0, 2, ax - 0.5, ay - 0.5, 300);
            currentLevel.player.hp--;
        }
    }
}

function tickCreature(c, ms) {
    if (c.hp <= 0) {
        addParticle(1, 2, c.x, c.y, 300);
        return false;
    }
    
    if (c.attackTime > 0) {
        c.attackTime -= ms;
        if (c.attackTime <= 0) {
            c.reload = c.type.reload;
        }
    }
    if (c.reload > 0) {
        c.reload -= ms;
    }
    
    c.type.tick(c, currentLevel, ms);
    return true;
}

function addParticle(sx, sy, x, y, life) {
    var p = { sx: sx, sy: sy, x: x, y: y, life: life };
    if (currentLevel.firstEmptyParticle >= currentLevel.particles.length) {
        currentLevel.particles.push(p);
    } else {
        currentLevel.particles[currentLevel.firstEmptyParticle] = p;
        while (currentLevel.firstEmptyParticle < currentLevel.particles.length && currentLevel.particles[currentLevel.firstEmptyParticle] != null) {
            currentLevel.firstEmptyParticle++;
        }
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
    
    if (keyDown("I")) { attack(currentLevel.player, NORTH); }
    if (keyDown("J")) { attack(currentLevel.player, WEST); }
    if (keyDown("K")) { attack(currentLevel.player, SOUTH); }
    if (keyDown("L")) { attack(currentLevel.player, EAST); }
    
    scrollX = -currentLevel.player.x * GRID_SIZE + buffer.width / 2 - GRID_SIZE / 2;
    scrollY = -currentLevel.player.y * GRID_HEIGHT + buffer.height / 2 - GRID_HEIGHT / 2;
    
    for (var i = 0; i < currentLevel.particles.length; i++) {
        if (currentLevel.particles[i] == null) { continue; }
        currentLevel.particles[i].life -= ms;
        if (currentLevel.particles[i].life <= 0) {
            currentLevel.firstEmptyParticle = Math.min(currentLevel.firstEmptyParticle, i);
            currentLevel.particles[i] = null;
        }
    }
    
    currentLevel.monsters = currentLevel.monsters.filter(function(m) { return tickCreature(m, ms); });
    
    if (!tickCreature(currentLevel.player, ms)) { setup(); }
}

