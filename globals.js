
var stage = new PIXI.Stage(0x8b9191, true);
var world = new PIXI.DisplayObjectContainer();
world.position.x = 0;
world.position.y = 0;

var gui = new PIXI.DisplayObjectContainer();
stage.addChild(world);
stage.addChild(gui);
var renderer = PIXI.autoDetectRenderer(innerWidth, innerHeight);
//var renderer = new PIXI.CanvasRenderer(innerWidth, innerHeight);
document.body.appendChild(renderer.view);

var players = [];
var enemies = [];
var items = [];

stats = new Stats();

document.body.appendChild( stats.domElement );
stats.domElement.style.position = "fixed";
stats.domElement.style.top = "0px";
stats.domElement.style.right = "0px";

function sign(n) {
  if(n < 0) return -1;
  return 1;
}

function hit(arr, x, y, range, dmg) {
  
  for(var i = 0; i < arr.length; ++i) {
    var dx = arr[i].position.x - x;
    var dy = arr[i].position.y - y;
    var d = Math.sqrt(dx*dx + dy*dy);
    if(d < range) {
      dmg = Math.max(0, dmg - arr[i].armor);
      arr[i].life -= dmg;
      arr[i].bloodEmitter.emit('once');
      setTimeout(function() {
        var sound = new Audio('sounds/hit0.mp3');
        sound.volume = .5;
        sound.play();
      }, 100 + Math.round(Math.random() * 100));
      if(arr[i].life < 0) {
              
        arr[i].bloodEmitter.rate.numPan.a = 30;
        arr[i].bloodEmitter.rate.numPan.b = 40;
        arr[i].bloodEmitter.emit('once');
        world.removeChild(arr[i]);
        arr.splice(i, 1);
        --i;
      } else if(arr[i].heartText) {
        arr[i].heartText.setText(arr[i].life + '/' + arr[i].maxLife);
      }
    }
  }
}
