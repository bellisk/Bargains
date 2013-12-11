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

function randdir() {
    return Math.random() * Math.PI * 2;
}

function randfloat(from, to) {
    return from + Math.random() * (to - from);
}

function dieRoll(d) {
    return Math.random() < 1.0 / d;
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
    blocksShot: false,
    tick: function(t, ms) {
        if (dieRoll(5)) {
            addParticle(particleTypes.fire, t.x + randfloat(0.2, 0.8), t.y + randfloat(0.2, 0.8));
        }
        if (dieRoll(120)) {
            addParticle(particleTypes.smoke, t.x + randfloat(0.2, 0.8), t.y + randfloat(0.2, 0.8));
        }
    }
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
        if (c != l.player) { return; }
        if (dieRoll(4)) {
            addParticle(particleTypes.fly, t.x + randfloat(0.3, 0.6), t.y + randfloat(0.3, 0.6));
        } else {
            t.item = getLoot(l.depth);
            for (var i = 0; i < 20; i++) {
                addParticle(particleTypes.loot, t.x + randfloat(0.2, 0.8), t.y + randfloat(0.3, 0.6));
            }
        }
        t.type = tileTypes.openTreasureChest;
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
        if (c == currentLevel.player) {
            currentLevel.map[t.y][t.x].type = tileTypes.openingTrapdoor;
            doDamage(null, t.x, t.y, 1, 1, {amount: 3, type: damageTypes.blunt});
        }
    },
    tick: function(t, ms) {
        if (dieRoll(240)) {
            addParticle(particleTypes.dust, t.x + 0.5, t.y + 0.5);
        }
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

tileTypes.openingTrapdoor = {
    name: "openingTrapdoor",
    letter: "`",
    frames: [[4, 5]],
    animCycle: 1000,
    blocksWalk: false,
    blocksSight: false,
    blocksShot: false,
    tick: function(t, ms) {
        if (creatureCorners(currentLevel.player).indexOf(t) == -1) {
            currentLevel.map[t.y][t.x].type = tileTypes.openTrapdoor;
        }
    }
};

tileTypes.torch = {
    name: "torch",
    letter: "!",
    frames: [[6, 5], [7, 5]],
    animCycle: 300,
    blocksWalk: true,
    blocksSight: true,
    blocksShot: true,
    tick: function(t, ms) {
        if (dieRoll(15)) {
            addParticle(particleTypes.fire, t.x + 0.5, t.y + 0.9);
        }
        if (dieRoll(360)) {
            addParticle(particleTypes.smoke, t.x + 0.5, t.y + 0.9);
        }
    }
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

tileTypes.usedEyelessOne = {
    name: "usedEyelessOne",
    letter: "e",
    frames: [[11, 5]],
    animCycle: 1000,
    blocksWalk: false,
    blocksSight: true,
    blocksShot: true
};

tileTypes.eyelessOne = {
    name: "eyelessOne",
    letter: "E",
    frames: [[10, 5]],
    animCycle: 1000,
    blocksWalk: false,
    blocksSight: true,
    blocksShot: true,
    turnsInto: tileTypes.usedEyelessOne,
    onCreatureIntersect: function(t, c, l) {
        if (c != currentLevel.player) { return; }
        if (c.bargainCooldown > 0) { return; }
        if (!t.gain) {
            var gains = bargainTypes.filter(function(b) { return b.gain && b.valid(); });
            var losses = bargainTypes.filter(function(b) { return !b.gain && b.valid(); });
            if (gains.length > 0 && losses.length > 0) {
                t.gain = randitem(gains);
                t.loss = randitem(losses);
            }
        }
        if (t.gain) {
            //t.gain.make();
            //t.loss.make();
            l.bargainDialogue = true;
            l.bargainTile = t;
        }
        //currentLevel.map[t.y][t.x].type = tileTypes.usedEyelessOne;
    }
};

var letterToTileType = {};

for (var key in tileTypes) {
    letterToTileType[tileTypes[key].letter] = tileTypes[key];
}

var bargainTypes = [];

bargainTypes.push({
    gain: false,
    desc: "Lose half your sight range",
    valid: function() {
        return currentLevel.player.type.visionRange >= 4;
    },
    make: function() {
        currentLevel.player.type.visionRange /= 2;
    }
});

bargainTypes.push({
    gain: false,
    desc: "Lose ability to detect trapdoors",
    valid: function() {
        return currentLevel.player.type.trapCheckRange > 0;
    },
    make: function() {
        currentLevel.player.type.trapCheckRange = 0;
    }
});

bargainTypes.push({
    gain: true,
    desc: "Learn Explode Brazier spell",
    valid: function() {
        return currentLevel.player.spells.indexOf(spellTypes.explodeBrazier) == -1;
    },
    make: function() {
        currentLevel.player.spells.push(spellTypes.explodeBrazier);
    }
});

bargainTypes.push({
    gain: true,
    desc: "Learn Shoot Fire spell",
    valid: function() {
        return currentLevel.player.spells.indexOf(spellTypes.shootFire) == -1;
    },
    make: function() {
        currentLevel.player.spells.push(spellTypes.shootFire);
    }
});

var damageTypes = {};

damageTypes.blunt = {
    name: "blunt",
    priority: 2
};

damageTypes.sharp = {
    name: "sharp",
    priority: 1
};

damageTypes.magic = {
    name: "magic",
    priority: 0
};

var itemSlots = ["weapon", "armour", "potion"];

var itemTypes = {};

itemTypes.club = {
    name: "club",
    slot: "weapon",
    frames: [[0, 8]],
    animCycle: 1000,
    damageType: damageTypes.blunt,
    damageBonus: 1,
    attackImages: [[11,0], [12, 0], [13, 0], [14, 0]],
    quality: 1,
    dropChance: 1
};

itemTypes.dagger = {
    name: "dagger",
    slot: "weapon",
    frames: [[1, 8]],
    animCycle: 1000,
    damageType: damageTypes.sharp,
    damageBonus: 1,
    attackImages: [[15,0], [16, 0], [17, 0], [18, 0]],
    quality: 2,
    dropChance: 1
};

itemTypes.wand = {
    name: "wand",
    slot: "weapon",
    frames: [[2, 8]],
    animCycle: 1000,
    damageType: damageTypes.magic,
    damageBonus: 1,
    attackImages: [[19,0], [20, 0], [21, 0], [22, 0]],
    quality: 3,
    dropChance: 1
};

itemTypes.hammer = {
    name: "hammer",
    slot: "weapon",
    frames: [[0, 7]],
    animCycle: 1000,
    damageType: damageTypes.blunt,
    damageBonus: 3,
    attackImages: [[23,0], [24, 0], [25, 0], [26, 0]],
    quality: 3,
    dropChance: 1
};

itemTypes.sword = {
    name: "sword",
    slot: "weapon",
    frames: [[1, 7]],
    animCycle: 1000,
    damageType: damageTypes.sharp,
    damageBonus: 3,
    attackImages: [[7, 1], [8, 1], [9, 1], [10, 1]],
    quality: 4,
    dropChance: 1
};

itemTypes.staff = {
    name: "staff",
    slot: "weapon",
    frames: [[2, 7]],
    animCycle: 1000,
    damageType: damageTypes.magic,
    damageBonus: 3,
    attackImages: [[11, 1], [12, 1], [13, 1], [14, 1]],
    quality: 5,
    dropChance: 1
};

var shapes = ["tabard", "armor"];

var materials = ["leather", "steel", "magic"];
var armourTypes = ["blunt", "sharp", "magic"];

for (var s = 0; s < shapes.length; s++) {
    for (var m = 0; m < materials.length; m++) {
        itemTypes[materials[m] + shapes[s]] = {
            name: materials[m] + " " + shapes[s],
            slot: "armour",
            frames: [[3 + m, 8 - s]],
            animCycle: 1000,
            armourType: damageTypes[armourTypes[m]],
            armourBonus: 1 + s,
            quality: 2 * s + m + 1,
            dropChance: 1
        };
    }
}

itemTypes.healingPotion = {
    name: "healing potion",
    slot: "potion",
    frames: [[2, 9]],
    animCycle: 1000,
    effect: function(c) {
        c.hp = Math.min(c.hp + 4, c.type.hp);
        for (var i = 0; i < 8; i++) {
            addParticle(particleTypes.healing, c.x + c.type.xSize * 0.5, c.y + c.type.ySize * 0.5);
        }
    },
    quality: 1,
    dropChance: 6
};

itemTypes.speedPotion = {
    name: "speed potion",
    slot: "potion",
    frames: [[3, 9]],
    animCycle: 1000,
    effect: function(c) {
        c.speedDuration += 60000;
    },
    quality: 1,
    dropChance: 2
};

itemTypes.invisibilityPotion = {
    name: "invisibility potion",
    slot: "potion",
    frames: [[5, 9]],
    animCycle: 1000,
    effect: function(c) {
        c.invisibilityDuration += 60000;
        for (var i = 0; i < 8; i++) {
            addParticle(particleTypes.invisibility, c.x + c.type.xSize * 0.5, c.y + c.type.ySize * 0.5);
        }
    },
    quality: 3,
    dropChance: 1
};

itemTypes.firePotion = {
    name: "fire potion",
    slot: "potion",
    frames: [[1, 9]],
    animCycle: 1000,
    effect: function(c) {
        c.fireDuration += 60000;
    },
    quality: 2,
    dropChance: 2
};

itemTypes.shieldingPotion = {
    name: "shielding potion",
    slot: "potion",
    frames: [[0, 9]],
    animCycle: 1000,
    effect: function(c) {
        c.shieldDuration += 60000;
    },
    quality: 4,
    dropChance: 1
};

function getLoot(maxQuality) {
    var available = [];
    for (var k in itemTypes) {
        if (itemTypes[k].quality <= maxQuality) {
            for (var i = 0; i < itemTypes[k].dropChance; i++) {
                available.push(itemTypes[k]);
            }
        }
    }
    return {type: randitem(available)};
}

function getFrame(frames, ms, period) {
    var i = Math.floor(ms / period) % frames.length;
    return frames[i];
}

var creatureTypes = {};

function resetPlayerType() {
    creatureTypes.player = {
        name: "player",
        speed: 4 * SPF,
        image: function(c, ms) {
            var imgs = [];
            if (c.attackTime > 0) { 
                if (c.inventory.weapon) {
                    imgs.push(c.inventory.weapon.type.attackImages[c.attackDirection]);
                } else {
                    imgs.push([7 + c.attackDirection, 0]);
                }
            } else {
                imgs.push([3 + c.direction, 0]);
            }
            if (c.shieldDuration > 0) {
                imgs.push(getFrame([[6, 3], [7, 3]], ms, 150));
            }
            if (c.fireDuration > 0) {
                imgs.push(getFrame([[4, 3], [5, 3]], ms, 300));
            }
            return imgs;
        },
        tick: function(c, l, ms) {
            if (c.standingStill >= c.nextTrapCheck && c.type.trapCheckRange > 0) {
                c.nextTrapCheck += c.type.trapCheckInterval;
                c.direction = randint(0, 4);
                var r = c.type.trapCheckRange;
                for (var dy = -r; dy <= r; dy++) {
                    var y = Math.floor(c.y + dy);
                    if (y < 0 || y >= currentLevel.map.length) { continue; }
                    for (var dx = -r; dx < r; dx++) {
                        var x = Math.floor(c.x + dx);
                        if (x < 0 || x >= currentLevel.map[y].length) { continue; }
                        if (tileAt(x, y).type == tileTypes.trapdoor && Math.random() < c.type.trapFindChance) {
                            currentLevel.map[y][x].type = tileTypes.openingTrapdoor;
                        }
                    }
                }
            }
            c.bargainCooldown = Math.max(0, c.bargainCooldown - ms);
            c.pickupCooldown = Math.max(0, c.pickupCooldown - ms);
            c.quaffCooldown = Math.max(0, c.quaffCooldown - ms);
            c.speedDuration = Math.max(0, c.speedDuration - ms);
            c.invisibilityDuration = Math.max(0, c.invisibilityDuration - ms);
            c.fireDuration = Math.max(0, c.fireDuration - ms);
            c.shieldDuration = Math.max(0, c.shieldDuration - ms);
            if (c.invisibilityDuration > 0) {
                addParticle(particleTypes.invisibility, c.x + c.type.xSize * 0.5, c.y + c.type.ySize * 0.5);
            }
        },
        attackTime: 150,
        reload: 250,
        xSize: 0.4375,
        ySize: 0.5,
        hp: 10,
        damageType: damageTypes.blunt,
        damage: 1,
        armourType: damageTypes.blunt,
        armour: 0,
        visionRange: 8,
        trapCheckDelay: 1100,
        trapCheckRange: 4,
        trapFindChance: 0.2,
        trapCheckInterval: 1100
    };
}

resetPlayerType();

creatureTypes.floobler = {
    name: "floobler",
    speed: 2 * SPF,
    image: function(c) {
        if (c.attackTime > 0) { return [[2 + c.attackDirection, 1]]; }
        return [[1, 1]];
    },
    tick: function(c, l, ms) {
        var pDistSq = (c.x + 0.5 * c.type.xSize - (l.player.x + l.player.type.xSize)) * (c.x + 0.5 * c.type.xSize - (l.player.x + l.player.type.xSize)) + (c.y + 0.5 * c.type.ySize - (l.player.y + l.player.type.ySize)) * (c.y + 0.5 * c.type.ySize - (l.player.y + l.player.type.ySize));
        var visionDist = c.type.visionRange;
        var attackDist = 1;
        var minDist = 0.35;
        if (pDistSq < visionDist * visionDist && l.player.invisibilityDuration <= 0) {
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
    visionRange: 4,
    attackTime: 300,
    reload: 300,
    xSize: 0.875,
    ySize: 0.875,
    hp: 5,
    damageType: damageTypes.blunt,
    damage: 1,
    armourType: damageTypes.blunt,
    armour: 0,
};

var particleTypes = {};

particleTypes.blood = {
    name: "blood",
    lifeRange: [300, 400],
    frames: [[0, 2]],
    animCycle: 1000,
    xSize: .375,
    ySize: .375,
    horSpeedRange: [0, 0],
    verSpeedRange: [0, 0],
    z: 0.5,
    g: 0
};

particleTypes.death = {
    name: "death",
    lifeRange: [300, 400],
    frames: [[1, 2]],
    animCycle: 1000,
    xSize: 0.625,
    ySize: 0.625,
    horSpeedRange: [0, 0],
    verSpeedRange: [0, 0],
    z: 0.5,
    g: 0
};

particleTypes.bloodSpritz = {
    name: "blood spritz",
    lifeRange: [200, 700],
    colour: "#FF0000",
    xSize: 0.125,
    ySize: 0.125,
    horSpeedRange: [0.5 * SPF, 1.5 * SPF],
    verSpeedRange: [-0.5 * SPF, 1 * SPF],
    z: 0.35,
    g: -0.1 * SPF
};

particleTypes.spell = {
    name: "spell",
    lifeRange: [100, 1000],
    colour: "#C996FF",
    xSize: 0.125,
    ySize: 0.125,
    horSpeedRange: [1 * SPF, 3 * SPF],
    verSpeedRange: [2 * SPF, 2 * SPF],
    z: 0.8,
    g: 0
};

particleTypes.healing = {
    name: "healing",
    lifeRange: [100, 1000],
    colour: "#5FFF5F",
    xSize: 0.125,
    ySize: 0.125,
    horSpeedRange: [1 * SPF, 3 * SPF],
    verSpeedRange: [2 * SPF, 2 * SPF],
    z: 0.8,
    g: 0
};

particleTypes.invisibility = {
    name: "invisibility",
    lifeRange: [100, 1000],
    colour: "#b7b7b7",
    xSize: 0.125,
    ySize: 0.125,
    horSpeedRange: [1 * SPF, 3 * SPF],
    verSpeedRange: [2 * SPF, 2 * SPF],
    z: 0.8,
    g: 0
};

particleTypes.dust = {
    name: "dust",
    lifeRange: [200, 500],
    colour: "#6b6863",
    xSize: 0.125,
    ySize: 0.125,
    horSpeedRange: [0, 0],
    verSpeedRange: [0.3 * SPF, 0.5 * SPF],
    z: 0,
    g: 0.001 * SPF
};

particleTypes.blockBlunt = {
    name: "block blunt",
    lifeRange: [300, 600],
    colour: "#8e6954",
    xSize: 0.125,
    ySize: 0.125,
    horSpeedRange: [1 * SPF, 2.5 * SPF],
    verSpeedRange: [-0.5 * SPF, 0.5 * SPF],
    z: 0.35,
    g: -0.1 * SPF
};

damageTypes.blunt.blockParticle = particleTypes.blockBlunt;

particleTypes.blockSharp = {
    name: "block sharp",
    lifeRange: [300, 600],
    colour: "#a4a4ae",
    xSize: 0.125,
    ySize: 0.125,
    horSpeedRange: [1 * SPF, 2.5 * SPF],
    verSpeedRange: [-0.5 * SPF, 0.5 * SPF],
    z: 0.35,
    g: -0.1 * SPF
};

damageTypes.sharp.blockParticle = particleTypes.blockSharp;

particleTypes.blockMagic = {
    name: "block magic",
    lifeRange: [300, 600],
    colour: "#c996ff",
    xSize: 0.125,
    ySize: 0.125,
    horSpeedRange: [1 * SPF, 2.5 * SPF],
    verSpeedRange: [-0.5 * SPF, 0.5 * SPF],
    z: 0.35,
    g: -0.1 * SPF
};

damageTypes.magic.blockParticle = particleTypes.blockMagic;

particleTypes.fire = {
    name: "fire",
    lifeRange: [200, 1200],
    colour: "#fcc100",
    xSize: 0.125,
    ySize: 0.125,
    horSpeedRange: [0, 0.2 * SPF],
    verSpeedRange: [0, 1 * SPF],
    z: 0.5,
    g: 0.1 * SPF
};

particleTypes.fireballFire = {
    name: "fire",
    lifeRange: [200, 1200],
    colour: "#fcc100",
    xSize: 0.125,
    ySize: 0.125,
    horSpeedRange: [0, 3 * SPF],
    verSpeedRange: [-1 * SPF, 1 * SPF],
    z: 0.3,
    g: 0.1 * SPF
};

particleTypes.smoke = {
    name: "smoke",
    lifeRange: [600, 2400],
    colour: "#666666",
    xSize: 0.25,
    ySize: 0.25,
    horSpeedRange: [0, 0.2 * SPF],
    verSpeedRange: [0, 1 * SPF],
    z: 0.8,
    g: 0.05 * SPF
};

particleTypes.loot = {
    name: "loot",
    lifeRange: [600, 1200],
    colour: "#ededc6",
    xSize: 0.125,
    ySize: 0.125,
    horSpeedRange: [0, 0],
    verSpeedRange: [8 * SPF, 12 * SPF],
    z: 0.8,
    g: 0
};

particleTypes.fly = {
    name: "fly",
    lifeRange: [1200, 3600],
    colour: "#000000",
    xSize: 0.125,
    ySize: 0.125,
    horSpeedRange: [0, 0.2 * SPF],
    verSpeedRange: [0.2 * SPF, 0.4 * SPF],
    z: 0.8,
    g: 0
};

var shotTypes = {};

shotTypes.fireball = {
    name: "fireball",
    life: 1300,
    speed: 6 * SPF,
    dmg: {amount: 2, type: damageTypes.magic},
    frames: [[0, 3], [1, 3]],
    animCycle: 100,
    xSize: .4375,
    ySize: .375,
    tick: function(s, l, ms) {
        if (dieRoll(5)) {
            addParticle(particleTypes.fireballFire, s.x + s.type.xSize * 0.5, s.y + s.type.ySize * 0.5);
        }
    }
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
                if (l.map[y][x].type != tileTypes.brazier && l.map[y][x].type != tileTypes.torch) { continue; }
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
            if (l.map[by][bx].type == tileTypes.torch) {
              l.map[by][bx].type = tileTypes.extinguishedTorch;
            }
        }
    }
};

spellTypes.explodeBrazier = {
    name: "explodeBrazier",
    displayName: "Explode Brazier",
    cast: function(c, l) {
        if (c.fireDuration > 0) {
            for (var i = 0; i < 16; i++) {
                var dir = Math.PI * i * 2 / 16;
                addShot(shotTypes.fireball, c.x + 0.5 * c.type.xSize - shotTypes.fireball.xSize * 0.5 + 1.5 * Math.cos(dir), c.y + 0.5 * c.type.ySize - shotTypes.fireball.ySize * 0.5 + 1.5 * Math.sin(dir), dir, c);
            }
            c.fireDuration = 0;
        } else {
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
    }
};
