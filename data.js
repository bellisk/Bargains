const FRAMERATE = 60;
const SPF = 1.0 / FRAMERATE;
const NORTH = 0;
const SOUTH = 1;
const WEST  = 2;
const EAST  = 3;

var tileTypes = {};
tileTypes.stoneFloor = {
    name: "stoneFloor",
    sx: 0,
    sy: 0,
    wall: false
};

tileTypes.stoneWall = {
    name: "stoneWall",
    sx: 1,
    sy: 0,
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
    attackTime: 200,
    reload: 500
};

