function generateMap() {
    var form = mapForms[randint(0, mapForms.length)];
    var currentLevel = {
        map: [],
        monsters: [],
        particles: [null],
        firstEmptyParticle: 0,
        shots: [null],
        firstEmptyShot: 0
    };
    currentLevel.map = form.grid.split(/\r?\n/).map(function(line) {
        return line.split("").map(function(cell) {
            return { type: letterToTileType[cell] };
        });
    });
    return currentLevel;
}

var mapForms = [];

mapForms.push({
    grid: "\
WWWWWWWWWW\n\
W--------W\n\
W--------W\n\
W--------W\n\
W--------W\n\
W---<----W\n\
W--------W\n\
W--------W\n\
W--------W\n\
WWWWWWWWWW"
});
