function updateCamera() {
  if(players.length) {
    var players_x = 0;
    var players_y = 0;
    for(var i = 0; i < players.length; ++i) {
      players_x += players[i].position.x;
      players_y += players[i].position.y;
    }
    players_x /= players.length;
    players_y /= players.length;
    var scale = 1;
    for(var i = 0; i < players.length; ++i) {
      scale = Math.min(scale, (innerWidth/2) / (Math.abs(players_x - players[i].position.x) + 300));
      scale = Math.min(scale, (innerHeight/2) / (Math.abs(players_y - players[i].position.y) + 300));
    }
    world.scale.x += (scale - world.scale.x) * 0.1;
    world.scale.y += (scale - world.scale.y) * 0.1;
    world.position.x += (innerWidth/2 - players_x * scale - world.position.x) * 0.05;
    world.position.y += (innerHeight/2 - players_y * scale - world.position.y) * 0.05;
  }
}