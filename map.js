
var map;
var filled;
var doors = [];

function makeDungeon() {
    ROT.RNG.setSeed(+new Date);
    map = new ROT.Map.Digger(40, 40);
    filled = {};
    for(var i = 0; i < 40; ++i) {
        filled[i] = {};
    }
    var free = {};
    for(var i = 0; i < 40; ++i) {
        free[i] = {};
    }
    map.create(function(x, y, state) {
        filled[x][y] = !!state;
        free[x][y] = !state;
    });
    
    function makeTopWall(left, right, top) {
        var start = left;
        for(var j = left; j <= right; ++j) {
            if(!filled[j][top-1]) {
                if(start < j) {
                    var wall = new Wall(j - start);
                    wall.position.y = top * 80;
                    wall.position.x = start * 80;
                    world.addChild(wall);
                }
                start = j + 1;
            }
        }
        if(start < j) {
            var wall = new Wall(j - start);
            wall.position.y = top * 80;
            wall.position.x = start * 80;
            world.addChild(wall);
        }
    }
    
    function makeBottomWall(left, right, bottom) {
        var start = left;
        for(var j = left; j <= right; ++j) {
            if(!filled[j][bottom+1]) {
                if(start < j) {
                    var wall = new Wall(j - start);
                    wall.position.y = (bottom + 1) * 80;
                    wall.position.x = start * 80;
                    wall.alpha = .7;
                    world.addChild(wall);
                }
                start = j + 1;
            }
        }
        if(start < j) {
            var wall = new Wall(j - start);
            wall.position.y = (bottom + 1) * 80;
            wall.position.x = start * 80;
            wall.alpha = .7;
            world.addChild(wall);
        }
    }
    
    function fillRoom(top, right, bottom, left) {
        makeTopWall(left, right, top);
        makeBottomWall(left, right, bottom);
        
        var floor = new Floor(right - left + 1, bottom - top + 1);
        floor.position.y = top * 80;
        floor.position.x = left * 80;
        world.addChild(floor);
        for(var i = left; i <= right; ++i) {
            for(var j = top; j <= bottom; ++j) {
                free[i][j] = false;
            }
        }
        
    }
    
    var corridors = map.getCorridors();
    
    for(var i = 0; i < corridors.length; ++i) {
        var corridor = corridors[i];
        
        var top = Math.min(corridor._startY, corridor._endY);
        var bottom = Math.max(corridor._startY, corridor._endY);
        var left = Math.min(corridor._startX, corridor._endX);
        var right = Math.max(corridor._startX, corridor._endX);
        
        fillRoom(top, right, bottom, left);
        
    }
    
    
    function makeDoor(x, y) {
        var tile = new Door();
        tile.position.x = 80 * x;
        tile.position.y = 80 * y;
        world.addChild(tile);
        if(free[x][y]) {
            fillRoom(y, x, y, x);
        }
        doors.push(tile);
        filled[x][y] = true;
    }
    
    var rooms = map.getRooms();
    for (var i=0; i<rooms.length; i++) {
        var room = rooms[i];
        var top = room.getTop();
        var left = room.getLeft();
        var right = room.getRight();
        var bottom = room.getBottom();
        var width = right - left;
        var height = bottom - top;
        
        fillRoom(top, right, bottom, left);
        
        if(i == 0) {
            continue;
        }
        for(var j = 0; j < 2; ++j) {
            var bat = new Bat();
            bat.position.x = (left + Math.random() * width) * 80;
            bat.position.y = (top + Math.random() * height) * 80;
            world.addChild(bat);
            enemies.push(bat);
        }
            
            var item = randomItem(3);
            item.position.x = (left + Math.random() * width) * 80;
            item.position.y = (top + Math.random() * height) * 80;
            items.push(item);
            world.addChild(item);
    }
    
    for (var i=0; i<rooms.length; i++) {
        rooms[i].getDoors(makeDoor);
    }

}
