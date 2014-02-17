
function Character() {
  PIXI.DisplayObjectContainer.call(this);
  this.shadow = PIXI.Sprite.fromImage('sprites/shadow.png');
  this.shadow.anchor.y = this.shadow.anchor.x = .5;
  this.addChild(this.shadow);
  
  this.actions = {};
  this.activeAction = 'default';
  
  this.experience = 0;
  
  this.life = this.maxLife;
  
  this.velocity = { x: 0, y: 0 };
  this.direction = { x: 0, y: 0 };
  
  
  
  
  var emitter = new Proton.BehaviourEmitter();
  this.bloodEmitter = emitter;
  emitter.rate = new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(0, .1));
  //emitter.addInitialize(new Proton.Mass(1));
  var texture2 = PIXI.Texture.fromImage('sprites/blood.png');
  emitter.addInitialize(new Proton.ImageTarget(texture2));
  emitter.addInitialize(new Proton.Life(.5, 1));
  this.bloodVelocity = new Proton.Velocity(new Proton.Span(1, 4), new Proton.Span(0, 45, true), 'polar');
  emitter.addInitialize(this.bloodVelocity);
  
  emitter.addBehaviour(new Proton.Gravity(8));
  emitter.addBehaviour(new Proton.Scale(new Proton.Span(.4, .8), 0));
  emitter.p.x = 0;
  emitter.p.y = 0;
  proton.addEmitter(emitter);
  
}

Character.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Character.prototype.constructor = Character;

Object.defineProperty(Character.prototype, 'level', {
  get: function() {
    return Math.floor(Math.sqrt(this.experience / 10)) + 1
  }
});

Object.defineProperty(Character.prototype, 'armor', {
  get: function() {
    var v = this.level - 1;
    if(this.slots) {
      for(var i = 0; i < this.slots.children.length; ++i) {
        var item = this.slots.children[i].item;
        if(item && item.stats) {
          v += item.stats.armor;
        }
      }
    }
    return v;
  }
});

Object.defineProperty(Character.prototype, 'speed', {
  get: function() {
    var v = this.level + 1;
    if(this.slots) {
      for(var i = 0; i < this.slots.children.length; ++i) {
        var item = this.slots.children[i].item;
        if(item && item.stats) {
          v += item.stats.speed;
        }
      }
    }
    return v;
  }
});

Object.defineProperty(Character.prototype, 'damage', {
  get: function() {
    var v = this.level * 2 + 3;
    if(this.slots) {
      for(var i = 0; i < this.slots.children.length; ++i) {
        var item = this.slots.children[i].item;
        if(item && item.stats) {
          v += item.stats.damage;
        }
      }
    }
    return v;
  }
});

Object.defineProperty(Character.prototype, 'maxLife', {
  get: function() {
    var v = 50 + this.level * 10;
    if(this.slots) {
      for(var i = 0; i < this.slots.children.length; ++i) {
        var item = this.slots.children[i].item;
        if(item && item.stats) {
          v += item.stats.life;
        }
      }
    }
    return v;
  }
});

Character.prototype.addAction = function(name, textures) {
  name = name || 'default';
  if(textures.length == 1) {
    this.actions[name] = new PIXI.Sprite(textures[0]);
  } else {
    this.actions[name] = new PIXI.MovieClip(textures);
    this.actions[name].animationSpeed = .1;
    this.actions[name].play();
  }
  this.actions[name].anchor.x = .5;
  this.actions[name].anchor.y = .5;
  this.actions[name].visible = this.activeAction == name;
  this.addChild(this.actions[name]);
};

Character.prototype.setAction = function(name) {
  this.actions[this.activeAction].visible = false;
  this.activeAction = name;
  this.actions[this.activeAction].visible = true;
};

Character.prototype.logic = function() {
  
};

Character.prototype.update = function() {

  this.direction.x = 0;
  this.direction.y = 0;
  
  this.logic();
  
  var p = this.position;
  var v = this.velocity;
  var t = function(x) { return Math.floor(x/80); };
  var tileY = function() { return Math.floor(p.y/80); };
  var taken = function(x, y) { return filled[x] && filled[x][y]; };
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  var w = 31;
  var h = 8;
  if(taken(t(p.x + sign(v.x) * w), t(p.y))) {
      var bound = (t(p.x) + (v.x > 0))*80 - sign(v.x)*w;
      p.x = 2*bound - this.position.x;
      v.x = -v.x/2;
  }
  if(taken(t(p.x), t(p.y + sign(v.y) * h))) {
      var bound = (t(p.y) + (v.y > 0))*80 - sign(v.y)*h;
      p.y = 2*bound - this.position.y;
      v.y = -v.y/2;
  }
  
  this.bloodEmitter.p.x = this.position.x;
  this.bloodEmitter.p.y = this.position.y;
  /*
  if(sX != eX) {
      if(filled[eX] && filled[eX][eY]) {
          var bound = sX + (eX > sX);
      }
  }
  if(sY != eY) {
      if(filled[eX] && filled[eX][eY]) {
          var bound = sY + (eY > sY);
          this.position.y = 2*bound*80 - this.position.y;
          this.velocity.y = 0;
      }
  }
  */
  
  var a = Math.PI;
  if(this.direction.x != 0 || this.direction.y != 0) {
    a = Math.atan2(this.direction.y, this.direction.x);
  } else if(this.velocity.x != 0 || this.velocity.y != 0) {
    a = Math.atan2(this.velocity.y, this.velocity.x);
  }
  
  this.look(a);
  
};

Character.prototype.look = function(a) {
  if(Math.cos(a) > 0) {
    this.scale.x = 1;
  } else {
    this.scale.x = -1;
  }
};

function Human() {
  Character.call(this);
  var body = this.body = PIXI.Sprite.fromImage('sprites/body.png');
  var body1 = this.body1 = PIXI.Sprite.fromImage('sprites/body_run1.png');
  var body2 = this.body2 = PIXI.Sprite.fromImage('sprites/body_run2.png');
  body.anchor.y = body1.anchor.y = body2.anchor.y = 1;
  body.anchor.x = body1.anchor.x = body2.anchor.x = .5;
  body1.visible = body2.visible = false;
  this.addChild(body);
  this.addChild(body1);
  this.addChild(body2);
  
  var leftArm = this.leftArm = new PIXI.DisplayObjectContainer();
  leftArm.position.y = -60;
  leftArm.position.x = -15;
  this.addChild(leftArm);
  
  var larm = this.larm = PIXI.Sprite.fromImage('sprites/arm.png');
  larm.anchor.x = 30/35;
  larm.anchor.y = 5/35;
  leftArm.addChild(larm);
  
  var rightArm = this.rightArm = new PIXI.DisplayObjectContainer();
  rightArm.position.y = -60;
  rightArm.position.x = 15;
  this.addChild(rightArm);
  
  var rarm = this.rarm = PIXI.Sprite.fromImage('sprites/arm.png');
  rarm.anchor.x = 30/35;
  rarm.anchor.y = 5/35;
  rarm.scale.x = -1;
  rightArm.addChild(rarm);
  
  
  var bodyItem = this.bodyItem = new PIXI.DisplayObjectContainer();
  bodyItem.position.y = 0
  this.addChild(bodyItem);
  
  var head = this.head = new PIXI.DisplayObjectContainer();
  head.position.y = -80;
  this.addChild(head);
  
  var face = this.face = PIXI.Sprite.fromImage('sprites/head.png');
  face.anchor.x = .5;
  face.anchor.y = .5;
  head.addChild(face);
  
  var headItem = this.headItem = new PIXI.DisplayObjectContainer();
  head.addChild(headItem);
  
  var leftItem = this.leftItem = new PIXI.DisplayObjectContainer();
  leftItem.position.x = -25;
  leftItem.position.y = 25;
  leftArm.addChild(leftItem);
  
  var rightItem = this.rightItem = new PIXI.DisplayObjectContainer();
  rightItem.position.x = 25;
  rightItem.position.y = 25;
  rightItem.rotation = Math.PI;
  rightArm.addChild(rightItem);
  
  
  var skinFilter = this.skinFilter = new PIXI.ColorMatrixFilter();
  larm.filters = rarm.filters = face.filters = body1.filters = body2.filters = body.filters = [skinFilter];
  skinFilter.matrix[0] = 0.8 + Math.random()/2;
  skinFilter.matrix[5] = 0.7 + Math.random()/2;
  skinFilter.matrix[10] = 0.5 + Math.random()/2;
  
  var eye = PIXI.Texture.fromImage('sprites/eye.png');
  var leye = this.leye = new PIXI.Sprite(eye);
  leye.anchor.x = .5;
  leye.anchor.y = .5;
  leye.position.x = -12;
  head.addChild(leye);
  
  var reye = this.reye = new PIXI.Sprite(eye);
  reye.anchor.x = .5;
  reye.anchor.y = .5;
  reye.position.x = 12;
  head.addChild(reye);
  
  
  var emitter = new Proton.BehaviourEmitter();
  this.smokeEmitter = emitter;
  this.smokeActive = false;
  emitter.rate = new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(0, .1));
  //emitter.addInitialize(new Proton.Mass(1));
  var texture2 = PIXI.Texture.fromImage('sprites/steam.png');
  emitter.addInitialize(new Proton.ImageTarget(texture2));
  emitter.addInitialize(new Proton.Life(2, 3));
  this.smokeVelocity = new Proton.Velocity(new Proton.Span(1, 4), new Proton.Span(0, 45, true), 'polar');
  emitter.addInitialize(this.smokeVelocity);
  
  //emitter.addBehaviour(new Proton.Gravity(8));
  emitter.addBehaviour(new Proton.Scale(new Proton.Span(.4, .8), 0.1));
  emitter.addBehaviour(new Proton.Alpha(.5, 0.));
  emitter.addBehaviour(new Proton.Rotate(0, Proton.getSpan(-8, 9), 'add'));
  emitter.p.x = 0;
  emitter.p.y = 0;
  proton.addEmitter(emitter);
}

Human.prototype = Object.create(Character.prototype);
Human.prototype.constructor = Human;

Human.prototype.stepPose = 0;
Human.prototype.step = function() {
  var sound = new Audio('sounds/step' + Math.floor(Math.random() * 8) + '.mp3');
  sound.volume = .2;
  sound.play();
  this.body.visible = false;
  this.smokeEmitter.createParticle();
  if(this.stepPose == 1) {
    this.stepPose = 0;
    this.body1.visible = true;
    this.body2.visible = false;
  } else {
    this.stepPose = 1;
    this.body1.visible = false;
    this.body2.visible = true;
  }
  
}

Human.prototype.setAction = function(name) {
  if(name == 'walk') {
    if(!this.stepInterval) {
      this.step();
      this.stepInterval = setInterval(this.step.bind(this), 400);
    }
  } else {
    this.body.visible = true;
    this.body1.visible = this.body2.visible = false;
    if(this.stepInterval) {
      clearInterval(this.stepInterval);
      delete this.stepInterval;
    }
  }
};

Human.prototype.equip = function(slot, item) {
  if(typeof slot === 'string') {
    for(var i = 0; i < this.slots.children.length; ++i) {
      if(this.slots.children[i].id == slot) {
        slot = this.slots.children[i];
        break;
      }
    }
  }
  if(slot.item)
    delete slot.item.slot;
  slot.item = item;
  slot.item.slot = slot;
  
  var sprite = cloneItem(item);
  sprite.position.x = item.off_x || 0;
  sprite.position.y = item.off_y || 0;
  while(this[slot.id + 'Item'].children.length) {
    this[slot.id + 'Item'].removeChild(this[slot.id + 'Item'].children[0]);
  }
  if(!(slot.item instanceof NoItem)) {
    this[slot.id + 'Item'].addChild(sprite);
  }
  
};

Human.prototype.look = function(a) {
  var last_a = typeof this.last_a === 'undefined' ? a : this.last_a;
  if(a < last_a - Math.PI) last_a -= Math.PI*2;
  if(a > last_a + Math.PI) last_a += Math.PI*2;
  last_a += (a - last_a) * 0.1;
  this.last_a = last_a;
  
  if(Math.cos(a) > 0) {
    this.body.scale.x = this.body1.scale.x = this.body2.scale.x = 1;
  } else {
    this.body.scale.x = this.body1.scale.x = this.body2.scale.x = -1;
  }
  this.head.position.x = Math.cos(this.last_a) * 5;
  this.head.position.y = -70 + Math.sin(this.last_a) * 3;
  
  this.leye.position.x = Math.cos(this.last_a - Math.PI/4) * 17;
  this.leye.position.y = Math.sin(this.last_a - Math.PI/4) * 17 - 8;
  
  this.reye.position.x = Math.cos(this.last_a + Math.PI/4) * 17;
  this.reye.position.y = Math.sin(this.last_a + Math.PI/4) * 17 - 8;
};

function Player() {
  Human.call(this);
  this.menuActive = false;
  this.position.x = map.getRooms()[0].getLeft() * 80 + 80;
  this.position.y = map.getRooms()[0].getTop() * 80 + 80;
  
  var characterSheet = this.characterSheet = new PIXI.DisplayObjectContainer();
  characterSheet.alpha = 0;
  characterSheet.position = this.position;
  world.addChild(characterSheet);
  
  function makeSlot(text) {
      var slot = new PIXI.Sprite.fromImage('sprites/tile.jpg');
      text = new PIXI.Text(text, { fill: '#666', font: '20pt "Penguin Attack"' });
      text.rotation = Math.PI/2;
      text.position.y = 48 + 5;
      text.position.x = 24;
      text.anchor.y = .5;
      slot.item = noItem;
      slot.addChild(text);
      return slot;
  }
  
  this.slots = new PIXI.DisplayObjectContainer();
  characterSheet.addChild(this.slots);
  
  this.items = new PIXI.DisplayObjectContainer();
  var noItem = new NoItem();
  this.items.addChild(noItem);
  characterSheet.addChild(this.items);
  
  for(var i = 0; i < slots.length; ++i) {
      var slot = makeSlot(slots[i].name);
      slot.type = slots[i].type;
      slot.id = slots[i].id;
      this.slots.addChild(slot);
  }
  
  var heart = this.heart = new PIXI.Sprite(this.heartTexture);
  heart.position.y = -80;
  heart.position.x = -23;
  heart.anchor.x = 1;
  heart.anchor.y = 1;
  this.addChild(heart);
  
  var heartText = this.heartText = new PIXI.Text('' + this.life + '/' + this.maxLife, { fill: '#800', font: '20pt "Penguin Attack"' });
  heartText.anchor.x = 0;
  heartText.anchor.y = 1;
  heartText.position.x = 5;
  heartText.position.y = 4;
  heart.addChild(heartText);
  
  var shield = new PIXI.Sprite(this.shieldTexture);
  shield.position.x = -23;
  shield.position.y = -110;
  shield.anchor.x = 1;
  shield.anchor.y = 1;
  characterSheet.addChild(shield);
  
  var shieldText = this.shieldText = new PIXI.Text('' + this.armor, { fill: '#2c93a0', font: '20pt "Penguin Attack"' });
  shieldText.anchor.x = 0;
  shieldText.anchor.y = 1;
  shieldText.position.x = 5;
  shieldText.position.y = 4;
  shield.addChild(shieldText);
  
  var sword = new PIXI.Sprite(this.swordTexture);
  sword.position.x = -23;
  sword.position.y = -140;
  sword.anchor.x = 1;
  sword.anchor.y = 1;
  characterSheet.addChild(sword);
  
  var swordText = this.swordText = new PIXI.Text('' + this.armor, { fill: '#42d01c', font: '20pt "Penguin Attack"' });
  swordText.anchor.x = 0;
  swordText.anchor.y = 1;
  swordText.position.x = 5;
  swordText.position.y = 4;
  sword.addChild(swordText);
  
  var speed = new PIXI.Sprite(this.speedTexture);
  speed.position.x = -23;
  speed.position.y = -170;
  speed.anchor.x = 1;
  speed.anchor.y = 1;
  characterSheet.addChild(speed);
  
  var speedText = this.speedText = new PIXI.Text('' + this.armor, { fill: '#5a2ca0', font: '20pt "Penguin Attack"' });
  speedText.anchor.x = 0;
  speedText.anchor.y = 1;
  speedText.position.x = 5;
  speedText.position.y = 4;
  speed.addChild(speedText);
  

  var player = this;
  //this.attack = new Slash(this);
  //this.special = new Smash(this);
  this.menu = new Action();
  
  this.menu.start = function() {
    var s = new Audio('sounds/menu_open.mp3');
    s.volume = .5;
    s.play();
    player.menuActive = true;
  };
  this.menu.end = function() {
    player.menuActive = false;
  }
  
  this.moveUp = new Action(this);
  this.moveUp.callback = function(b) { 
    if(!player.menuActive) player.direction.y -= +b;
  };
  this.moveUp.start = function() {
    if(player.menuActive) {
      new Audio('sounds/menu_tick.mp3').play();
      var slot = player.slots.children[0];
      var c = player.items.children;
      
      var others = [];
      var visible = [];
      
      while(c.length) {
        var item = c.shift();
        if(slot.item == item) { // item from the slot should be nowhere
        
        } else if(item instanceof NoItem) { // NoItem is visible
          visible.push(item);
        } else if(item.slot) { // items with slots of tha same type shold be in others
          others.push(item);
        } else if(item.type == slot.type) {
          visible.push(item);
        } else {
          others.push(item);
        }
      }
      
      c = player.items.children = others.concat(slot.item, visible);
      
      player.equip(slot, c[c.length-1]);
    }
  };
  this.moveDown = new Action();
  this.moveDown.callback = function(b) {
    if(!player.menuActive) player.direction.y += +b;
  };
  this.moveDown.start = function() {
    if(player.menuActive) {
      new Audio('sounds/menu_tick.mp3').play();
      var slot = player.slots.children[0];
      var c = player.items.children;
      
      var others = [];
      var visible = [];
      
      while(c.length) {
        var item = c.shift();
        if(slot.item == item) { // item from the slot should be nowhere
        
        } else if(item instanceof NoItem) { // NoItem is visible
          visible.push(item);
        } else if(item.slot) { // items with slots of tha same type shold be in others
          others.push(item);
        } else if(item.type == slot.type) {
          visible.push(item);
        } else {
          others.push(item);
        }
      }
      
      c = player.items.children = others.concat(visible, slot.item);
      
      player.equip(slot, visible.length ? visible[0] : c[c.length-1]);
    }
  };
  this.moveLeft = new Action();
  this.moveLeft.callback = function(b) { 
    if(!player.menuActive) player.direction.x -= +b;
  };
  this.moveLeft.start = function() {
    if(player.menuActive) player.slots.children.unshift(player.slots.children.pop());
  };
  
  this.moveRight = new Action();
  this.moveRight.callback = function(b) {
    if(!player.menuActive) player.direction.x += +b;
  };
  this.moveRight.start = function() {
    if(player.menuActive) player.slots.children.push(player.slots.children.shift());
  };
  
  
  
  this.attack = new Action();
  this.attack.start = function() {
    if(player.leftItem.children.length) {
      var sprite = player.leftItem.children[0];
      var container = player.leftArm;
      var item = sprite.original;
      if(item.start)
        return item.start(player, container, sprite);
    }
  };
  
  this.attackUp = new Action();
  this.attackRight = new Action();
  this.attackDown = new Action();
  this.attackLeft = new Action();
  /*
  this.attackLeft.start = function() {
    if(player.leftItem.children.length) {
      var sprite = player.leftItem.children[0];
      var container = player.leftArm;
      var item = sprite.original;
      if(item.start)
        return item.start(player, container, sprite);
    }
  };
  */

  // starting equipment

  var shirt = new Shirt('Clothes');
  this.items.addChild(shirt);
  this.equip('body', shirt);
  
  var hood = new Hood('Hood');
  this.items.addChild(hood);
  this.equip('head', hood);
  
  var sword = new Sword('Old sword');
  this.items.addChild(sword);
  this.equip('left', sword);


}

Player.prototype = Object.create(Human.prototype);
Player.prototype.constructor = Player;

Player.prototype.heartTexture = PIXI.Texture.fromImage('sprites/heart.png');
Player.prototype.shieldTexture = PIXI.Texture.fromImage('sprites/shield.png');
Player.prototype.swordTexture = PIXI.Texture.fromImage('sprites/stat_attack.png');
Player.prototype.speedTexture = PIXI.Texture.fromImage('sprites/speed.png');


Player.prototype.isItemVisible = function(item) {
  if(item instanceof NoItem) return true;
  if(item.slot) return false;
  return item.type == this.slots.children[0].type;
}

Player.prototype.update = function() {
  
  this.attack.setPressed(this.attackUp.pressed || this.attackRight.pressed || this.attackDown.pressed || this.attackLeft.pressed);
  var dx = this.velocity.x;
  var dy = this.velocity.y;
  Human.prototype.update.call(this);
  dx -= this.velocity.x;
  dy -= this.velocity.y;
  dx = Math.abs(dx);
  dy = Math.abs(dy);
  var samp = Math.round(Math.sqrt(dx*dx+dy*dy) * 3);
  if(samp >= 1) {
    samp -= 1;
    if(samp < 0) samp = 0;
    if(samp > 9) samp = 9;
    var sound = new Audio('sounds/wallhit' + samp + '.mp3');
    sound.play();
  }
  var slot = this.slots.children[0];
  if(this.menuActive && slot.item.stats) {
    var mod = slot.item.stats;
    if(mod.armor) {
      this.shieldText.setText(this.armor + ' (' + mod.armor + ')');
    } else {
      this.shieldText.setText(this.armor);
    }
    if(mod.life) {
      this.heartText.setText(this.life + '/' + this.maxLife + ' (' + mod.life + ')');
    } else {
      this.heartText.setText(this.life + '/' + this.maxLife);
    }
    if(mod.damage) {
      this.swordText.setText(this.damage + ' (' + mod.damage + ')');
    } else {
      this.swordText.setText(this.damage);
    }
    if(mod.speed) {
      this.speedText.setText(Math.round(this.speed * 10) / 10 + ' (' + mod.speed + ')');
    } else {
      this.speedText.setText(Math.round(this.speed * 10) / 10);
    }
    
  } else if(this.menuActive) {
    //this.shieldText.setText(this.armor);
    //this.heartText.setText(this.life + '/' + this.maxLife);
    //this.swordText.setText(this.damage);
    //this.speedText.setText(Math.round(this.speed * 10) / 10);
  }
  for(var i = 0; i < this.slots.children.length; ++i) {
    var p = this.slots.children[i].position;
    p.x += ((1-i)*48 - p.x) * 0.1;
  }
  var cnt = 0;
  for(var i = 0; i < this.items.children.length; ++i) {
    var item = this.items.children[i];
    var p = item.position;
    if(slot.item == item) {
      p.y += (24 + slot.position.y - p.y) * 0.1;
      p.x += (24 + slot.position.x - p.x) * 0.1;
      item.text.alpha += (1 - item.text.alpha) * 0.1;
      //if(item instanceof NoItem) item.alpha += (0 - item.alpha) * 0.1;
      //else
      item.alpha += (1 - item.alpha) * 0.1;
    } /*else if(item instanceof NoItem) {
      p.y += (-cnt*48-24 - p.y) * 0.1;
      p.x += (72 - p.x) * 0.1;
      item.alpha += (1 - item.alpha) * 0.1;
      item.text.alpha += (1 - item.text.alpha) * 0.1;
      cnt += 1;
    } */else if(item.slot) {
      p.y += (24 + item.slot.position.y - p.y) * 0.1;
      p.x += (24 + item.slot.position.x - p.x) * 0.1;
      item.alpha += (1 - item.alpha) * 0.1;
      item.text.alpha += (0 - item.text.alpha) * 0.1;
    } else if(this.isItemVisible(item)) {
      p.y += (-cnt*48-24 - p.y) * 0.1;
      p.x += (72 - p.x) * 0.1;
      item.alpha += (1 - item.alpha) * 0.1;
      item.text.alpha += (1 - item.text.alpha) * 0.1;
      cnt += 1;
    } else {
      p.y += (24 - p.y) * 0.1;
      item.alpha += (0 - item.alpha) * 0.1;
      item.text.alpha += (0 - item.text.alpha) * 0.1;
    }
  }
  var p = this;
  var v;
  if(p.direction.x != 0 || p.direction.y != 0) {
    var alpha = Math.atan2(p.direction.y, p.direction.x);
    v = {
      x: Math.cos(alpha) * p.speed,
      y: Math.sin(alpha) * p.speed
    };
  } else {
    v = { x: 0, y: 0 };
  }
  var d = Math.sqrt((v.x - p.velocity.x)*(v.x - p.velocity.x) + (v.y - p.velocity.y)*(v.y - p.velocity.y));
  var l = Math.sqrt(p.velocity.x*p.velocity.x + p.velocity.y*p.velocity.y);
  p.velocity.x += (v.x - p.velocity.x) * 0.02;
  p.velocity.y += (v.y - p.velocity.y) * 0.02;
  //p.rotation = Math.atan2(p.velocity.y, p.velocity.x);
  
  p.smokeEmitter.p.x = p.position.x;
  p.smokeEmitter.p.y = p.position.y;
  
  p.smokeVelocity.thaPan.a = Math.atan2(-p.velocity.x,p.velocity.y) / Math.PI * 180;
  p.smokeVelocity.rPan.a = p.speed/16;
  p.smokeVelocity.rPan.b = l/8;
  p.smokeEmitter.rate.numPan.a = 1;
  p.smokeEmitter.rate.numPan.b = 1;
  p.smokeEmitter.rate.timePan.a = 1/l;
  p.smokeEmitter.rate.timePan.b = 1/l;
  
  if(l > 1 || d > 1) {
    p.setAction('walk');
  } else {
    p.setAction('default');
  }
  
  if(d > 2) {
    if(v.x != 0 || v.y != 0)
      p.smokeVelocity.thaPan.a = Math.atan2(-v.x,v.y) / Math.PI * 180;
    else
      p.smokeVelocity.thaPan.a = Math.atan2(p.velocity.x,-p.velocity.y) / Math.PI * 180;
    p.smokeVelocity.rPan.a = p.speed/4;
    p.smokeVelocity.rPan.b = p.speed/2;
    p.smokeEmitter.rate.numPan.a = 1;
    p.smokeEmitter.rate.numPan.b = 5;
    p.smokeEmitter.rate.timePan.a = .1;
    p.smokeEmitter.rate.timePan.b = .1;
    
  }
  
  if(d > 2) {
    if(!p.smokeActive) {
      new Audio('sounds/slide'+Math.floor(Math.random() * 10)+'.mp3').play();
      p.smokeEmitter.emit();
      p.smokeActive = true;
    }
  } else {
    if(p.smokeActive) {
      p.smokeEmitter.stopEmit();
      p.smokeActive = false;
    }
  }
  
  for(var i = 0; i < items.length; ++i) {
      var dx = this.position.x - items[i].position.x;
      var dy = (this.position.y - items[i].position.y) * 3;
      if(Math.sqrt(dx*dx + dy*dy) < 40) {
          items[i].position.y += sign(dy);
          items[i].position.x += sign(dx);
          dx = this.position.x - items[i].position.x;
          dy = (this.position.y - items[i].position.y) * 3;
          if(Math.sqrt(dx*dx + dy*dy) < 1) {
              var sound = new Audio('sounds/pickup.mp3');
              sound.volume = .5; 
              sound.play();
              items[i].position.y = 0;
              items[i].position.x = 0;
              var item = items[i];
              items.splice(i, 1);
              --i;
              world.removeChild(item);
              this.items.addChild(item);
          }
      }   
  }
  
  if(this.menuActive) {
    this.characterSheet.alpha += (1 - this.characterSheet.alpha) * .1;
  } else {
    this.characterSheet.alpha += (0 - this.characterSheet.alpha) * .1;
  }
};

Player.prototype.logic = function() {
  Human.prototype.logic.call(this);
  
  for(var name in this.controls) {
    var input = this.controls[name];
    if(input.type === 'keyboard') {
      var keyCode = input.keyCode;
      this[name].setPressed(keys[keyCode] && keys[keyCode].down);
    }
  }
};

function Bat() {
  Character.call(this);
  this.addAction(null, [this.texture1, this.texture2]);
  this.actions.default.anchor.y = 1;
  this.velocity.z = 0;
}

Bat.prototype = Object.create(Character.prototype);
Bat.prototype.constructor = Bat;

Bat.prototype.texture1 = PIXI.Texture.fromImage("sprites/bat.png");
Bat.prototype.texture2 = PIXI.Texture.fromImage("sprites/bat_fly.png");

Bat.prototype.update = function() {
  Character.prototype.update.call(this);
  this.bloodEmitter.p.y += this.actions.default.position.y;
}

Bat.prototype.logic = function() {
  this.velocity.x += Math.random() - .5;
  this.velocity.y += Math.random() - .5;
  this.velocity.z += Math.random() - .5;
  this.velocity.x *= .9;
  this.velocity.y *= .9;
  this.velocity.z *= .9;
  
  this.actions.default.position.y += this.velocity.z;
  this.actions.default.position.y += (-50 - this.actions.default.position.y) * 0.01;
};

Bat.prototype.look = function(a) {
};
