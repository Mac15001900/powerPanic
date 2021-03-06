const DIRECTION = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3,
  RANDOM: ()=>Math.floor(Math.random()*4),
};

const DIMS = {
  STEPS_X: 46,
  STEPS_Y: 33
}


var SceneNavigation = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize:

  function SceneNavigation () {
    Phaser.Scene.call(this, { key: 'SceneNavigation' });
    this.icon;
    this.backKey;
    this.speedKey;

    this.snake;
    this.food;
    this.cursors;
  },

  preload: function () {
    console.log('Preload in snake');
    this.load.image('snake-icon', 'assets/icon-navigation.png');
    this.load.image('foodBlue', 'assets/blue-particle.png');
    this.load.image('foodGreen', 'assets/green-orb.png');
    this.load.image('body', 'assets/body4.png');
    this.load.image('star-particle', 'assets/snake_speed.png');
    this.load.image('power-icon', 'assets/powerupBlue_bolt.png');
    this.load.image('speed-button', 'assets/speedometer-greener.png');

    this.load.image('deep-space-background', 'assets/deep-space.jpg');
    this.load.image('icon-back', 'assets/icon-back.png');
  },

  create: function () {
    var powerIcon = this.add.image(32,CANVAS_HEIGHT-16,'power-icon');
    powerIcon.depth = 5;
    this.powerBar = this.add.graphics();
    // 512 x 512
    var background = this.add.image(64, 64, 'deep-space-background').setOrigin(0);
    background.setSize(672, 472);
    background.setDisplaySize(672, 472);
    background.depth = -10;

    var speedParticles = this.add.particles('star-particle');
    this.speedEmitter = speedParticles.createEmitter({
      speed: 500,
      scale: { start: 0.05, end: 0 },
      blendMode: 'ADD',
      tint: 0x00ff00,      
      on: false,
    });

    //Speed button
    this.speedButton = this.add.image(CANVAS_WIDTH-64, CANVAS_HEIGHT-64, 'speed-button');
    this.speedButton.depth = 5;
    this.speedButton.alpha = 0.75;

    //Instructions
    var instructionsText = 'You are the navigation expert.\n\nYour job is to scan the area around the ship and find regions without asteroids (the green circles). '+
      "Use the arrow keys or W,A,S,D to choose the direction in which to scan.\n\n"+
      "Sadly the sensor software is a bit buggy and will crash if you scan the same area twice, making the pilot blind for a few seconds. "+
      "Make sure to warn them if that's about to happen!\n\n"+
      "As with all stations, you need to prevent navigation from overloading by using up power. You can do this by holding spacebar to speed up scanning.\n\n"+
      "\nWaiting for the pilot to start the game...";
    
    this.instructionScreen = new InstructionScreen(this, instructionsText, 'deep-space-background', 'icon-back', 9000, 1.6);


    this.icon = this.add.image(32,32,'snake-icon');
    this.backKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.speedKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);


    var Food = new Phaser.Class({

      Extends: Phaser.GameObjects.Image,

      initialize:

      function Food (scene, x, y) {
        Phaser.GameObjects.Image.call(this, scene);
        this.setTexture('foodGreen');
        this.setPosition(x * 16, y * 16);
        this.setOrigin(0);
        this.setScale(1/16);
        this.total = 0;
        scene.children.add(this);
      },

      eat: function () {
        this.total++;
      }

    });

    var Snake = new Phaser.Class({

      initialize:

      function Snake (scene, x, y) {
        this.headPosition = new Phaser.Geom.Point(x, y);
        this.body = scene.add.group();
        this.head = this.body.create(x * 16, y * 16, 'body');
        this.head.setOrigin(0);
        this.alive = true;
        this.speed = 100;
        this.moveTime = 0;
        this.tail = new Phaser.Geom.Point(x, y);
        this.heading = DIRECTION.RANDOM();
        this.direction = this.heading;
        this.sceneRef = scene;
      },

      update: function (time) {
        if (time >= this.moveTime) {
          return this.move(time);
        }
      },

      faceLeft: function () {
        if (this.direction === DIRECTION.UP || this.direction === DIRECTION.DOWN) {
          this.heading = DIRECTION.LEFT;
        }
      },

      faceRight: function () {
        if (this.direction === DIRECTION.UP || this.direction === DIRECTION.DOWN) {
          this.heading = DIRECTION.RIGHT;
        }
      },

      faceUp: function () {
        if (this.direction === DIRECTION.LEFT || this.direction === DIRECTION.RIGHT) {
          this.heading = DIRECTION.UP;
        }
      },

      faceDown: function () {
        if (this.direction === DIRECTION.LEFT || this.direction === DIRECTION.RIGHT) {
          this.heading = DIRECTION.DOWN;
        }
      },

      move: function (time, scene) {
        switch (this.heading) {
          case DIRECTION.LEFT:
          this.headPosition.x = Phaser.Math
            .Wrap(this.headPosition.x - 1, 4, DIMS.STEPS_X);
          break;

          case DIRECTION.RIGHT:
          this.headPosition.x = Phaser.Math
            .Wrap(this.headPosition.x + 1, 4, DIMS.STEPS_X);
          break;

          case DIRECTION.UP:
          this.headPosition.y = Phaser.Math
            .Wrap(this.headPosition.y - 1, 4, DIMS.STEPS_Y);
          break;

          case DIRECTION.DOWN:
          this.headPosition.y = Phaser.Math
            .Wrap(this.headPosition.y + 1, 4, DIMS.STEPS_Y);
          break;
        }

        this.direction = this.heading;

        //this.body.create(this.tail.x, this.tail.y, 'body').setOrigin(0);

        this.grow();

        //  Update the body segments and place the last coordinate into this.tail
        Phaser.Actions.ShiftPosition(this.body.getChildren(), this.headPosition.x * 16, this.headPosition.y * 16, 1, this.tail);

        //  Check to see if any of the body pieces have the same x/y as the head
        //  If they do, the head ran into the body

        var hitBody = Phaser.Actions.GetFirst(this.body.getChildren(), { x: this.head.x, y: this.head.y }, 1);

        if (hitBody) {
          sendMessage('snakeDies',{});
          console.log('dead');
          this.alive = false;

          return false;
        } else {
          //  Update the timer ready for the next movement
          this.moveTime = time + this.speed;
          return true;
        }
      },

      grow: function () {
        var newPart = this.body.create(this.tail.x, this.tail.y, 'body');
        newPart.setOrigin(0);
      },

      collideWithFood: function (food) {
        if (this.head.x === food.x && this.head.y === food.y) {
          // this.grow();

          food.eat();
          sendMessage('snakeEats',{});

          return true;
        } else {
          return false;
        }
      },

      updateGrid: function (grid) {
        //  Remove all body pieces from valid positions list
        this.body.children.each(function (segment) {
          var bx = Math.floor(segment.x / 16);
          var by = Math.floor(segment.y / 16);
          //console.log(grid[by][bx]);
          grid[by][bx] = false;
        });
        return grid;
      }

    });

    this.food = new Food(this, 0, 0);
    this.snake = new Snake(this, 24, 18);

    this.repositionFood();
    this.speedEmitter.startFollow(this.snake.head);

    //Handle steering with a mouse/touch
    this.input.on('pointerdown', function (pointer) {
      this.lastPress = this.time.now;
      if(Phaser.Math.Distance.BetweenPoints(pointer.position, this.speedButton) <= 80){
        this.speedPressed = true;
      }
      else if(this.snake.direction === DIRECTION.RIGHT ||this.snake.direction === DIRECTION.LEFT){
        if(pointer.y > CANVAS_HEIGHT/2) this.snake.faceDown();
        else this.snake.faceUp();
      }else {
        if(pointer.x > CANVAS_WIDTH/2) this.snake.faceRight();
        else this.snake.faceLeft();
      }
    }, this);
    this.input.on('pointermove', function (pointer) {
      if(!pointer.isDown) return;
      var oldDistance = Phaser.Math.Distance.BetweenPoints(pointer.prevPosition, this.speedButton);
      var newDistance = Phaser.Math.Distance.BetweenPoints(pointer.position, this.speedButton);
      if(oldDistance <= 80 && newDistance > 80) this.speedPressed = false;
      else if(newDistance <= 80 && oldDistance > 80) this.speedPressed = true;;
         
    }, this);
    this.input.on('pointerup', function (pointer) {
      if(Phaser.Math.Distance.BetweenPoints(pointer.position, this.speedButton) <= 80) this.speedPressed=false;
    }, this);
    

  },

  update: function (timestep, dt) {
    if(this.backKey.isDown){
        switchToScene(this,'SceneStart');
      }
    if(g.gameStatus !== GS.GAME_STARTED && !g.debug.ignore_game_state) return;
    else this.instructionScreen.hide();

    this.speedButton.setVisible(timestep - this.lastPress < 7000);

    if (!this.snake.alive) {
      this.scene.restart();
    }
    if (this.cursors.left.isDown || this.leftKey.isDown) {
      this.snake.faceLeft();
    } else if (this.cursors.right.isDown || this.rightKey.isDown) {
      this.snake.faceRight();
    } else if (this.cursors.up.isDown || this.upKey.isDown) {
      this.snake.faceUp();
    } else if (this.cursors.down.isDown || this.downKey.isDown) {
      this.snake.faceDown();
    }
    if(this.speedKey.isDown || this.speedPressed) {
      power -= 20*dt/1000;
      if(power<0) power = 0;
      this.snake.speed = 30;
      this.speedEmitter.on = true;
      if(!this.cameras.main.shakeEffect.isRunning) this.cameras.main.shakeEffect.start(100,.005,.005);
    }
    else {
      this.snake.speed = 100;
      this.speedEmitter.on = false;
    }
    if (this.snake.update(timestep)) {
      //  If the snake updated, we need to check for collision against food
      if (this.snake.collideWithFood(this.food)) {
        if(!this.repositionFood()){
          //No valid spaces to place food, i.e. everything is snake TODO something fancy?
          power = 0;
          this.scene.restart();
        }
      }
    }

    power += 5*dt/1000;
    this.powerBar.clear();
    this.powerBar.fillStyle(0x5555ff, 1);
    this.powerBar.fillRect(16, CANVAS_HEIGHT-power*5 - 16, 32, power*5);
    if(power > 100) endGame('Navigation has exploded');
  },

  receiveMessage: function (data) {
    console.log(data);
  },

  repositionFood: function() {
    //  First create an array that assumes all positions
    //  are valid for the new piece of food

    //  A Grid we'll use to reposition the food each time it's eaten
    var testGrid = [];

    for (let y = 0; y < 33; y++) {
      testGrid[y] = [];
      for (let x = 0; x < 46; x++) {
        testGrid[y][x] = true;
      }
    }

    this.snake.updateGrid(testGrid);

    //  Purge out false positions
    var validLocations = [];

    for (let y = 4; y < 33; y++) {
      for (let x = 4; x < 46; x++) {
        if (testGrid[y][x] === true) {
          //  Is this position valid for food? If so, add it here ...
          validLocations.push({ x: x, y: y });
        }
      }
    }

    //console.log(validLocations);

    if (validLocations.length > 0) {
      //  Use the RNG to pick a random food position
      var pos = Phaser.Math.RND.pick(validLocations);

      //  And place it
      this.food.setPosition(pos.x * 16, pos.y * 16);

      return true;
    }
    else {
      return false;
    }
  },

});
