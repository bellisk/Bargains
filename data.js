const FRAMERATE = 60;
const SPF = 1.0 / FRAMERATE;
const NORTH = 0;
const SOUTH = 1;
const EAST  = 2;
const WEST  = 3;

function randint(from, to) {
    return from + Math.floor(Math.random() * (to - from - 0.0000000001));
}

function randitem(l) {
    return l[randint(0, l.length)];
}

function dirDx(dir) {
    if (dir == EAST) { return 1; }
    if (dir == WEST) { return -1; }
    return 0;
}

function dirDy(dir) {
    if (dir == SOUTH) { return 1; }
    if (dir == NORTH) { return -1; }
    return 0;
}

var tileTypes = {};
tileTypes.stoneFloor = {
    name: "stoneFloor",
    letter: "-",
    frames: [[0, 0]],
    animCycle: 1000,
    blocksWalk: false,
    blocksSight: false,
    blocksShot: false
};

tileTypes.stoneWall = {
    name: "stoneWall",
    letter: "W",
    frames: [[1, 0]],
    animCycle: 1000,
    blocksWalk: true,
    blocksSight: true,
    blocksShot: true
};

tileTypes.brazier = {
    name: "brazier",
    letter: "B",
    frames: [[4, 2], [5, 2]],
    animCycle: 300,
    blocksWalk: true,
    blocksSight: false,
    blocksShot: false
};

tileTypes.emptyBrazier = {
    name: "emptyBrazier",
    letter: "b",
    frames: [[3, 2]],
    animCycle: 1000,
    blocksWalk: true,
    blocksSight: false,
    blocksShot: false
};

tileTypes.stairsDown = {
    name: "stairsDown",
    letter: "<",
    frames: [[0, 4]],
    animCycle: 1000,
    blocksWalk: false,
    blocksSight: false,
    blocksShot: false,
    onCreatureIntersect: function(t, c, l) {
        if (c == l.player) { victory = true; }
    }
};

tileTypes.treasureChest = {
    name: "treasureChest",
    letter: "C",
    frames: [[0, 5]],
    animCycle: 1000,
    blocksWalk: false,
    blocksSight: false,
    blocksShot: false,
    onCreatureIntersect: function(t, c, l) {
    
    }
};

tileTypes.openTreasureChest = {
    name: "openTreasureChest",
    letter: "c",
    frames: [[1, 5]],
    animCycle: 1000,
    blocksWalk: false,
    blocksSight: false,
    blocksShot: false
};

tileTypes.horizBars = {
    name: "horizBars",
    letter: "=",
    frames: [[2, 5]],
    animCycle: 1000,
    blocksWalk: true,
    blocksSight: false,
    blocksShot: true
};

tileTypes.vertBars = {
    name: "vertBars",
    letter: "|",
    frames: [[3, 5]],
    animCycle: 1000,
    blocksWalk: true,
    blocksSight: false,
    blocksShot: true
};

tileTypes.trapdoor = {
    name: "trapdoor",
    letter: "T",
    frames: [[0, 0]],
    animCycle: 1000,
    blocksWalk: false,
    blocksSight: false,
    blocksShot: false,
    onCreatureIntersect: function(t, c, l) {
    }
};

tileTypes.openTrapdoor = {
    name: "openTrapdoor",
    letter: "t",
    frames: [[4, 5]],
    animCycle: 1000,
    blocksWalk: false,
    blocksSight: false,
    blocksShot: false
};

tileTypes.torch = {
    name: "torch",
    letter: "!",
    frames: [[6, 5], [7, 5]],
    animCycle: 300,
    blocksWalk: true,
    blocksSight: true,
    blocksShot: true
};

tileTypes.extinguishedTorch = {
    name: "extinguishedTorch",
    letter: ".",
    frames: [[5, 5]],
    animCycle: 1000,
    blocksWalk: true,
    blocksSight: true,
    blocksShot: true
};

tileTypes.basin = {
    name: "basin",
    letter: "U",
    frames: [[8, 5]],
    animCycle: 1000,
    blocksWalk: true,
    blocksSight: false,
    blocksShot: false
};

tileTypes.emptyBasin = {
    name: "emptyBasin",
    letter: "u",
    frames: [[3, 2]],
    animCycle: 1000,
    blocksWalk: true,
    blocksSight: false,
    blocksShot: false
};

tileTypes.pit = {
    name: "pit",
    letter: "_",
    frames: [[9, 5]],
    animCycle: 1000,
    blocksWalk: true,
    blocksSight: false,
    blocksShot: false
};

tileTypes.eyelessOne = {
    name: "eyelessOne",
    letter: "E",
    frames: [[10, 5]],
    animCycle: 1000,
    blocksWalk: false,
    blocksSight: true,
    blocksShot: true,
    onCreatureIntersect: function(t, c, l) {
    }
};

tileTypes.usedEyelessOne = {
    name: "usedEyelessOne",
    letter: "e",
    frames: [[11, 5]],
    animCycle: 1000,
    blocksWalk: false,
    blocksSight: true,
    blocksShot: true
};

var letterToTileType = {};

for (var key in tileTypes) {
    letterToTileType[tileTypes[key].letter] = tileTypes[key];
}

var creatureTypes = {};

creatureTypes.player = {
    name: "player",
    speed: 4 * SPF,
    image: function(c) {
        if (c.attackTime > 0) { return [7 + c.attackDirection, 0]; }
        return [3 + c.direction, 0];
    },
    tick: function(c, l, ms) {},
    attackTime: 150,
    reload: 250,
    xSize: 0.4375,
    ySize: 0.5,
    hp: 10
};

creatureTypes.floobler = {
    name: "floobler",
    speed: 2 * SPF,
    image: function(c) {
        if (c.attackTime > 0) { return [2 + c.attackDirection, 1]; }
        return [1, 1];
    },
    tick: function(c, l, ms) {
        var pDistSq = (c.x + 0.5 * c.type.xSize - (l.player.x + l.player.type.xSize)) * (c.x + 0.5 * c.type.xSize - (l.player.x + l.player.type.xSize)) + (c.y + 0.5 * c.type.ySize - (l.player.y + l.player.type.ySize)) * (c.y + 0.5 * c.type.ySize - (l.player.y + l.player.type.ySize));
        var visionDist = 4;
        var attackDist = 1;
        var minDist = 0.35;
        if (pDistSq < visionDist * visionDist) {
            var dx = l.player.x + 0.5 * l.player.type.xSize - (c.x + 0.5 * c.type.xSize);
            var dy = l.player.y + 0.5 * l.player.type.ySize - (c.y + 0.5 * c.type.ySize);
            var dxMove = Math.abs(dx) < minDist ? 0 : (dx > 0 ? 1 : -1);
            var dyMove = Math.abs(dy) < minDist ? 0 : (dy > 0 ? 1 : -1);
            moveCreature(c, this.speed * dxMove, this.speed * dyMove);
            if (pDistSq < attackDist * attackDist) {
                var attackDir = 0;
                if (Math.abs(dx) < Math.abs(dy)) {
                    attackDir = dx > 0 ? EAST : WEST;
                } else {
                    attackDir = dy > 0 ? SOUTH : NORTH;
                }
                attack(c, attackDir);
            }
        } else {
            if (!c.wanderDirection || dieRoll(500)) {
                c.wanderDirection = randint(0, 4);
            }
            moveCreature(c, this.speed * dirDx(c.wanderDirection), this.speed * dirDy(c.wanderDirection));
        }
    },
    attackTime: 300,
    reload: 300,
    xSize: 0.875,
    ySize: 0.875,
    hp: 5
};

var particleTypes = {};

particleTypes.blood = {
  name: "blood",
  life: 300,
  frames: [[0, 2]],
  animCycle: 1000,
  xSize: .375,
  ySize: .375
};

particleTypes.death = {
  name: "death",
  life: 300,
  frames: [[1, 2]],
  animCycle: 1000,
  xSize: 0.625,
  ySize: 0.625
};


var shotTypes = {};

shotTypes.fireball = {
    name: "fireball",
    life: 1300,
    speed: 6 * SPF,
    dmg: 2,
    frames: [[0, 3], [1, 3]],
    animCycle: 100,
    xSize: .4375,
    ySize: .375
};

var spellTypes = {};

spellTypes.shootFire = {
    name: "shootFire",
    displayName: "Shoot Fire",
    cast: function(c, l) {
        var bx = -1;
        var by = -1;
        var minDistSq = 10000;
        for (var y = 0; y < l.map.length; y++) {
            for (var x = 0; x < l.map[y].length; x++) {
                if (l.map[y][x].type != tileTypes.brazier) { continue; }
                var bDistSq = (x + 0.5 - (c.x + 0.5 * c.type.xSize)) * (x + 0.5 - (c.x + 0.5 * c.type.xSize)) + (y + 0.5 - (c.y + 0.5 * c.type.ySize)) * (y + 0.5 - (c.y + 0.5 * c.type.ySize));
                if (bDistSq < minDistSq) {
                    minDistSq = bDistSq;
                    bx = x;
                    by = y;
                }
            }
        }
        if (bx != -1 && minDistSq <= 4 * 4) {
            addShot(shotTypes.fireball, c.x + 0.5 * c.type.xSize - 0.5 * shotTypes.fireball.xSize, c.y + 0.5 * c.type.ySize - 0.5 * shotTypes.fireball.ySize, Math.atan2(c.y + 0.5 * c.type.ySize - (by + 0.5), c.x + 0.5 * c.type.xSize - (bx + 0.5)), c);
        }
    }
};

spellTypes.explodeBrazier = {
    name: "explodeBrazier",
    displayName: "Explode Brazier",
    cast: function(c, l) {
        var bx = -1;
        var by = -1;
        var minDistSq = 10000;
        for (var y = 0; y < l.map.length; y++) {
            for (var x = 0; x < l.map[y].length; x++) {
                if (l.map[y][x].type != tileTypes.brazier) { continue; }
                var bDistSq = (x + 0.5 - (c.x + 0.5 * c.type.xSize)) * (x + 0.5 - (c.x + 0.5 * c.type.xSize)) + (y + 0.5 - (c.y + 0.5 * c.type.ySize)) * (y + 0.5 - (c.y + 0.5 * c.type.ySize));
                if (bDistSq < minDistSq) {
                    minDistSq = bDistSq;
                    bx = x;
                    by = y;
                }
            }
        }
        if (bx != -1 && minDistSq <= 4 * 4) {
            for (var i = 0; i < 16; i++) {
                var dir = Math.PI * i * 2 / 16;
                addShot(shotTypes.fireball, bx + 0.5 - shotTypes.fireball.xSize * 0.5 + Math.cos(dir), by + 0.5 - shotTypes.fireball.ySize * 0.5 + Math.sin(dir), dir, c);
                
            }
            l.map[by][bx].type = tileTypes.emptyBrazier;
        }
    }
};
