const FRAMERATE = 60;
const SPF = 1.0 / FRAMERATE;
const NORTH = 0;
const SOUTH = 1;
const EAST  = 2;
const WEST  = 3;

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
    frames: [[0, 0]],
    animCycle: 1000,
    wall: false
};

tileTypes.stoneWall = {
    name: "stoneWall",
    frames: [[1, 0]],
    animCycle: 1000,
    wall: true
};

tileTypes.brazier = {
    name: "brazier",
    frames: [[4, 2], [5, 2]],
    animCycle: 300,
    wall: true
};

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
    reload: 250
};

creatureTypes.floobler = {
    name: "floobler",
    speed: 2 * SPF,
    image: function(c) {
        if (c.attackTime > 0) { return [2 + c.attackDirection, 1]; }
        return [1, 1];
    },
    tick: function(c, l, ms) {
        var pDistSq = (c.x - l.player.x) * (c.x - l.player.x) + (c.y - l.player.y) * (c.y - l.player.y);
        var visionDist = 4;
        var attackDist = 1;
        var minDist = 0.2;
        if (pDistSq < visionDist * visionDist) {
            var dx = l.player.x - c.x;
            var dy = l.player.y - c.y;
            dx = Math.abs(dx) < minDist ? 0 : (dx > 0 ? 1 : -1);
            dy = Math.abs(dy) < minDist ? 0 : (dy > 0 ? 1 : -1);
            moveCreature(c, this.speed * dx, this.speed * dy);
            if (pDistSq < attackDist * attackDist) {
                var attackDir = 0;
                if (Math.abs(dx) > Math.abs(dy)) {
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
    reload: 300
};

