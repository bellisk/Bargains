var currentLevel = null;

var victory = false;
var defeat = false;

var scrollX = 0;
var scrollY = 0;

var totalMs = 0;

function setup() {
    currentLevel = generateMap();
    currentLevel.player = {
        type: creatureTypes.player,
        direction: SOUTH,
        attackDirection: SOUTH,
        x: 3,
        y: 3,
        reload: 0,
        attackTime: 0,
        hp: 10,
        spells: [spellTypes.shootFire, spellTypes.explodeBrazier],
        spell: spellTypes.explodeBrazier
    };

    victory = false;
    defeat = false;

    scrollX = 0;
    scrollY = 0;
    
    for (var i = 0; i < 0; i++) {
        var x = randint(0, currentLevel.map[0].length);
        var y = randint(0, currentLevel.map.length);
        if (!blocksWalkAt(x, y)) {
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

function dieRoll(d) {
    return Math.random() < 1.0 / d;
}

var fps = "?";
var msBuffer = [];

function tileAt(x, y) {
    return currentLevel.map[Math.floor(y)][Math.floor(x)];
}

function blocksWalkAt(x, y) {
    var t = tileAt(x, y);
    return !t || t.type.blocksWalk;
}

function blocksSightAt(x, y) {
    var t = tileAt(x, y);
    return !t || t.type.blocksSight;
}

function blocksShotAt(x, y) {
    var t = tileAt(x, y);
    return !t || t.type.blocksShot;
}

setup();

function moveCreature(creature, dx, dy) {
    if (dx > 0) {
        var newX = creature.x + dx;
        var rectRight = newX + creature.type.xSize;
        var rectTop = creature.y;
        var rectBottom = creature.y + creature.type.ySize;
        if (blocksWalkAt(rectRight, rectTop) || blocksWalkAt(rectRight, rectBottom)) {
            creature.x = Math.floor(rectRight) - creature.type.xSize - 0.01;
        } else {
            creature.x = newX;
        }
        creature.direction = EAST;
    }
    
    if (dx < 0) {
        var newX = creature.x + dx;
        var rectLeft = newX;
        var rectTop = creature.y;
        var rectBottom = creature.y + creature.type.ySize;
        if (blocksWalkAt(rectLeft, rectTop) || blocksWalkAt(rectLeft, rectBottom)) {
            creature.x = Math.floor(rectLeft) + 1.01;
        } else {
            creature.x = newX;
        }
        creature.direction = WEST;
    }
    
    if (dy > 0) {
        var newY = creature.y + dy;
        var rectBottom = newY + creature.type.ySize;
        var rectLeft = creature.x;
        var rectRight = creature.x + creature.type.xSize;
        if (blocksWalkAt(rectLeft, rectBottom) || blocksWalkAt(rectRight, rectBottom)) {
            creature.y = Math.floor(rectBottom) - creature.type.ySize - 0.01;
        } else {
            creature.y = newY;
        }
        creature.direction = SOUTH;
    }
    
    if (dy < 0) {
        var newY = creature.y + dy;
        var rectTop = newY;
        var rectLeft = creature.x;
        var rectRight = creature.x + creature.type.xSize;
        if (blocksWalkAt(rectLeft, rectTop) || blocksWalkAt(rectRight, rectTop)) {
            creature.y = Math.floor(rectTop) + 1.01;
        } else {
            creature.y = newY;
        }
        creature.direction = NORTH;
    }
}

function doDamage(c, ax, ay, axSize, aySize, dmg) {
    if (c == currentLevel.player) {
        var hitMonsters = currentLevel.monsters.filter(function(m) {
            return m.x <= ax + axSize && m.x + m.type.xSize >= ax && m.y <= ay + aySize && m.y + m.type.ySize >= ay;
        });
        if (hitMonsters.length > 0) {
            addParticle(particleTypes.blood, ax + axSize * 0.5 - particleTypes.blood.xSize * 0.5, ay + aySize * 0.5 - particleTypes.blood.ySize * 0.5);
        }
        hitMonsters.forEach(function(m) {
           m.hp -= dmg; 
        });
        return hitMonsters.length > 0;
    } else {
        if (currentLevel.player.x <= ax + axSize && currentLevel.player.x + currentLevel.player.type.xSize >= ax && currentLevel.player.y <= ay + aySize && currentLevel.player.y + currentLevel.player.type.ySize >= ay) {
            addParticle(particleTypes.blood, ax + axSize * 0.5 - particleTypes.blood.xSize * 0.5, ay + aySize * 0.5 - particleTypes.blood.ySize * 0.5);
            currentLevel.player.hp -= dmg;
            return true;
        }
        return false;
    }
}

function attack(c, direction) {
    if (c.attackTime > 0 || c.reload > 0) { return; }
    c.attackDirection = direction;
    c.attackTime = c.type.attackTime;
    var ax = c.x + c.type.xSize * 0.5 + dirDx(direction) * 0.5 - 0.5;
    var ay = c.y + c.type.ySize * 0.5 + dirDy(direction) * 0.5 - 0.5;
    doDamage(c, ax, ay, 1, 1, 1);
}

function cast(c) {
    if (c.attackTime > 0 || c.reload > 0) { return; }
    c.attackDirection = c.direction;
    c.attackTime = c.type.attackTime;
    c.spell.cast(c, currentLevel);
}

function tickCreature(c, ms) {
    if (c.hp <= 0) {
        addParticle(particleTypes.death, c.x + c.type.xSize * 0.5 - particleTypes.death.xSize * 0.5, c.y + c.type.ySize * 0.5 - particleTypes.death.ySize * 0.5);
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
    
    var rectRight = c.x + c.type.xSize;
    var rectBottom = c.y + c.type.ySize;

    var t = tileAt(c.x, c.y);
    if (t.type.onCreatureIntersect) {
        t.type.onCreatureIntersect(t, c, currentLevel);
    }

    t = tileAt(rectRight, c.y);
    if (t.type.onCreatureIntersect) {
        t.type.onCreatureIntersect(t, c, currentLevel);
    }

    t = tileAt(c.x, rectBottom);
    if (t.type.onCreatureIntersect) {
        t.type.onCreatureIntersect(t, c, currentLevel);
    }

    t = tileAt(rectRight, rectBottom);
    if (t.type.onCreatureIntersect) {
        t.type.onCreatureIntersect(t, c, currentLevel);
    }

    return true;
}

function addParticle(type, x, y) {
    var p = { type: type, x: x, y: y, life: type.life };
    if (currentLevel.firstEmptyParticle >= currentLevel.particles.length) {
        currentLevel.particles.push(p);
    } else {
        currentLevel.particles[currentLevel.firstEmptyParticle] = p;
        while (currentLevel.firstEmptyParticle < currentLevel.particles.length && currentLevel.particles[currentLevel.firstEmptyParticle] != null) {
            currentLevel.firstEmptyParticle++;
        }
    }
}

function addShot(type, x, y, direction, shooter) {
    var s = { type: type, x: x, y: y, direction: direction, shooter: shooter, life: type.life };
    if (currentLevel.firstEmptyShot >= currentLevel.shots.length) {
        currentLevel.shots.push(s);
    } else {
        currentLevel.shots[currentLevel.firstEmptyShot] = s;
        while (currentLevel.firstEmptyShot < currentLevel.shots.length && currentLevel.shots[currentLevel.firstEmptyShot] != null) {
            currentLevel.firstEmptyShot++;
        }
    }
}

function update(ms) {
    totalMs += ms;
    msBuffer.push(ms);
    if (msBuffer.length > 10) {
        msBuffer.shift();
    }
    fps = Math.round(1000 / (msBuffer.reduce(function(a, b) { return a + b; }, 0.0) / msBuffer.length));
    
    var time = ms * FRAMERATE / 1000;

    if (victory || defeat) {
        if (keyDown(" ")) { setup(); }
        return;
    }
    
    if (keyDown("W")) { moveCreature(currentLevel.player, 0, -currentLevel.player.type.speed * time); }
    if (keyDown("A")) { moveCreature(currentLevel.player, -currentLevel.player.type.speed * time, 0); }
    if (keyDown("S")) { moveCreature(currentLevel.player, 0, currentLevel.player.type.speed * time); }
    if (keyDown("D")) { moveCreature(currentLevel.player, currentLevel.player.type.speed * time, 0); }
    
    if (keyDown("I")) { attack(currentLevel.player, NORTH); }
    if (keyDown("J")) { attack(currentLevel.player, WEST); }
    if (keyDown("K")) { attack(currentLevel.player, SOUTH); }
    if (keyDown("L")) { attack(currentLevel.player, EAST); }

    for (var i = 1; i <= 9; i++) {
        if (keyDown("" + i) && i <= currentLevel.player.spells.length) {
            currentLevel.player.spell = currentLevel.player.spells[i - 1];
        }
    }

    if (keyDown(" ")) { cast(currentLevel.player); }
    
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

    for (var i = 0; i < currentLevel.shots.length; i++) {
        var s = currentLevel.shots[i];
        if (s == null) { continue; }
        s.life -= ms;
        s.x += Math.cos(s.direction) * s.type.speed;
        s.y += Math.sin(s.direction) * s.type.speed;
        if (doDamage(s.shooter, s.x, s.y, s.type.xSize, s.type.ySize, s.type.dmg)) {
            s.life = 0;
        }
        if (blocksShotAt(s.x, s.y) || blocksShotAt(s.x + s.type.xSize, s.y) || blocksShotAt(s.x, s.y + s.type.ySize) || blocksShotAt(s.x + s.type.xSize, s.y + s.type.ySize)) {
            s.life = 0;
        }
        if (s.life <= 0) {
            currentLevel.firstEmptyShot = Math.min(currentLevel.firstEmptyShot, i);
            currentLevel.shots[i] = null;
        }
    }
    
    currentLevel.monsters = currentLevel.monsters.filter(function(m) { return tickCreature(m, ms); });
    
    if (!tickCreature(currentLevel.player, ms)) { defeat = true; }
}

