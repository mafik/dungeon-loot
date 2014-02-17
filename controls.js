
keys = {};
onkeydown = function(e) {
    if(keys[e.keyCode]) {
      keys[e.keyCode].down = true
      e.preventDefault();
      e.stopPropagation();
      return true;
    }
}

onkeyup = function(e) {
    if(keys[e.keyCode])
        keys[e.keyCode].down = false;
}

var fadeOut = function(obj) {
    return new Promise(function(resolve, reject) {
        new TWEEN.Tween( obj.position )
        .to( { alpha: 0 }, 400 )
        .easing( TWEEN.Easing.Back.In )
        .onUpdate( function () { obj.alpha = this.alpha; } )
        .onComplete(resolve)
        .start();
    });
};

var fadeIn = function(obj) {
    return new Promise(function(resolve, reject) {
        new TWEEN.Tween( obj.position )
        .to( { alpha: 1 }, 400 )
        .easing( TWEEN.Easing.Back.In )
        .onUpdate( function () { obj.alpha = this.alpha; } )
        .onComplete(resolve)
        .start();
    });
};

var hide = function(obj) {
    return new Promise(function(resolve, reject) {
        new TWEEN.Tween( obj.position )
        .to( { y: -100 }, 400 )
        .easing( TWEEN.Easing.Back.In )
        .onUpdate( function () { obj.position.y = Math.round(this.y); } )
        .onComplete(resolve)
        .start();
    });
};

function show(obj) {
    return new Promise(function(resolve, reject) {
        new TWEEN.Tween( obj.position )
        .to( { y: 10 }, 200 )
        .easing( TWEEN.Easing.Back.Out )
        .onUpdate( function () { obj.position.y = Math.round(this.y); } )
        .onComplete(resolve)
        .start();
    });
};

var controls = [
    { name: 'moveUp', prompt: 'Press up button' },
    { name: 'moveRight', prompt: 'Press right button' },
    { name: 'moveDown', prompt: 'Press down button' },
    { name: 'moveLeft', prompt: 'Press left button' },
    { name: 'attackUp', prompt: 'Press attack up' },
    { name: 'attackRight', prompt: 'Press attack right' },
    { name: 'attackDown', prompt: 'Press attack down' },
    { name: 'attackLeft', prompt: 'Press attack left' },
    { name: 'menu', prompt: 'Press menu button' }
];

var mouseControls = {
};

function addPlayers() {
    if(localStorage.players) {
      JSON.parse(localStorage.players).forEach(function(c) {
        var p = new Player();
        p.controls = c;
        for(var k in c) {
          var v = c[k];
          if(v.type == 'keyboard') {
            keys[v.keyCode] = { down: false };
          }
        }
        players.push(p);
        world.addChild(p);
      });
    }
}

var message = new PIXI.Text('DON\'T PANIC. This is just a prototype', { fill: '#000', font: '20pt "Penguin Attack"' });
message.position.x = Math.round(innerWidth/2);
message.position.y = 10;
message.anchor.y = 0;
message.anchor.x = .5;
gui.addChild(message);


var addPlayerBtn = PIXI.Sprite.fromImage('sprites/new_player.png');
addPlayerBtn.buttonMode = true;
addPlayerBtn.setInteractive(true);
addPlayerBtn.position.x = 10;
addPlayerBtn.position.y = 10;
addPlayerBtn.click = function addNewPlayer(mouseData) {
    var player = new Player();
    player.controls = {};
    var index = 0;
    
    fadeOut(addPlayerBtn);
    var promise = hide(message);
    
    /*
    var old_onclick = onclick;
    onclick = function bindMouse(e) {
        onkeydown = old_keydown;
        player.controls = mouseControls;
        index = controls.length;
        promise = hide(addPlayerBtn).then(next);
    }
    */
    
    var old_keydown = onkeydown;
    onkeydown = function bindKey(e) {
        onkeydown = old_keydown;
        var name = controls[index].name;
        player.controls[name] = { type: 'keyboard', keyCode: e.keyCode };

        keys[e.keyCode] = { down: true };
        index += 1;
        
        if(index < controls.length) {
            onkeydown = bindKey;
        } else {
            players.push(player);
            localStorage.players = JSON.stringify(players.map(function(p) { return p.controls; }));
            world.addChild(player);
        }
        promise = hide(message).then(next);
    };
    
    var next = function() {
        if(index >= controls.length) {
            
            fadeIn(addPlayerBtn);
            message.setText('DON\'T PANIC. This is just a prototype');
            return show(message);
        }
        message.setText(controls[index].prompt);
        return show(message);
    };
    
    promise = promise.then(next);
};
gui.addChild(addPlayerBtn);
