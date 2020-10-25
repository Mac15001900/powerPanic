// add the following to the scene update method prevent playing before the game starts
// if(gameStatus !== GS.GAME_STARTED)

const DIRECTION = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3,
};

const DIMS = {
  STEPS_X: 44,
  STEPS_Y: 33
}


var SceneSnake = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize:

  function SceneSnake () {
    Phaser.Scene.call(this, { key: 'SceneSnake' });
    this.icon;
    this.backKey;
    this.spaceKey;

    this.snake;
    this.food;
    this.cursors;
  },

  preload: function () {
    console.log('Preload in snake');
    this.load.image('background', 'assets/deep-space.jpg');
    this.load.image('snake-icon', 'assets/icon-snake.png');
    this.load.image('foodBlue', 'assets/blue-particle.png');
    this.load.image('foodGreen', 'assets/green-orb.png');
    this.load.image('body', 'assets/body2.png');
    this.load.image('power-icon', 'assets/powerupBlue_bolt.png')
    /*
    this.load.image('power-icon', 'assets/powerupBlue_bolt.png');
    this.load.image('confusion', 'assets/confusion.png');
    */
  },

  create: function () {
    this.speedKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    var powerIcon = this.add.image(32,CANVAS_HEIGHT-16,'power-icon');
    powerIcon.depth = 5;
    this.powerBar = this.add.graphics();
    // 512 x 512
    var background = this.add.image(64, 64, 'background').setOrigin(0);
    background.setSize(672, 472);
    background.setDisplaySize(672, 472);
    background.depth = -10;

    /*
    this.confusion = this.add.image(0, 0, 'confusion').setOrigin(0);
    this.confusion.depth = 9001;
    this.confusion.setVisible(false);
    */

    var text = this.add.text(200, 0, '', { font: "28px Arial", fill: "#19de65" });
    text.text = 'Your power is becoming worrisome!';
    this.icon = this.add.image(32,32,'snake-icon');
    this.icon.scaleX = 1 / 8;
    this.icon.scaleY = 1 / 8;
    this.backKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACEBAR);

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
        this.heading = DIRECTION.RIGHT;
        this.direction = DIRECTION.RIGHT;
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
            .Wrap(this.headPosition.x - 1, 4, 44);
          break;

          case DIRECTION.RIGHT:
          this.headPosition.x = Phaser.Math
            .Wrap(this.headPosition.x + 1, 4, 44);
          break;

          case DIRECTION.UP:
          this.headPosition.y = Phaser.Math
            .Wrap(this.headPosition.y - 1, 4, 33);
          break;

          case DIRECTION.DOWN:
          this.headPosition.y = Phaser.Math
            .Wrap(this.headPosition.y + 1, 4, 33);
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
          //this.speed -= 5;
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

          //  For every 5 items of food eaten we'll increase the snake speed a little
          if (this.speed > 20 && food.total % 5 === 0) {
            this.speed -= 5;
          }
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
          console.log(grid[by][bx]);
          grid[by][bx] = false;
        });
        return grid;
      }

    });

    this.food = new Food(this, 16, 18);

    this.snake = new Snake(this, 8, 8);

    //  Create our keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();

  },

  update: function (timestep, dt) {
    if(this.backKey.isDown){
      console.log('Switching back to menu');
      this.scene.start('SceneStart');
      switchToScene(this,'SceneStart');
    }
    if(gameStatus !== GS.GAME_STARTED && !DEBUG_IGNORE_GAME_STATE) return;

    if (!this.snake.alive) {
      this.scene.restart();
    }
    if (this.cursors.left.isDown) {
      this.snake.faceLeft();
    } else if (this.cursors.right.isDown) {
      this.snake.faceRight();
    } else if (this.cursors.up.isDown) {
      console.log('Trying to go up');
      this.snake.faceUp();
    } else if (this.cursors.down.isDown) {
      this.snake.faceDown();
    }
    if(this.speedKey.isDown) {
      power -= 20*dt/1000;
      this.snake.speed = 30;
      if(!this.cameras.main.shakeEffect.isRunning) this.cameras.main.shakeEffect.start(100,.005,.005);
    }
    else this.snake.speed = 100;
    if (this.snake.update(timestep)) {
      //  If the snake updated, we need to check for collision against food
      if (this.snake.collideWithFood(this.food)) {
        this.repositionFood();
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

    for (let y = 4; y < 30; y++) {
      for (let x = 4; x < 40; x++) {
        if (testGrid[y][x] === true) {
          //  Is this position valid for food? If so, add it here ...
          validLocations.push({ x: x, y: y });
        }
      }
    }

    console.log(validLocations);

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
