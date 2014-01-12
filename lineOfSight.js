function xIntersections(x0, y0, x1, y1) {
    var intersections = [];
    if (x0 < x1) {
        for (var x = Math.ceil(x0); x < x1; x++) {
            var y = y0 + ((x - x0) * 1.0 / (x1 - x0)) * (y1 - y0);
            intersections.push([x, y]);
        }
    } else {
        for (var x = Math.floor(x0); x > x1; x--) {
            var y = y0 + ((x0 - x) * 1.0 / (x0 - x1)) * (y1 - y0);
            intersections.push([x, y]);
        }        
    }
    return intersections;
}

function yIntersections(x0, y0, x1, y1) {
    return xIntersections(y0, x0, y1, x1).map(function (pt) {
        return [pt[1], pt[0]];
    });
}

function testIntersections() {
    console.log(xIntersections(0.5, 0.5, 3, -3));
    console.log(yIntersections(0.5, 0.5, 3, -3));
}

function isCornerLit(srcX, srcY, cornerX, cornerY, isSolid) {
    var xis = xIntersections(srcX, srcY, cornerX, cornerY);
    for (var i = 0; i < xis.length; i++) {
        if (isSolid(xis[i][0], Math.floor(xis[i][1])) || isSolid(xis[i][0] - 1, Math.floor(xis[i][1]))) {
            return false;
        }
    }
    var yis = yIntersections(srcX, srcY, cornerX, cornerY);
    for (var i = 0; i < yis.length; i++) {
        if (isSolid(Math.floor(yis[i][0]), yis[i][1]) || isSolid(Math.floor(yis[i][0]), yis[i][1] - 1)) {
            return false;
        }
    }
    return true;
}

function isLitFrom(srcX, srcY, tileX, tileY, isSolid) {
    return isCornerLit(srcX, srcY, tileX, tileY, isSolid) || isCornerLit(srcX, srcY, tileX + 1, tileY, isSolid) || isCornerLit(srcX, srcY, tileX, tileY + 1, isSolid) || isCornerLit(srcX, srcY, tileX + 1, tileY + 1, isSolid);
}

function isFullyLitFrom(srcX, srcY, tileX, tileY, isSolid) {
    var cornersLit = (isCornerLit(srcX, srcY, tileX, tileY, isSolid) ? 1 : 0) + (isCornerLit(srcX, srcY, tileX + 1, tileY, isSolid) ? 1 : 0) + (isCornerLit(srcX, srcY, tileX, tileY + 1, isSolid) ? 1 : 0) + (isCornerLit(srcX, srcY, tileX + 1, tileY + 1, isSolid) ? 1 : 0);
    return cornersLit >= 2;
}
