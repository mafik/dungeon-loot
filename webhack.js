/* TODO:

enemies attack players
items (particularly doors) have update function
move character sheet out of player
xp and level in character sheet
killing enemy gives xp
items can have icons
items are stacked behind the character
items can be dropped
multiple levels of dungeon
doors are locked and there are random keys
doors are thin
mouse support
joypad support

*/


requestAnimFrame( animate );

makeDungeon();

addPlayers();

function animate() {
  stats.begin();
  requestAnimFrame( animate );
  TWEEN.update();
  
  // Move players
  
  for(var i = 0; i < players.length; ++i) {
    players[i].update();
  }
  
  for(var i = 0; i < enemies.length; ++i) {
    enemies[i].update();
  }
  
  
  
  for(var i = 0; i < doors.length; ++i) {
    var door = doors[i];
    var open = false;
    for(var j = 0; j < players.length; ++j) {
      var player = players[j];
      var dx = Math.abs(player.position.x - door.position.x - 40);
      var dy = Math.abs(player.position.y - door.position.y - 40);
      if(Math.max(dx, dy) < 90) {
        open = true;
        break;
      }
    }
    if(open) {
      if(door.alpha != .2) {
        new Audio('sounds/open_door' + Math.floor(Math.random() * 3) + '.mp3').play();
        door.alpha = .2;
        filled[door.position.x / 80][door.position.y / 80] = false;
      }
    } else {
      if(door.alpha != 1) {
        
        new Audio('sounds/close_door' + Math.floor(Math.random() * 3) + '.mp3').play();
        door.alpha = 1;
        filled[door.position.x / 80][door.position.y / 80] = true;
      }
      
    }
  }
  
  // Move and zoom camera
  updateCamera();
  
  proton.update();
  
    
  world.children.sort(function(a, b) {
      if(a.constructor == Floor) return -1;
      if(b.constructor == Floor) return 1;
      if(a.position.y == b.position.y) {
        if(a.constructor == Wall) return -1;
        return 1;
      }
      return a.position.y - b.position.y;
  });

    
  renderer.render(stage);
  stats.end();
}




/* DONE:

layers for background & gui
camera
player movement using speed
movement particle effects
basic attack
basic secondary attack
character life mechanics
character gfx
character sheet
saving controls
random levels
faster map rendering
start inside map
better actions
higher walls
sort elements by depth
more live colors of character
larger doors
classes to tween between states
split into more files
faster control definitions
target in front of character
attack animation
bouncing off the walls
bottom walls
items can be equipped
equipped items are skipped in menu
items can be un-equipped
clean equipment management algorithm 
fix bug with empty equipment
character sheet is in the gui layer
more stats in character sheet
equipped items modify character stats
stat change is visible when switching items
equipped items are visible on character
up button behaves just like down
better looking around
items have names
better character
starting equipment - shirt, hood and sword
hood rotates with character
ikonka dla add player
using left / secondary attack === using specific item
floor & walls at doors
all characters have shadow
bats fly
doors open when going near
movement sounds
items are sorted during rendering
blood
better movement dust effects (without a gap when accelerating)
*/
