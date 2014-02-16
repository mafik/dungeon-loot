
proton = new Proton();


(function() {
    function transformSprite(particleSprite, particle) {
      particleSprite.position.x = particle.p.x;
      particleSprite.position.y = particle.p.y;
      particleSprite.scale.x = particle.scale;
      particleSprite.scale.y = particle.scale;
      particleSprite.anchor.x = 0.5;
      particleSprite.anchor.y = 0.5;
      particleSprite.alpha = particle.alpha;
      particleSprite.rotation = particle.rotation*Math.PI/180;
    }
    var renderer = new Proton.Renderer('other', proton);
    
    renderer.onProtonUpdate = function() {
    
    };
    
    renderer.onParticleCreated = function(particle) {
        particle.sprite = new PIXI.Sprite(particle.target);
        world.addChild(particle.sprite);
    };
    
    renderer.onParticleUpdate = function(particle) {
        transformSprite(particle.sprite, particle);
    };
    
    renderer.onParticleDead = function(particle) {
        world.removeChild(particle.sprite);
    };
    renderer.start();

})();
