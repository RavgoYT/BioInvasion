/*
  bioinvaders.js

  the core logic for the bio invasion game.

*/

/*  
    Game Class

    The Game class represents a Bio Invasion game.
    Create an instance of it, change any of the default values
    in the settings, and call 'start' to run the game.

    Call 'initialise' before 'start' to set the canvas the game
    will draw to.

    Call 'moveShip' or 'shipFire' to control the ship.

    Listen for 'gameWon' or 'gameLost' events to handle the game
    ending.
*/

//  Constants for the keyboard.
var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_SPACE = 32;

let kills = 0;
let powerups = [
  "platelets",
  "bacteriophage",
  "lymphocytes",
  "fever"
]

let textLines = [

  "An example of a pathogenic virus would be the variola virus, \ncausing smallpox, and is spread through human contact. The \ndisease starts to run its course after incubation where rashes \nstart showing on the mouth or throat which turn into sores. \nThe sores turn into pustules which turn into scabs. \nThe process takes a few weeks where symptoms start to subside once \nthe scabs fall off, but during this process the infected feels absurd \namounts of pain and fevers. Thankfully a vaccine was developed \nand the virus is now relatively eradicated.",
  
  "One example of bacteria would be mycobacterium tuberculosis, \nwhich is a bacterial pathogen characterized by multiplying, \nusually leaving the infected with a bad cough, \nchest pain, chills, fevers, and more as the bacteria usually \ninfects the lungs. This way it can spread to its next victim as it can be \nairborne and stay on various surfaces. If left untreated, \nit can deal a fair amount of damage to \nwhatever it infects. There is a vaccine called BCG against \ntuberculosis and there are medicines to treat the pathogen.",

  "A well known parasite are tapeworms, which are an organism that \ncan cause the intestinal infection taeniasis if a person eats undercooked \nand infected pork that has tapeworm eggs. This means \nthat the tapeworm will develop and grow in the intestines where \nthe infected will experience abdominal pain, nausea, diarrhea, \nconstipation, etc. The tapeworm can feed off the food \nthat their host eats and their eggs can be seen in the host's feces.",

  "Being a unique type of virus, bacteriophages target only bacterial cells for replication, \noften very specialized only targeting a specific species or its strains. The usual \nbacteriophage is composed of a nucleic acid genome with a sheath \nand tail fibers. The tail fibers attach onto the bacteria's \nmembrane, where a needle is inserted into the cell through the sheath, \nto give the cell its genetic material, where eventually the bacterial \ncell will burst with newly created bacteriophages to prey \non more bacterial cells.",
  
  "Macrophages are a unique type of cell featured in a human's \nimmune response, using its large size to ingest foreign objects and destroying them \nin the process of phagocytosis. This allows the human to come \nback to homeostasis in an event of harmful \norganisms that enter the body.",

  "A fever is a type of immune response against harmful organisms where the human body \nincreases its temperature temporarily from its average of 98.6 degrees Fahrenheit. \nPathogens will be able to work less efficiently in a fever's higher temperature, \nallowing the body to fight back despite not being in a homeostatic state.",

  "There are two types of lymphocytes, B and T cells. T cell lymphocytes directly attack \npathogens head on, while B cell lymphocytes create \nand release antibodies that recognize specific \nantigens to then bind and destroy them. These cells target the \nlikes of bacteria, viruses, toxins, and the sort.",

  "Platelets are a more unique type of white blood cell, \nbeing smaller and fragmented. Made in our bone marrow and are \nused to prevent bleeding by clotting up to create temporary patches.",
  
  "rav good programmer",

  "josh wrote all these",

  "this game runs at 50 fps",

  
  ] 

 let usedTextLines = []
  

let fever = false
let fevertime = 0
let lymphocytes = false
let lymphocytetime = 0
let bacteriophage = false
let bacteriophagetime = 0
let platelets = false
let plateletstime = 0

//  Creates an instance of the Game class.
function Game() {

  //  Set the initial config.
  this.config = {
    bombRate: 0.08,
    bombMinVelocity: 50,
    bombMaxVelocity: 50,
    invaderInitialVelocity: 25,
    invaderAcceleration: 0,
    invaderDropDistance: 15,
    rocketVelocity: 120,
    rocketMaxFireRate: 2.6,
    gameWidth: 400,
    gameHeight: 300,
    fps: 50,
    debugMode: false,
    invaderRanks: 4,
    invaderFiles: 8,
    shipSpeed: 125,
    levelDifficultyMultiplier: 0.25,
    pointsPerInvader: 5,
    limitLevelIncrease: 25
  };

  //  All state is in the variables below.
  this.lives = 3;
  this.width = 0;
  this.height = 0;
  this.gameBounds = { left: 0, top: 0, right: 0, bottom: 0 };
  this.intervalId = 0;
  this.score = 0;
  this.level = 1;

  //  The state stack.
  this.stateStack = [];

  //  Input/output
  this.pressedKeys = {};
  this.gameCanvas = null;

  //  All sounds.
  this.sounds = null;

  //  The previous x position, used for touch.
  this.previousX = 0;
}

//  Initialis the Game with a canvas.
Game.prototype.initialise = function(gameCanvas) {

  //  Set the game canvas.
  this.gameCanvas = gameCanvas;

  //  Set the game width and height.
  this.width = gameCanvas.width;
  this.height = gameCanvas.height;

  //  Set the state game bounds.
  this.gameBounds = {
    left: gameCanvas.width / 2 - this.config.gameWidth / 2,
    right: gameCanvas.width / 2 + this.config.gameWidth / 2,
    top: gameCanvas.height / 2 - this.config.gameHeight / 2,
    bottom: gameCanvas.height / 2 + this.config.gameHeight / 2,
  };
};

Game.prototype.moveToState = function(state) {

  //  If we are in a state, leave it.
  if (this.currentState() && this.currentState().leave) {
    this.currentState().leave(game);
    this.stateStack.pop();
  }

  //  If there's an enter function for the new state, call it.
  if (state.enter) {
    state.enter(game);
  }

  //  Set the current state.
  this.stateStack.pop();
  this.stateStack.push(state);
};

//  Start the Game.
Game.prototype.start = function() {

  //  Move into the 'welcome' state.
  this.moveToState(new WelcomeState());

  //  Set the game variables.
  this.lives = 3;
  this.config.debugMode = /debug=true/.test(window.location.href);

  //  Start the game loop.
  var game = this;
  this.intervalId = setInterval(function() { GameLoop(game); }, 1000 / this.config.fps);

};

//  Returns the current state.
Game.prototype.currentState = function() {
  return this.stateStack.length > 0 ? this.stateStack[this.stateStack.length - 1] : null;
};

//  Mutes or unmutes the game.
Game.prototype.mute = function(mute) {

  //  If we've been told to mute, mute.
  if (mute === true) {
    this.sounds.mute = true;
  } else if (mute === false) {
    this.sounds.mute = false;
  } else {
    // Toggle mute instead...
    this.sounds.mute = this.sounds.mute ? false : true;
  }
};

//  The main loop.
function GameLoop(game) {
  var currentState = game.currentState();
  if (currentState) {

    //  Delta t is the time to update/draw.
    var dt = 1 / game.config.fps;

    //  Get the drawing context.
    var ctx = this.gameCanvas.getContext("2d");

    //  Update if we have an update function. Also draw
    //  if we have a draw function.
    if (currentState.update) {
      currentState.update(game, dt, ctx);
    }
    if (currentState.draw) {
      currentState.draw(game, dt, ctx);
    }
  }
}

Game.prototype.pushState = function(state) {

  //  If there's an enter function for the new state, call it.
  if (state.enter) {
    state.enter(game);
  }
  //  Set the current state.
  this.stateStack.push(state);
};

Game.prototype.popState = function() {

  //  Leave and pop the state.
  if (this.currentState()) {
    if (this.currentState().leave) {
      this.currentState().leave(game);
    }

    //  Set the current state.
    this.stateStack.pop();
  }
};

//  The stop function stops the game.
Game.prototype.stop = function Stop() {
  clearInterval(this.intervalId);
};

//  Inform the game a key is down.
Game.prototype.keyDown = function(keyCode) {
  this.pressedKeys[keyCode] = true;
  //  Delegate to the current state too.
  if (this.currentState() && this.currentState().keyDown) {
    this.currentState().keyDown(this, keyCode);
  }
};

Game.prototype.touchstart = function(s) {
  if (this.currentState() && this.currentState().keyDown) {
    this.currentState().keyDown(this, KEY_SPACE);
  }
};

Game.prototype.touchend = function(s) {
  delete this.pressedKeys[KEY_RIGHT];
  delete this.pressedKeys[KEY_LEFT];
};

Game.prototype.touchmove = function(e) {
  var currentX = e.changedTouches[0].pageX;
  if (this.previousX > 0) {
    if (currentX > this.previousX) {
      delete this.pressedKeys[KEY_LEFT];
      this.pressedKeys[KEY_RIGHT] = true;
    } else {
      delete this.pressedKeys[KEY_RIGHT];
      this.pressedKeys[KEY_LEFT] = true;
    }
  }
  this.previousX = currentX;
};

//  Inform the game a key is up.
Game.prototype.keyUp = function(keyCode) {
  delete this.pressedKeys[keyCode];
  //  Delegate to the current state too.
  if (this.currentState() && this.currentState().keyUp) {
    this.currentState().keyUp(this, keyCode);
  }
};

function WelcomeState() {

}

var Titleimage = new Image();
Titleimage.src = "assets/macrophage.png";
var viruspng = new Image();
var bacteriapng = new Image();
bacteriapng.src = "assets/bacteria.png";
viruspng.src = "assets/virus.png"
var fungipng = new Image();
fungipng.src = "assets/fungi.png"
var parasitepng = new Image();
parasitepng.src = "assets/parasite.png"
var plateletsImage = new Image();
plateletsImage.src = "assets/platelets.png"
var bacteriaImage = new Image();
bacteriaImage.src = "assets/bacteriophage.png"
var feverImage = new Image();
feverImage.src = 'assets/fever.png'
var lymphocytesImage = new Image();
lymphocytesImage.src = "assets/lymphocytes.png"
var playerImage = new Image();
playerImage.src = 'assets/humsn.png'

let enemies = {
  "virus": viruspng,
  "bacteria": bacteriapng,
  "fungi": fungipng,
  "parasite": parasitepng
}
let enemi = [
  'virus',
  'bacteria',
  'fungi',
  'parasite'
]
function fadeAndDrawImage(ctx, image, x, y, w, h) {
  var canvas = ctx.canvas;
  canvas.style.opacity = 0;

  setTimeout(function() {
    canvas.style.opacity = 1;
    ctx.drawImage(image, x, y, w, h);
  }, 0);
}
// defining that random num
let random = 0;
let random2 = 0;
WelcomeState.prototype.enter = function(game) {

  // Create and load the sounds.
  game.sounds = new Sounds();
  game.sounds.init();
  game.sounds.loadSound('shoot', 'sounds/shoot.wav');
  game.sounds.loadSound('bang', 'sounds/bang.wav');
  game.sounds.loadSound('explosion', 'sounds/explosion.wav');
};

WelcomeState.prototype.update = function(game, dt) {


};

WelcomeState.prototype.draw = function(game, dt, ctx) {

  //  Clear the background.
  ctx.clearRect(0, 0, game.width, game.height);

  ctx.font = "30px Comic Sans MS";
  ctx.fillStyle = '#000000';
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("BioInvasion", game.width / 2, game.height / 2 - 40);
  ctx.font = "16px Comic Sans MS";
  ctx.drawImage(Titleimage, game.width / 2 - 150, game.height / 2 - 80, 75, 75);

  ctx.fillText("Press 'Space' or touch to start :D", game.width / 2, game.height / 2);
};

WelcomeState.prototype.keyDown = function(game, keyCode) {
  if (keyCode == KEY_SPACE) {
    //  Space starts the game.
    game.level = 1;
    game.score = 0;
    game.lives = 3;
    game.moveToState(new LevelIntroState(game.level));
  }
};

function GameOverState() {

}

GameOverState.prototype.update = function(game, dt) {

};

GameOverState.prototype.draw = function(game, dt, ctx) {

  //  Clear the background.
  ctx.clearRect(0, 0, game.width, game.height);

  ctx.font = "30px Comic Sans MS";
  ctx.fillStyle = '#000000';
  ctx.textBaseline = "center";
  ctx.textAlign = "center";
  ctx.fillText("Game Over!", game.width / 2, game.height / 2 - 40);
  ctx.font = "16px Comic Sans MS";
  ctx.fillText("You scored " + game.score + " and got to level " + game.level, game.width / 2, game.height / 2);
  ctx.font = "16px Comic Sans MS";
  ctx.fillText("Press 'Space' to play again.", game.width / 2, game.height / 2 + 40);
};

GameOverState.prototype.keyDown = function(game, keyCode) {
  if (keyCode == KEY_SPACE) {
    //  Space restarts the game.
    game.lives = 3;
    game.score = 0;
    game.level = 1;
    game.moveToState(new LevelIntroState(1));
  }
};

//  Create a PlayState with the game config and the level you are on.
function PlayState(config, level) {
  this.config = config;
  this.level = level;

  //  Game state.
  this.invaderCurrentVelocity = 10;
  this.invaderCurrentDropDistance = 0;
  this.invadersAreDropping = false;
  this.lastRocketTime = null;

  //  Game entities.
  this.ship = null;
  this.invaders = [];
  this.rockets = [];
  this.bombs = [];
}

PlayState.prototype.enter = function(game) {

  //  Create the ship.
  this.ship = new Ship(game.width / 2, game.gameBounds.bottom);

  //  Setup initial state.
  this.invaderCurrentVelocity = 10;
  this.invaderCurrentDropDistance = 0;
  this.invadersAreDropping = false;

  //  Set the ship speed for this level, as well as invader params.
  random = Math.floor(Math.random() * 4);
  random2 = Math.floor(Math.random() * textLines.length);

    var levelMultiplier = this.level * this.config.levelDifficultyMultiplier;
    var limitLevel = (this.level < this.config.limitLevelIncrease ? this.level : this.config.limitLevelIncrease);
    this.shipSpeed = this.config.shipSpeed;
    this.invaderInitialVelocity = this.config.invaderInitialVelocity + 1.5 * (levelMultiplier * this.config.invaderInitialVelocity);
    this.bombRate = this.config.bombRate + (levelMultiplier * this.config.bombRate);
  

  // setting bomb min and max velocities for *this* level. 
  /*
  * Level 1: Virus ; 
  * Level 2: Bacteria ; 
  * Level 3: Fungi ; 
  * Level 4: Parasite ; 
  uhh actually they'll just get harder and harder fr
  */


  if (fever != true) {
    this.bombMinVelocity = this.config.bombMinVelocity + (levelMultiplier * this.config.bombMinVelocity);
    this.bombMaxVelocity = this.config.bombMaxVelocity + (levelMultiplier * this.config.bombMaxVelocity);
  } else {
    this.bombMinVelocity = (this.config.bombMinVelocity + (levelMultiplier * this.config.bombMinVelocity)) * 0.6;
    this.bombMaxVelocity = (this.config.bombMaxVelocity + (levelMultiplier * this.config.bombMaxVelocity)) * 0.6;
  }
  if (enemi[random] == 'parasite' && this.level > 4) {
  this.rocketMaxFireRate = (this.config.rocketMaxFireRate + 0 * limitLevel) * 0.7;
  } else if (this.level == 4) {
    this.rocketMaxFireRate = (this.config.rocketMaxFireRate + 0.4 * limitLevel) * 0.7;
  } else {
    if (lymphocytes != true) this.rocketMaxFireRate = this.config.rocketMaxFireRate + 0.4 * limitLevel;
    else this.rocketMaxFireRate = (this.config.rocketMaxFireRate + 0.4 * limitLevel) * 1.5;
  }

  //  Create the invaders.
  var ranks = this.config.invaderRanks + 0.1 * limitLevel;
  var files = this.config.invaderFiles + 0.2 * limitLevel;
  var invaders = [];
  for (var rank = 0; rank < ranks; rank++) {
    for (var file = 0; file < files; file++) {
      invaders.push(new Invader(
        (game.width / 2) + ((files / 2 - file) * 200 / files),
        (game.gameBounds.top + rank * 20),
        rank, file, 'Invader'));
    }
  }
  this.invaders = invaders;
  this.invaderCurrentVelocity = this.invaderInitialVelocity;
  this.invaderVelocity = { x: -this.invaderInitialVelocity, y: 0 };
  this.invaderNextVelocity = null;
};

PlayState.prototype.update = function(game, dt, ctx) {

  //  If the left or right arrow keys are pressed, move
  //  the ship. Check this on ticks rather than via a keydown
  //  event for smooth movement, otherwise the ship would move
  //  more like a text editor caret.
  if (game.pressedKeys[KEY_LEFT]) {
    this.ship.x -= this.shipSpeed * dt;
  }
  if (game.pressedKeys[KEY_RIGHT]) {
    this.ship.x += this.shipSpeed * dt;
  }
  if (game.pressedKeys[KEY_SPACE]) {
    this.fireRocket();
  }

  //  Keep the ship in bounds.
  if (this.ship.x < game.gameBounds.left) {
    this.ship.x = game.gameBounds.left;
  }
  if (this.ship.x > game.gameBounds.right) {
    this.ship.x = game.gameBounds.right;
  }

  //  Move each bomb.
  for (var i = 0; i < this.bombs.length; i++) {
    var bomb = this.bombs[i];
    if (fever == true) bomb.y += dt * (bomb.velocity / 2);
    else bomb.y += dt * bomb.velocity;

    //  If the rocket has gone off the screen remove it.
    if (bomb.y > this.height) {
      this.bombs.splice(i--, 1);
    }
  }

  //  Move each rocket.
  for (i = 0; i < this.rockets.length; i++) {
    var rocket = this.rockets[i];
    rocket.y -= dt * rocket.velocity;

    //  If the rocket has gone off the screen remove it.
    if (rocket.y < 0) {
      this.rockets.splice(i--, 1);
    }
  }

  //  Move the invaders.
  var hitLeft = false, hitRight = false, hitBottom = false;
  for (i = 0; i < this.invaders.length; i++) {
    var invader = this.invaders[i];
    var newx = invader.x + this.invaderVelocity.x * dt;
    var newy = invader.y + this.invaderVelocity.y * dt;
    if (hitLeft == false && newx < game.gameBounds.left) {
      hitLeft = true;
    }
    else if (hitRight == false && newx > game.gameBounds.right) {
      hitRight = true;
    }
    else if (hitBottom == false && newy > game.gameBounds.bottom) {
      hitBottom = true;
    }

    if (!hitLeft && !hitRight && !hitBottom) {
      invader.x = newx;
      invader.y = newy;
    }
  }

  //  Update invader velocities.
  if (this.invadersAreDropping) {
    this.invaderCurrentDropDistance += this.invaderVelocity.y * dt;
    if (this.invaderCurrentDropDistance >= this.config.invaderDropDistance) {
      this.invadersAreDropping = false;
      this.invaderVelocity = this.invaderNextVelocity;
      this.invaderCurrentDropDistance = 0;
    }
  }
  //  If we've hit the left, move down then right.
  if (hitLeft) {
    this.invaderCurrentVelocity += this.config.invaderAcceleration;
    this.invaderVelocity = { x: 0, y: this.invaderCurrentVelocity };
    this.invadersAreDropping = true;
    this.invaderNextVelocity = { x: this.invaderCurrentVelocity, y: 0 };
  }
  //  If we've hit the right, move down then left.
  if (hitRight) {
    this.invaderCurrentVelocity += this.config.invaderAcceleration;
    this.invaderVelocity = { x: 0, y: this.invaderCurrentVelocity };
    this.invadersAreDropping = true;
    this.invaderNextVelocity = { x: -this.invaderCurrentVelocity, y: 0 };
  }
  //  If we've hit the bottom, it's game over.
  if (hitBottom) {
    game.lives = 0;
  }

  //  Check for rocket/invader collisions.
  for (i = 0; i < this.invaders.length; i++) {
    var invader = this.invaders[i];
    var bang = false;

    for (var j = 0; j < this.rockets.length; j++) {
      var rocket = this.rockets[j];

      if (rocket.x >= (invader.x - invader.width / 2) && rocket.x <= (invader.x + invader.width / 2) &&
        rocket.y >= (invader.y - invader.height / 2) && rocket.y <= (invader.y + invader.height / 2)) {

        //  Remove the rocket, set 'bang' so we don't process
        //  this rocket again.
          if (this.level < 4) invader.enemy = enemi[this.level - 1]
          else invader.enemy = enemi[random]
          if (invader.enemy == 'fungi') {
          if (invader.hits === 1) {
          bang = true;
          game.score += this.config.pointsPerInvader;
          invader.hits = undefined
          }
          this.rockets.splice(j--, 1);
          if (invader.hits == undefined) {
            invader.hits = 1
          }
          break;
        } else {
          bang = true;
          game.score += this.config.pointsPerInvader;
          this.rockets.splice(j--, 1);
          break;
        }


        
      }
    }
    if (bang) {
      this.invaders.splice(i--, 1);
      kills++
      if (kills >= 25) // choose a random powerup
      {
        let chosen = powerups[Math.floor(Math.random() * powerups.length)]
        if (chosen == 'fever') fever = true
        else if (chosen == 'lymphocytes') lymphocytes = true
        else if (chosen == 'bacteriophage') bacteriophage = true
        else if (chosen == 'platelets') platelets = true

        kills = 0
      }
      game.sounds.playSound('bang');
    }
  }

  //  Find all of the front rank invaders.
  var frontRankInvaders = {};
  for (var i = 0; i < this.invaders.length; i++) {
    var invader = this.invaders[i];
    //  If we have no invader for game file, or the invader
    //  for game file is futher behind, set the front
    //  rank invader to game one.
    if (!frontRankInvaders[invader.file] || frontRankInvaders[invader.file].rank < invader.rank) {
      frontRankInvaders[invader.file] = invader;
    }
  }

  //  Give each front rank invader a chance to drop a bomb.
  for (var i = 0; i < this.config.invaderFiles; i++) {
    var invader = frontRankInvaders[i];
    if (!invader) continue;
    var chance = this.bombRate * dt;
    if (chance > Math.random()) {
      //  Fire!
      this.bombs.push(new Bomb(invader.x, invader.y + invader.height / 2,
        this.bombMinVelocity + Math.random() * (this.bombMaxVelocity - this.bombMinVelocity)));
    }
  }

  //  Check for bomb/ship collisions.
  for (var i = 0; i < this.bombs.length; i++) {
    var bomb = this.bombs[i];
    if (bomb.x >= (this.ship.x - this.ship.width / 2) && bomb.x <= (this.ship.x + this.ship.width / 2) &&
      bomb.y >= (this.ship.y - this.ship.height / 2) && bomb.y <= (this.ship.y + this.ship.height / 2)) {
      this.bombs.splice(i--, 1);
      game.lives--;
      game.sounds.playSound('explosion');
    }

  }

  //  Check for invader/ship collisions.
  for (var i = 0; i < this.invaders.length; i++) {
    var invader = this.invaders[i];
    if ((invader.x + invader.width / 2) > (this.ship.x - this.ship.width / 2) &&
      (invader.x - invader.width / 2) < (this.ship.x + this.ship.width / 2) &&
      (invader.y + invader.height / 2) > (this.ship.y - this.ship.height / 2) &&
      (invader.y - invader.height / 2) < (this.ship.y + this.ship.height / 2)) {
      //  Dead by collision!
      game.lives = 0;
      game.sounds.playSound('explosion');
    }
  }

  //  Check for failure
  if (game.lives <= 0) {
    game.moveToState(new GameOverState());
  }

  //  Check for victory
  if (this.invaders.length === 0) {
    game.score += this.level * 50;
    game.level += 1;
    game.moveToState(new LevelIntroState(game.level));
  }
  console.dir("Fever:" + fever)
  console.dir("Lymphocytes:" + lymphocytes)
  console.dir("Bacteriophage:" + bacteriophage)
  console.dir("Platelets:" + platelets)
};

PlayState.prototype.draw = function(game, dt, ctx) {

  //  Clear the background.
  ctx.clearRect(0, 0, game.width, game.height);

  //  Draw ship.
  ctx.fillStyle = '#000000';
  ctx.drawImage(playerImage, this.ship.x - (this.ship.width / 2), this.ship.y - (this.ship.height / 2), this.ship.width * 1.85, this.ship.height * 1.85);

  //  Draw invaders.
  let colors = [
    '#0d77bd', // virus
    '#0da353', // bacteria
    '#8a6204', // fungi
    '#820ca6', // parasite
  ]

  // this is an absolutely stupid way to do this but whatever man this is due tmr
  let enemiscales = [
    2.1,
    1.9,
    1.5,
    1.3,
  ]
  for (var i = 0; i < this.invaders.length; i++) {
    var invader = this.invaders[i];
    if (this.level < 5) {
    ctx.drawImage(enemies[enemi[this.level - 1]], invader.x - invader.width / 2, invader.y - invader.height / 2, invader.width * enemiscales[this.level - 1], invader.height * enemiscales[this.level - 1])
    
    } else {
      ctx.drawImage(enemies[enemi[random]], invader.x - invader.width / 2, invader.y - invader.height / 2, invader.width * enemiscales[random], invader.height * enemiscales[random])  
    }
    
    
    //ctx.fillRect(invader.x - invader.width / 2, invader.y - invader.height / 2, invader.width, invader.height);
  }

  //  Draw bombs. ENEMY DARTS
  //ctx.fillStyle = '#00FF00';
  if (this.level < 5) ctx.fillStyle = colors[this.level - 1];
  else ctx.fillStyle = colors[random];
  for (var i = 0; i < this.bombs.length; i++) {
    var bomb = this.bombs[i];
    if (fever != true) {
    ctx.fillRect(bomb.x - 2, bomb.y - 2, 4, 8);
    } else {
      ctx.fillRect(bomb.x - 2, bomb.y - 2, 4, 4);
    }
  }

  //  Draw rockets. YOUR DARTS
  ctx.fillStyle = '#FFEA00'; 
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 1;
  for (var i = 0; i < this.rockets.length; i++) {
    var rocket = this.rockets[i];
    if (lymphocytes != true) { 
    ctx.fillRect(rocket.x, rocket.y - 2, 4, 4);
    ctx.strokeRect(rocket.x, rocket.y - 2, 4, 4);
    } else {
      ctx.fillRect(rocket.x, rocket.y - 2, 6, 8);
      ctx.strokeRect(rocket.x, rocket.y - 2, 6, 8);
    }
  }

  //  Draw info.
  var textYpos = game.gameBounds.bottom + ((game.height - game.gameBounds.bottom) / 2) + 14 / 2;
  ctx.font = "14px Comic Sans MS";
  ctx.fillStyle = '#000000';
  var info = "Lives: " + game.lives;
  ctx.textAlign = "left";
  ctx.fillText(info, game.gameBounds.left, textYpos);
  info = "Score: " + game.score + ", Level: " + game.level;
  ctx.textAlign = "right";
  ctx.fillText(info, game.gameBounds.right, textYpos);
  
  if (fever == true) {
    ctx.drawImage(feverImage, game.gameBounds.right, textYpos - 50, 75, 75);
    ctx.font = "16px Arial Black";
    ctx.fillStyle = '#000000';
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText("Powerup: Fevers reduce enemy dart size and speed!", game.width / 2, game.height / 2 + 180);
    fevertime++
    if (fevertime >= 50 * 10) {
      fever = false
      fevertime = 0
    }
  }
  if (lymphocytes == true) {
    ctx.drawImage(lymphocytesImage, game.gameBounds.right, textYpos - 50, 75, 75);
    ctx.font = "16px Arial Black";
    ctx.fillStyle = '#000000';
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText("Powerup: Lymphocytes make your darts faster and bigger!", game.width / 2, game.height / 2 + 180);
    lymphocytetime++
    if (lymphocytetime >= 50 * 10) {
      lymphocytes = false
      lymphocytetime = 0
    }
  }
  if (bacteriophage == true) {
    if (this.level < 4) enemy = enemi[this.level - 1]
    else enemy = enemi[random]
    console.dir(enemy)
    if (enemy == 'bacteria') {
      ctx.drawImage(bacteriaImage, game.gameBounds.right, textYpos - 50, 75, 75);
      ctx.font = "16px Arial Black";
      ctx.fillStyle = '#000000';
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText("Powerup: Bacteriophage eliminate all bacteria in sight!", game.width / 2, game.height / 2 + 180);
      bacteriophagetime++
      if (bacteriophagetime >= 50 * 3) { // waiting 3 seconds for dramatic effect
        bacteriophage = false
        bacteriophagetime = 0
        game.level += 1;
        game.moveToState(new LevelIntroState(game.level));
        game.score = game.score + 200
      }
    } else bacteriophage = false
  }
  if (platelets == true) {
    // load the image of the platelets in the bottom right corner, right above the score and level text
    ctx.drawImage(plateletsImage, game.gameBounds.right, textYpos - 50, 75, 75);
    ctx.font = "16px Arial Black";
    ctx.fillStyle = '#000000';
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText("Powerup: Platelets replenish your lives!", game.width / 2, game.height / 2 + 180);

    plateletstime++
    if (plateletstime >= 50 * 3) {
      platelets = false
      plateletstime = 0
      game.lives = 3
    }
  }

  //  If we're in debug mode, draw bounds.
  if (this.config.debugMode) {
    ctx.strokeStyle = '#ff0000';
    ctx.strokeRect(0, 0, game.width, game.height);
    ctx.strokeRect(game.gameBounds.left, game.gameBounds.top,
      game.gameBounds.right - game.gameBounds.left,
      game.gameBounds.bottom - game.gameBounds.top);
  }

};

PlayState.prototype.keyDown = function(game, keyCode) {

  if (keyCode == KEY_SPACE) {
    //  Fire!
    this.fireRocket();
  }
  if (keyCode == 80) { // pp
    //  Push the pause state.
    game.pushState(new PauseState());
  }
  // if (keyCode == 87) {// w
  //   game.level += 1;
  //   game.moveToState(new LevelIntroState(game.level));
    
  // }
//   if (keyCode == 83) {// s
//     bacteriophage = true
//   }

};

PlayState.prototype.keyUp = function(game, keyCode) {

};

PlayState.prototype.fireRocket = function() {
  //  If we have no last rocket time, or the last rocket time 
  //  is older than the max rocket rate, we can fire.
  if (this.lastRocketTime === null || ((new Date()).valueOf() - this.lastRocketTime) > (1000 / this.rocketMaxFireRate)) {
    //  Add a rocket.
    if (lymphocytes == true) this.rockets.push(new Rocket(this.ship.x, this.ship.y - 12, this.config.rocketVelocity * 2))
    else this.rockets.push(new Rocket(this.ship.x, this.ship.y - 12, this.config.rocketVelocity));
    this.lastRocketTime = (new Date()).valueOf();

    //  Play the 'shoot' sound.
    game.sounds.playSound('shoot');
  }
};

function PauseState() {

}

PauseState.prototype.keyDown = function(game, keyCode) {

  if (keyCode == 80) {
    //  Pop the pause state.
    game.popState();
  }
};

PauseState.prototype.draw = function(game, dt, ctx) {

  //  Clear the background.
  ctx.clearRect(0, 0, game.width, game.height);

  ctx.font = "14px Comic Sans MS";
  ctx.fillStyle = '#000000';
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("Paused", game.width / 2, game.height / 2);
  return;
};

/*  
    Level Intro State

    The Level Intro state shows a 'Level X' message and
    a countdown for the level.
*/
function LevelIntroState(level) {
  this.level = level;
  this.countdownMessage = "15";
}

LevelIntroState.prototype.update = function(game, dt) {


  // generating a random number from 0-3 here so we can randomize enemies on each level above 5


  //  Update the countdown.
  if (this.countdown === undefined) {
    if (this.level < 5) this.countdown = 15; // start from 15 secs
    else this.countdown = Math.max(3, Math.round(textLines[random2].trim().split(/\s+/).length / 8)); // doing sum intense math here
  }
  this.countdown -= dt;

  this.countdownMessage = Math.round(this.countdown).toString()
  if (this.countdown <= 0) {
    //  Move to the next level, popping this state.
    game.moveToState(new PlayState(game.config, this.level, random));
  }

};

LevelIntroState.prototype.draw = function(game, dt, ctx) {

  //  Clear the background.
  ctx.clearRect(0, 0, game.width, game.height);

  ctx.font = "36px Comic Sans MS";
  ctx.fillStyle = '#000000';
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("Level " + this.level, game.width / 2, game.height / 2 - 70);
  if (this.level == 1) {
    ctx.fillText("\"Virus\"", game.width / 2, game.height / 2 - 15);
    var txt = 'Some people consider this as a living organism, some do not. \nViruses mostly consist of genetic material of either RNA or DNA inside a protein \ncoating with some extra elements. They replicate by infecting other cells, hijacking the \ncell so that the cell will produce more viruses to host more cells. \nOne type of virus, the retrovirus, uses an enzyme called reverse transcriptase to \nconvert its RNA genetic information into DNA to be integrated into the host cell\'s \ngenome so the cell produces more retroviruses.';
    var x = game.width / 2;
    var y = game.height / 2 + 20;
    var lineheight = 20;
    var lines = txt.split('\n');
    ctx.font = "bold 13px Comic Sans MS";
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, y + (i * lineheight));
    }
    
  ctx.font = "24px Comic Sans MS";
  ctx.fillText("Ready in " + this.countdownMessage, game.width / 2, game.height / 2 + 170);
  }
  else if (this.level == 2) {
    ctx.fillText("New Enemy Discovered: \"Bacteria\"", game.width / 2, game.height / 2 - 15);
    var txt = 'Bacteria are small prokaryote organisms that are vast \nin their properties and environments. Some live in extreme environments, \nsome live in our human bodies, and some on tables. \nThey evolved in various shapes and some are good bacteria for us or \npathogenic to us. Over our medical history we\'ve used antibiotics \nand bacteriophages to fight off dangerous bacterial infections.';
    var x = game.width / 2;
    var y = game.height / 2 + 20;
    var lineheight = 20;
    var lines = txt.split('\n');
    ctx.font = "bold 13px Comic Sans MS";
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, y + (i * lineheight));
    }
    
  ctx.font = "24px Comic Sans MS";
  ctx.fillText("Ready in " + this.countdownMessage, game.width / 2, game.height / 2 + 170);
  }
  else if (this.level == 3) {
    ctx.fillText("New Enemy Discovered: \"Fungi\"", game.width / 2, game.height / 2 - 15);
    var txt = 'Fungi are a type of eukaryotic organism that are more \nunique in how they survive throughout their life cycle. They get their energy and \nresources from surrounding organic materials whether that be from decomposing \norganic matter or taking it from a host. They can reproduce \nasexually and sexually through releasing spores which can be airborne.\n\nFungi can take multiple hits before dying';
    var x = game.width / 2;
    var y = game.height / 2 + 20;
    var lineheight = 20;
    var lines = txt.split('\n');
    ctx.font = "bold 13px Comic Sans MS";
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, y + (i * lineheight));
    }
    
  ctx.font = "24px Comic Sans MS";
  ctx.fillText("Ready in " + this.countdownMessage, game.width / 2, game.height / 2 + 170);
  }
  else if (this.level == 4) {
    ctx.fillText("New Enemy Discovered: \"Parasites\"", game.width / 2, game.height / 2 - 15);
    var txt = 'Parasites are organisms of a variety of different kinds that \nessentially feed off another organism harming the host for its own benefit. \nThis could be an animal like nematodes or protozoa. This type of relationship or symbiosis \nis usually referred to as parasitism.\n\nParasites debuff your shooting frequency';
    var x = game.width / 2;
    var y = game.height / 2 + 20;
    var lineheight = 20;
    var lines = txt.split('\n');
    ctx.font = "bold 13px Comic Sans MS";
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, y + (i * lineheight));
    }
    
  ctx.font = "24px Comic Sans MS ";
  ctx.fillText("Ready in " + this.countdownMessage, game.width / 2, game.height / 2 + 170);
  }
  else if (this.level == 5){
    var txt = 'The levels here on out repeat with the same enemies introduced before. \nDifficulty will increase each level! \n\nGood luck!';
    var x = game.width / 2;
    var y = game.height / 2 - 30;
    var lineheight = 20;
    var lines = txt.split('\n');
    ctx.font = "bold 16px Comic Sans MS";
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, y + (i * lineheight));
  }
  ctx.font = "24px Comic Sans MS";
  ctx.fillText("Ready in " + this.countdownMessage, game.width / 2, game.height / 2 + 70);

  } else {
    let offset;
    var txt = textLines[random2]
    var x = game.width / 2;
    var y = game.height / 2 - 30;
    var lineheight = 20;
    var lines = txt.split('\n');
    ctx.font = "bold 16px Comic Sans MS";
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, y + (i * lineheight));
      if (i+1 == lines.length) {
        offset = (i * lineheight) + 30
      }
    }
    ctx.font = "24px Comic Sans MS";
    ctx.fillText("Ready in " + this.countdownMessage, game.width / 2, game.height / 2 + offset);
  }
  return;
};


/*
 
  Ship

  The ship has a position and that's about it.

*/
function Ship(x, y) {
  this.x = x;
  this.y = y;
  this.width = 20;
  this.height = 16;
}

/*
    Rocket

    Fired by the ship, they've got a position, velocity and state.

    */
function Rocket(x, y, velocity) {
  this.x = x;
  this.y = y;
  this.velocity = velocity;
}

/*
    Bomb

    Dropped by invaders, they've got position, velocity.

*/
function Bomb(x, y, velocity) {
  this.x = x;
  this.y = y;
  this.velocity = velocity;
}

/*
    Invader 

    Invader's have position, type, rank/file and that's about it. 
*/

function Invader(x, y, rank, file, type) {
  this.x = x;
  this.y = y;
  this.rank = rank;
  this.file = file;
  this.type = type;
  this.width = 18;
  this.height = 14;
}

/*
    Game State

    A Game State is simply an update and draw proc.
    When a game is in the state, the update and draw procs are
    called, with a dt value (dt is delta time, i.e. the number)
    of seconds to update or draw).

*/
function GameState(updateProc, drawProc, keyDown, keyUp, enter, leave) {
  this.updateProc = updateProc;
  this.drawProc = drawProc;
  this.keyDown = keyDown;
  this.keyUp = keyUp;
  this.enter = enter;
  this.leave = leave;
}

/*

    Sounds

    The sounds class is used to asynchronously load sounds and allow
    them to be played.

*/
function Sounds() {

  //  The audio context.
  this.audioContext = null;

  //  The actual set of loaded sounds.
  this.sounds = {};
}

Sounds.prototype.init = function() {

  //  Create the audio context, paying attention to webkit browsers.
  context = window.AudioContext || window.webkitAudioContext;
  this.audioContext = new context();
  this.mute = true;
};

Sounds.prototype.loadSound = function(name, url) {

  //  Reference to ourselves for closures.
  var self = this;

  //  Create an entry in the sounds object.
  this.sounds[name] = null;

  //  Create an asynchronous request for the sound.
  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.responseType = 'arraybuffer';
  req.onload = function() {
    self.audioContext.decodeAudioData(req.response, function(buffer) {
      self.sounds[name] = { buffer: buffer };
    });
  };
  try {
    req.send();
  } catch (e) {
    console.log("An exception occured getting sound the sound " + name + " this might be " +
      "because the page is running from the file system, not a webserver.");
    console.log(e);
  }
};

Sounds.prototype.playSound = function(name) {

  //  If we've not got the sound, don't bother playing it.
  if (this.sounds[name] === undefined || this.sounds[name] === null || this.mute === true) {
    return;
  }

  //  Create a sound source, set the buffer, connect to the speakers and
  //  play the sound.
  var source = this.audioContext.createBufferSource();
  source.buffer = this.sounds[name].buffer;
  source.connect(this.audioContext.destination);
  source.start(0);
};






/* 

To do:


Link to source sheet

*/
