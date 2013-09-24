function generateMap() {
    var form = fillForm(chooseForm("level"));
    var currentLevel = {
        map: [],
        monsters: [],
        particles: [null],
        firstEmptyParticle: 0,
        shots: [null],
        firstEmptyShot: 0
    };
    currentLevel.map = form.map(function(line) {
        return line.map(function(cell) {
            if (!letterToTileType[cell]) {
                console.log(cell);
            }
            return { type: letterToTileType[cell] };
        });
    });
    for (var y = 0; y < currentLevel.map.length; y++) {
        for (var x = 0; x < currentLevel.map[y].length; x++) {
            currentLevel.map[y][x].x = x;
            currentLevel.map[y][x].y = y;
        }
    }
    return currentLevel;
}

function chooseForm(tag) {
    return randitem(mapForms.filter(function(f) {
        return f.tags.indexOf(tag) != -1;
    }));
}

function convertForm(f) {
    return f.grid.split(/\r?\n/).map(function(line) {
        return line.split("");
    });
}

function insertForm(src, target, tx, ty) {
    for (var y = 0; y < src.length; y++) { for (var x = 0; x < src[y].length; x++) {
        if (src[y][x] != " ") {
            target[ty + y][tx + x] = src[y][x];
        }
    }}
}

function fillForm(f) {
    var cf = convertForm(f);
    if (!f.subs) { return cf; }
    for (var i = 0; i < f.subs.length; i++) {
        var subForm = chooseForm(f.subs[i]);
        for (var y = 0; y < cf.length; y++) { for (var x = 0; x < cf[y].length; x++) {
            if (cf[y][x] == i) {
                insertForm(fillForm(subForm), cf, x, y);
            }
        }}
    }
    return cf;
}

var mapForms = [];

mapForms.push({
    tags: ["central", "pillar"],
    grid: "B"
});

mapForms.push({
    tags: ["central", "pillar"],
    grid: "U"
});

mapForms.push({
    tags: ["central"],
    grid: "E"
});

mapForms.push({
    tags: ["central"],
    grid: "C"
});

mapForms.push({
    tags: ["central", "maybeTrap", "maybeDoor"],
    grid: "T"
});

mapForms.push({
    tags: ["pillar", "corner", "h", "v", "maybeDoor"],
    grid: "W"
});

mapForms.push({
    tags: ["pillar"],
    grid: "!"
});

mapForms.push({
    tags: ["maybeTrap", "maybeDoor"],
    grid: "-"
});

mapForms.push({
    tags: ["h"],
    grid: "="
});

mapForms.push({
    tags: ["v"],
    grid: "|"
});

mapForms.push({
    tags: ["pillar", "h", "v"],
    grid: "_"
});

mapForms.push({
    tags: ["3x3"],
    subs: ["central"],
    grid: "\
---\n\
-0-\n\
---"
});

mapForms.push({
    tags: ["3x3"],
    subs: ["central"],
    grid: "\
---\n\
B0B\n\
---"
});

mapForms.push({
    tags: ["3x3"],
    subs: ["central"],
    grid: "\
B-B\n\
-0-\n\
B-B"
});

mapForms.push({
    tags: ["3x3"],
    subs: ["central", "maybeTrap", "maybeTrap"],
    grid: "\
-2-\n\
B0B\n\
-1-"
});

mapForms.push({
    tags: ["3x3"],
    grid: "\
___\n\
___\n\
___"
});

mapForms.push({
    tags: ["3x3"],
    subs: ["central", "maybeTrap"],
    grid: "\
___\n\
_01\n\
___"
});

mapForms.push({
    tags: ["9x9"],
    subs: ["pillar"],
    grid:"\
---------\n\
-0-----0-\n\
---------\n\
-0-----0-\n\
---------\n\
-0-----0-\n\
---------\n\
-0-----0-\n\
---------"
});

mapForms.push({
    tags: ["9x9"],
    subs: ["3x3"],
    grid:"\
---------\n\
-WW!-!WW-\n\
-W-----W-\n\
-W-0---W-\n\
---------\n\
-W-----W-\n\
-W-----W-\n\
-WW!-!WW-\n\
---------"
});

mapForms.push({
    tags: ["9x9"],
    grid:"\
---------\n\
---------\n\
---------\n\
---------\n\
---------\n\
---------\n\
---------\n\
---------\n\
---------"
});

mapForms.push({
    tags: ["9x9"],
    subs: ["maybeTrap", "maybeTrap", "3x3"],
    grid:"\
---------\n\
-_0_____-\n\
-_-----_-\n\
-_-2---_-\n\
-_-----_-\n\
-_-----_-\n\
-_-----_-\n\
-_____1_-\n\
---------"
});

mapForms.push({
    tags: ["9x9"],
    subs: ["corner", "v", "h"],
    grid:"\
---------\n\
-0-----0-\n\
-1-----1-\n\
20-----02\n\
---020---\n\
20-----02\n\
-1-----1-\n\
-0-----0-\n\
---------"
});

mapForms.push({
    tags: ["9x9"],
    subs: ["pillar", "maybeTrap", "maybeTrap", "maybeTrap", "maybeTrap"],
    grid:"\
-0---12--\n\
-0-0000--\n\
-0----0--\n\
-0000-03-\n\
--4---0--\n\
---0000--\n\
-000----0\n\
---0000-0\n\
--------0"
});

mapForms.push({
    tags: ["9x9"],
    subs: ["corner", "3x3", "pillar", "h", "v"],
    grid:"\
---------\n\
-03330_--\n\
-41--4_--\n\
-4---4_--\n\
-4-------\n\
-03330---\n\
----2----\n\
--2---2--\n\
---------"
});

mapForms.push({
    tags: ["9x9"],
    subs: ["3x3", "3x3", "3x3", "3x3", "central"],
    grid:"\
---------\n\
-0---1---\n\
---------\n\
---------\n\
----4----\n\
-2---3---\n\
---------\n\
---------\n\
---------"
});

mapForms.push({
    tags: ["level"],
    subs: ["9x9", "9x9", "9x9", "9x9", "9x9", "9x9", "9x9", "pillar", "3x3", "maybeDoor"],
    grid: "\
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW\n\
W---------W4WWWWWWWWW5WWWWWWWWW\n\
W---------WWWWWWWWWWWWWWWWWWWWW\n\
W---------WWWWWWWWWWWWWWWWWWWWW\n\
W---------WWWWWWWWWWWWWWWWWWWWW\n\
W---------WWWWWWWWWW-WWWWWWWWWW\n\
W---------WWWWWWWWWWWWWWWWWWWWW\n\
W---------WWWWWWWWWWWWWWWWWWWWW\n\
W---------WWWWWWWWWWWWWWWWWWWWW\n\
W---------WWWWWWWWWWWWWWWWWWWWW\n\
WWWWW-WWWWWWWWW-WWWWWWWWW-WWWWW\n\
W0WWWWWWWWW3WWWWWWWWW6WWWWWWWWW\n\
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW\n\
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW\n\
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW\n\
WWWWWWWWWWWWWWWWWWWW9WWWWWWWWWW\n\
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW\n\
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW\n\
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW\n\
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW\n\
WWWWW-WWWWWWWWW-WWWWWWWWW-WWWWW\n\
W1WWWWWWWWW2WWWWWWWWW---------W\n\
WWWWWWWWWWWWWWWWWWWWW---------W\n\
WWWWWWWWWWWWWWWWWWWWW---------W\n\
WWWWWWWWWWWWWWWWWWWWW---------W\n\
WWWWWWWWWW-WWWWWWWWWW--7-<-7--W\n\
WWWWWWWWWWWWWWWWWWWWW---------W\n\
WWWWWWWWWWWWWWWWWWWWW--8------W\n\
WWWWWWWWWWWWWWWWWWWWW---------W\n\
WWWWWWWWWWWWWWWWWWWWW---------W\n\
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
});
