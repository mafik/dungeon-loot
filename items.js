
function Floor(tilesWidth, tilesHeight) {
  PIXI.TilingSprite.call(this, this.texture, tilesWidth * 80, tilesHeight * 80);
}
Floor.prototype = Object.create(PIXI.TilingSprite.prototype);
Floor.prototype.constructor = Floor;
Floor.prototype.texture = PIXI.Texture.fromImage('sprites/floor.png');

function Wall(tilesWidth) {
  PIXI.TilingSprite.call(this, this.texture, tilesWidth * 80, 40);
  this.anchor.y = 1;
}
Wall.prototype = Object.create(PIXI.TilingSprite.prototype);
Wall.prototype.constructor = Wall;
Wall.prototype.texture = PIXI.Texture.fromImage('sprites/wall.png');

function Door() {
  PIXI.Sprite.call(this, this.texture);
  this.anchor.y = 40/120;
}
Door.prototype = Object.create(PIXI.Sprite.prototype);
Door.prototype.constructor = Door;
Door.prototype.texture = PIXI.Texture.fromImage('sprites/door.png');

Action.prototype.start = function() {};
Action.prototype.sustain = function() {};
Action.prototype.end = function() {};

function Smash(player) {
  Action.call(this, player);
}
Smash.prototype = Object.create(Action.prototype);
Smash.prototype.constructor = Smash;
Smash.prototype.texture = PIXI.Texture.fromImage("sprites/smash.png");
Smash.prototype.start = function() {
  this.power = 1;
}
Smash.prototype.sustain = function() {
  this.power += 0.1;
  this.power *= 0.99;
};
Smash.prototype.end = function() {
  var player = this.player;
  var sprite = new PIXI.Sprite(this.texture);
  sprite.anchor.x = .5;
  sprite.anchor.y = .5;
  sprite.scale.x = .5;
  sprite.scale.y = .5;
  sprite.position.x = player.position.x + Math.cos(player.rotation) * 100;
  sprite.position.y = player.position.y + Math.sin(player.rotation) * 100;
  world.addChild(sprite);
  
  new TWEEN.Tween( { s: 0.5, a: 1 } )
    .to( { s: this.power, a: 0 }, 200 * this.power )
    .easing( TWEEN.Easing.Circular.Out )
    .onUpdate( function () { 
      player.rightArm.rotation = - this.a * Math.PI * 2;
      sprite.scale.x = this.s;
      sprite.scale.y = this.s;
      sprite.alpha = this.a;
    } )
    .onComplete(function() {world.removeChild(sprite) })
    .start();
  
  var dmg = player.damage;
  dmg *= this.power;
  hit(enemies, sprite.position.x, sprite.position.y, 32 * this.power, dmg);
};

function Action() {}

var stats = ['life', 'armor', 'damage', 'speed'];

var types = ['hand', 'head', 'body'];

var slots = [
  { name: 'Left hand', type: 'hand', id: 'left' },
  { name: 'Right hand', type: 'hand', id: 'right' },
  { name: 'Head', type: 'head', id: 'head' },
  { name: 'Body', type: 'body', id: 'body' },
];

function Item(texture, name, type, anchorX, anchorY) {
  PIXI.DisplayObjectContainer.call(this);
  if(texture) {
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.x = typeof anchorX === 'undefined' ? .5 : anchorX;
    this.sprite.anchor.y = typeof anchorY === 'undefined' ? .5 : anchorY;
    this.addChild(this.sprite);
  }
  this.name = name;
  this.type = type;
  this.text = new PIXI.Text(name || '???', { fill: '#444', font: '20pt "Penguin Attack"' })
  this.text.alpha = 0;
  this.text.anchor.y = .5;
  this.text.position.x = 28;
  this.addChild(this.text);
}

Item.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Item.prototype.constructor = Item;

Action.prototype.setPressed = Item.prototype.setPressed = function(pressed) {
  if(this.callback) this.callback(!!pressed);
  if(this.sustain && this.pressed && pressed)  this.sustain();
  if(this.end && this.pressed && !pressed) this.end();
  if(this.start && !this.pressed && pressed) this.start();
  this.pressed = !!pressed;
};


function Shirt(name) {
  Item.call(this, this.texture, name, 'body');
  this.off_y = -43;
}

Shirt.prototype = Object.create(Item.prototype);
Shirt.prototype.constructor = Shirt;
Shirt.prototype.texture = PIXI.Texture.fromImage('sprites/shirt.png');

function Hood(name) {
  Item.call(this, null, name, 'head');
  
  var t = this.texture = PIXI.Sprite.fromImage('sprites/hood.png');
  t.anchor.x = .5;
  t.anchor.y = .5;
  this.addChild(t);
}
Hood.prototype = Object.create(Item.prototype);
Hood.prototype.constructor = Hood;

Hood.prototype.look = function(a) {
  a = (a + 2*Math.PI) % (2*Math.PI);
  if((a >= 3*Math.PI/8) && (a < 5*Math.PI/8)) {
    this.tex1.visible = true;
    this.tex2.visible = this.tex3.visible = this.tex4.visible = false;
  } else if((a >= Math.PI/8) && (a < 3*Math.PI/8)) {
    this.tex2.visible = true;
    this.tex2.scale.x = 1;
    this.tex4.visible = this.tex3.visible = this.tex1.visible = false;
  } else if((a >= Math.PI/8*15) || (a < Math.PI/8)) {
    this.tex3.visible = true;
    this.tex3.scale.x = 1;
    this.tex4.visible = this.tex2.visible = this.tex1.visible = false;
  } else if((a >= 5*Math.PI/8) && (a < 7*Math.PI/8)) {
    this.tex2.visible = true;
    this.tex2.scale.x = -1;
    this.tex4.visible = this.tex3.visible = this.tex1.visible = false;
  } else if((a >= 7*Math.PI/8) && (a < 9*Math.PI/8)) {
    this.tex3.visible = true;
    this.tex3.scale.x = -1;
    this.tex4.visible = this.tex2.visible = this.tex1.visible = false;
    
  } else {
    this.tex4.visible = true;
    this.tex3.visible = this.tex2.visible = this.tex1.visible = false;
    
  }
}

function Sword(name) {
  Item.call(this, this.texture, name, 'hand');
  this.off_x = -20;
}

Sword.prototype = Object.create(Item.prototype);
Sword.prototype.constructor = Sword;
Sword.prototype.texture = PIXI.Texture.fromImage('sprites/sword.png');

Sword.prototype.slashTexture = PIXI.Texture.fromImage("sprites/slash.png");
Sword.prototype.start = function(player, arm, sprite) {
  var effect = new PIXI.Sprite(this.slashTexture);
  effect.anchor.x = .5;
  effect.anchor.y = .5;
  effect.scale.x = 2;
  effect.scale.y = 2;
  effect.position.x = player.position.x + Math.cos(player.attack_a) * 80;
  effect.position.y = player.position.y + Math.sin(player.attack_a) * 80 - 50;
  effect.rotation = player.attack_a + Math.PI/3;
  world.addChild(effect);
  var sound = new Audio('sounds/sword' + Math.floor(Math.random()*2) + '.mp3');
  sound.volume = .2;
  sound.play();
  new TWEEN.Tween( { r: player.attack_a + Math.PI/3, a: 1 } )
    .to( { r: player.attack_a - Math.PI/3, a: 0 }, 500 )
    .easing( TWEEN.Easing.Circular.Out )
    .onUpdate( function () { 
      arm.rotation = this.a * Math.PI * 2 * (arm === player.rightArm ? -1 : 1);
      effect.rotation = this.r;
      effect.alpha = this.a;
    } )
    .onComplete(function() {world.removeChild(effect) })
    .start();
    
  var dmg = player.damage;
  hit(enemies, effect.position.x, effect.position.y, 32 * 2, dmg);
};

function NoItem() {
  Item.call(this, this.texture, 'Empty', null, .5, .5);
}
NoItem.prototype = Object.create(Item.prototype);
NoItem.prototype.constructor = NoItem;
NoItem.prototype.texture = PIXI.Texture.fromImage('sprites/nothing.png');

function randomItem(level) {
  var path = sprites[Math.floor(Math.random() * sprites.length)];
  var name = path.substr(14, path.length-18).replace(/_/g, ' ').capitalize();
  
  var f = function() {
    Item.call(this, this.texture, name, 'hand', .5, .5);
    this.stats = {};
    this.stats.life = Math.floor(Math.random() * level * 2);
    this.stats.armor = Math.round(Math.random() * 2 * level - level);
    this.stats.damage = Math.floor(Math.random() * level);
    this.stats.speed = Math.round(Math.random() * 2 * level - level)/10;
  }
  f.name = name;
  
  f.prototype = Object.create(Item.prototype);
  f.prototype.constructor = f;
  f.prototype.texture = PIXI.Texture.fromImage(path);
  
  return new f();

}

function cloneItem(item) {
  var c = function() {
    item.constructor.call(this);
  }
  c.prototype = Object.create(item.constructor.prototype);
  var i = new c();
  i.original = item;
  return i;
}

var sprites = [
  'abbasid_ribs.png',
  'ace_of_spades.png',
  'alchemical_tongs.png',
  'all_spice.png',
  'antique_spigot.png',
  'applejack.png',
  'apple.png',
  'artifact_magical_pendant.png',
  'artifact_necklace_amazonite_piece.png',
  'artifact_necklace_amazonite.png',
  'artifact_necklace_imperial_piece.png',
  'artifact_necklace_imperial.png',
  'artifact_necklace_onyx_piece.png',
  'artifact_necklace_onyx.png',
  'artifact_necklace_redtigereye_piece.png',
  'artifact_necklace_redtigereye.png',
  'artifact_necklace_rhyolite_piece.png',
  'artifact_necklace_rhyolite.png',
  'artifact_platinumium_spork_piece1.png',
  'artifact_platinumium_spork.png',
  'awesome_stew.png',
  'bacon.png',
  'bag_bigger_blue.png',
  'bag_bigger_gray.png',
  'bag_bigger_green.png',
  'bag_bigger_pink.png',
  'bag_bigger.png',
  'bag_cubimal_case.png',
  'bag_generic_blue.png',
  'bag_generic_gray.png',
  'bag_generic_green.png',
  'bag_generic_pink.png',
  'bag_generic.png',
  'banana_no_names.png',
  'barnacle.png',
  'basic_omelet.png',
  'beaker.png',
  'beam.png',
  'bean_bean.png',
  'bean_bubble.png',
  'bean_egg.png',
  'bean_fruit.png',
  'bean_garden.png',
  'bean_gas.png',
  'bean_plain.png',
  'bean_spice.png',
  'bean_wood.png',
  'beer.png',
  'berry_bowl.png',
  'beryl.png',
  'best_bean_dip.png',
  'birch_candy.png',
  'birch_syrup.png',
  'black_pepper.png',
  'blue_bubble.png',
  'board.png',
  'broccoli.png',
  'bubble_and_squeak.png',
  'bubble_tea.png',
  'bubble_tuner.png',
  'bulb.png',
  'bunch_of_grapes_hell.png',
  'bun.png',
  'butterfly_butter.png',
  'butterfly_egg.png',
  'butterfly_lotion.png',
  'camera.png',
  'camphor.png',
  'cardamom.png',
  'card_carrying_qualification.png',
  'carobish_treats.png',
  'carrot_margarita.png',
  'cedar_plank_salmon.png',
  'cheese_plate.png',
  'cheese.png',
  'cheese_stinky.png',
  'cheese_very_stinky.png',
  'cheese_very_very_stinky.png',
  'cheezy_sammich.png',
  'cheezy_sauce.png',
  'cherry.png',
  'chicken_egg.png',
  'chillybusting_chili.png',
  'choice_crudites.png',
  'cinnamon.png',
  'class_axe.png',
  'cloud_11_smoothie.png',
  'cloudberry_daiquiri.png',
  'cloudberry_jam.png',
  'cloudberry.png',
  'coffee.png',
  'cold_taco.png',
  'conch.png',
  'construction_tool.png',
  'copper.png',
  'corn_off_the_cob.png',
  'corn.png',
  'corn_syrup_squares.png',
  'corny_fritter.png',
  'cosmapolitan.png',
  'crabato_juice.png',
  'crabphones.png',
  'creamy_catsup.png',
  'creamy_martini.png',
  'crying_gas.png',
  'cumin.png',
  'cup_of_water.png',
  'curry.png',
  'death_to_veg.png',
  'deluxe_sammich.png',
  'desssert_rub.png',
  'dice.png',
  'divine_crepes.png',
  'drink_ticket.png',
  'dullite.png',
  'dusty_stick.png',
  'earth.png',
  'earthshaker.png',
  'egghunt_egg_4.png',
  'egg_plain.png',
  'egg_seasoner.png',
  'eggy_scramble.png',
  'emotional_bear.png',
  'essence_of_gandlevery.png',
  'essence_of_hairball.png',
  'essence_of_purple.png',
  'essence_of_rookswort.png',
  'essence_of_rubeweed.png',
  'essence_of_silvertongue.png',
  'essence_of_yellow_crumb.png',
  'exotic_fruit_salad.png',
  'exotic_juice.png',
  'expensive_grilled_cheese.png',
  'face_smelter.png',
  'faded_heart.png',
  'fancy_pick.png',
  'fiber.png',
  'flaming_humbaba.png',
  'flour.png',
  'flummery.png',
  'focusing_orb.png',
  'fortifying_gruel.png',
  'fortune_cookie.png',
  'fortune.png',
  'fox_bait.png',
  'fox_brush.png',
  'fox_permit.png',
  'fried_rice.png',
  'frog_in_a_hole.png',
  'fuel_cell.png',
  'gameshow_ticket.png',
  'gammas_pancakes.png',
  'gandlevery.png',
  'garlic.png',
  'gem_amber.png',
  'gem_diamond.png',
  'gem_moonstone.png',
  'gem_ruby.png',
  'gem_sapphire.png',
  'general_building_permit.png',
  'general_fabric.png',
  'general_vapour.png',
  'ginger.png',
  'girder.png',
  'glitchepoix.png',
  'glitchmas_cracker_factoid.png',
  'glitchmas_cracker.png',
  'goat_arm_raw.png',
  'goat_arse.png',
  'goat_ear_fried.png',
  'goat_eye.png',
  'goat_liquer.png',
  'grain_bushel.png',
  'grain.png',
  'greasy_frybread.png',
  'green_eggs.png',
  'green.png',
  'greeter_twig.png',
  'grilled_cheese.png',
  'gurly_drink.png',
  'hairball_flower.png',
  'hard_bubble.png',
  'hash.png',
  'hatchet.png',
  'hearty_groddle_sammich.png',
  'hearty_omelet.png',
  'heavy_gas.png',
  'helium.png',
  'herb_seed_gandlevery.png',
  'herb_seed_hairball_flower.png',
  'herb_seed_purple_flower.png',
  'herb_seed_rookswort.png',
  'herb_seed_rubeweed.png',
  'herb_seed_silvertongue.png',
  'herb_seed_yellow_crumb_flower.png',
  'heston_mash.png',
  'homestreet_ticket.png',
  'honey.png',
  'hooch.png',
  'hot_n_fizzy_sauce.png',
  'hototot_rub.png',
  'hot_pepper.png',
  'hot_potatoes.png',
  'hungry_nachos.png',
  'ice.png',
  'icon_cosma.png',
  'icon_humbaba.png',
  'icon_spriggan.png',
  'icon_zille.png',
  'ixstyle_braised_meat.png',
  'jellisac_clump.png',
  'juicy_carpaccio.png',
  'juju_paperweight.png',
  'juju_trowel.png',
  'kind_breakfurst_burrito.png',
  'kings_of_condiments.png',
  'krazy_salts.png',
  'laughing_gas.png',
  'lazy_salad.png',
  'legumes_parisienne.png',
  'lemburger.png',
  'lemon.png',
  'licorice.png',
  'lips.png',
  'loomer.png',
  'lotsa_lox.png',
  'luxury_tortellini.png',
  'mabbish_coffee.png',
  'maburger_royale.png',
  'mangosteen.png',
  'meat_gumbo.png',
  'meat.png',
  'meat_tetrazzini.png',
  'messy_fry_up.png',
  'metal_post.png',
  'metal_rock.png',
  'metal_rod.png',
  'mexicali_eggs.png',
  'mild_sauce.png',
  'milk_butterfly.png',
  'molybdenum.png',
  'mushroom.png',
  'mustard.png',
  'naraka_flame_rub.png',
  'no_no_powder.png',
  'note_hint.png',
  'note.png',
  'nutmeg.png',
  'oats.png',
  'oaty_cake.png',
  'obvious_panini.png',
  'older_spice.png',
  'olive_oil.png',
  'onion.png',
  'onion_sauce.png',
  'orange.png',
  'ore_grinder.png',
  'pad_tii.png',
  'paper.png',
  'papl_upside_down_pizza.png',
  'paradise_ticket_abysmal_thrill.png',
  'paradise_ticket_aerial_boost.png',
  'paradise_ticket_arbor_hollow.png',
  'paradise_ticket_beam_me_down.png',
  'paradise_ticket_bippity_bop.png',
  'paradise_ticket_cloud_flight.png',
  'paradise_ticket_cloud_rings.png',
  'paradise_ticket_drafty_uplift.png',
  'paradise_ticket_mountain_scaling.png',
  'paradise_ticket.png',
  'paradise_ticket_radial_heights.png',
  'paradise_ticket_sky_plunge.png',
  'paradise_ticket_slip_n_slide.png',
  'paradise_ticket_starlit_night.png',
  'paradise_ticket_updraft.png',
  'pareidolic_cosma_toast.png',
  'party_pack_aquarius.png',
  'party_pack_double_rainbow.png',
  'party_pack_mazzala_gala.png',
  'party_pack_monster_bash.png',
  'party_pack_nylon_phool.png',
  'party_pack_pitchen_lilliputt.png',
  'party_pack.png',
  'party_pack_taster_aquarius.png',
  'party_pack_taster_double_rainbow.png',
  'party_pack_taster_mazzala_gala.png',
  'party_pack_taster_nylon_phool.png',
  'party_pack_taster_pitchen_lilliputt.png',
  'party_pack_taster_toxic_moon.png',
  'party_pack_taster_val_holla.png',
  'party_pack_taster_winter_wingding.png',
  'party_pack_toxic_moon.png',
  'party_pack_val_holla.png',
  'party_pack_winter_wingding.png',
  'peat.png',
  'pepitas.png',
  'petrified_rock_large.png',
  'petrified_rock_medium.png',
  'petrified_rock_small.png',
  'pickle.png',
  'pick.png',
  'pig_bait.png',
  'piggy_egg.png',
  'piggy_feeder.png',
  'plain_bubble.png',
  'plain_crystal.png',
  'plain_metal.png',
  'plain_noodles.png',
  'plank.png',
  'plate_of_beans.png',
  'plum.png',
  'potato_patty.png',
  'potato.png',
  'potcorn.png',
  'potians_feast.png',
  'potion_amorous_philtre.png',
  'potion_ancestral_spirits.png',
  'potion_animal_youth.png',
  'potion_avatar_large.png',
  'potion_avatar_small.png',
  'potion_charades.png',
  'potion_draught_of_giant_amicability.png',
  'potion_elixir_of_avarice.png',
  'potion_garden_clear.png',
  'potion_garden_fertilize.png',
  'potion_garden_harvest.png',
  'potion_garden_plant.png',
  'potion_garden_water.png',
  'potion_keycutter_tonic.png',
  'potion_rainbow_juice.png',
  'potion_rook_balm.png',
  'potion_trantsformation_fluid.png',
  'potion_tree_poison_antidote.png',
  'potion_tree_poison.png',
  'pottine.png',
  'precious_potato_salad.png',
  'proper_rice.png',
  'pumpkin_ale.png',
  'pumpkin_lit_2.png',
  'pumpkin.png',
  'pungent_sunrise.png',
  'purple_flower.png',
  'quill.png',
  'race_ticket_amazing_race.png',
  'race_ticket_canyon_run.png',
  'race_ticket_cloudhopolis.png',
  'race_ticket_crystal_climb.png',
  'race_ticket_grab_em_good.png',
  'race_ticket_hogtie_piggy.png',
  'race_ticket_it_game.png',
  'race_ticket_lava_leap.png',
  'race_ticket.png',
  'red.png',
  'rice.png',
  'rich_tagine.png',
  'rock.png',
  'rookswort.png',
  'roux.png',
  'rubeweed.png',
  'saffron.png',
  'salmon_jaella.png',
  'salmon.png',
  'sammich.png',
  'savory_smoothie.png',
  'scraper.png',
  'scrumptious_frittata.png',
  'secret_sauce.png',
  'seed_broccoli.png',
  'seed_cabbage.png',
  'seed_carrot.png',
  'seed_corn.png',
  'seed_cucumber.png',
  'seed_onion.png',
  'seed_parsnip.png',
  'seed_potato.png',
  'seed_pumpkin.png',
  'seed_rice.png',
  'seed_spinach.png',
  'seed_strawberry.png',
  'seed_tomato.png',
  'seed_zucchini.png',
  'sesame_oil.png',
  'sheep_ass_vodka.png',
  'sheep_red_wine.png',
  'shovel.png',
  'silvertongue.png',
  'simple_bbq.png',
  'simple_slaw.png',
  'slow_gin_fizz.png',
  'small_worthless.png',
  'smoothie.png',
  'snack_pack.png',
  'snail.png',
  'sno_cone_blue.png',
  'sno_cone_green.png',
  'sno_cone_orange.png',
  'sno_cone_purple.png',
  'sno_cone_rainbow.png',
  'sno_cone_red.png',
  'sparkly.png',
  'special_item_that_only_beta_testers_get.png',
  'spicy_grog.png',
  'spicy_quesadilla.png',
  'spigot.png',
  'spinach.png',
  'spinach_salad.png',
  'spindle.png',
  'splendid_spindle.png',
  'stock_sauce.png',
  'strawberry.png',
  'string.png',
  'super_veggie_kebabs.png',
  'swank_zucchini_loaf.png',
  'sweet_n_sour_sauce.png',
  'swing_batter.png',
  'tangy_noodles.png',
  'tangy_sauce.png',
  'tasty_pasta.png',
  'teleportation_script_imbued.png',
  'teleportation_script.png',
  'test_tube.png',
  'thread.png',
  'tincturing_kit.png',
  'tin.png',
  'tiny_bubble.png',
  'tomato.png',
  'tooberry_shake.png',
  'tortilla.png',
  'trump_rub.png',
  'turmeric.png',
  'upgrade_card_instant_resurrection.png',
  'upgrade_card_reshuffle.png',
  'urfu.png',
  'vegmageddon.png',
  'waffles.png',
  'wavy_gravy.png',
  'white_gas.png',
  'whortleberry_jelly.png',
  'whortleberry.png',
  'wicked_bolognese_sauce.png',
  'wine_of_the_dead.png',
  'wood_post.png',
  'yellow_crumb_flower.png',
  'your_papers.png',
  'yummy_gruel.png' ].map(function(x) { return 'sprites/items/' + x; });
