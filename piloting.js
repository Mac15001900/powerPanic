var ScenePiloting = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function ScenePiloting () {
        Phaser.Scene.call(this, { key: 'ScenePiloting' });
        this.icon;
        this.backKey;
        this.testKey;
        this.forwardKey;
        this.backKey;
        this.leftKey;
        this.rightKey;
    },

    preload: function () {
        console.log('Preload in piloting');
        this.load.image('pilot-icon', 'assets/icon-pilot.png');
        this.load.image('ship', 'assets/ship.png');
        this.load.image('friendly-ship', 'assets/ship-green.png');
        this.load.image('exhaust-particle', 'assets/blue-particle.png');
        this.load.image('explosion-particle', 'assets/red-particle.png');

        this.load.image('meteor-big-1', 'assets/meteorBrown_big1.png');
        this.load.image('meteor-big-2', 'assets/meteorBrown_big2.png');
        this.load.image('meteor-big-3', 'assets/meteorBrown_big3.png');
        this.load.image('meteor-big-4', 'assets/meteorBrown_big4.png');
        this.load.image('meteor-medium-1', 'assets/meteorBrown_med1.png');
        this.load.image('meteor-medium-2', 'assets/meteorBrown_med2.png');
        this.load.image('meteor-small-1', 'assets/meteorBrown_small1.png');
        this.load.image('meteor-small-2', 'assets/meteorBrown_small2.png');

        this.load.image('background', 'assets/black-stars.png');
        this.load.image('laser', 'assets/laserBlue01.png');
        this.load.image('confusion', 'assets/confusion.png');
        this.load.image('missle', 'assets/spaceMissiles_003.png');

        this.load.image('health-icon', 'assets/powerupRed_shield.png');
        this.load.image('frienship-icon', 'assets/ship-green-mini.png');
        this.load.image('power-icon', 'assets/powerupBlue_bolt.png');



    },

    params: {
        ENGINE_POWER: 100,
        ROTATION_SPEED: 0.005,
        EXHAUST_SPREAD: 20,
        MAX_ASTEROIDS: 10,
        BASIC_COOLDOW: 250,
        BULLET_SPEED: 1000,
        BULLET_RECOIL: 10,
        MAX_FRIENDLY: 15,
        EXTRA_FRIENDLY: 10,
        FRIENDLY_SPEED: 50,
        FRIENDLY_SIDE_SPEED: 25,
        ASTEROID_SPAWN_COOLDOWN: 700,
        FRIENDLY_SPAWN_COOLDOWN: 1000,
        MISSLE_TIME: 500,
        MISSLE_SPEED: 500,
        MISSLE_RADIUS: 200,
        FRIENSHIP_LOSS_ON_KILL: 10,
        FRIENSHIP_LOSS_ON_MISS: 1,
        ASTEROID_DAMAGE: 10,
        POWER_GAIN: 3,
        POWER_USAGE: 6,
        SHIP_EFFECT_TIME: 7500,
        ASTEROID_EFFECT_TIME: 3000,
    },

    effects: {
        shipAmount: 0,
        shipTimeLeft: 0,
        asteroidAmount: 0,
        asteroidTimeLeft: 0,
        confisionLeft: 0,
        missleActive: false,
        missleTimer: 0,
    },

    create: function () {
        this.background = this.add.image(0, 0, 'background').setOrigin(0).setScale(4);
        this.background.depth = 100;

        this.confusion = this.add.image(0, 0, 'confusion').setOrigin(0);
        this.confusion.depth = 9001;
        this.confusion.setVisible(false);

        this.instrutions = this.add.text(20, 64, '', { font: "24px Arial", fill: "#19de65" });
        this.instrutions.depth = 101;        

        this.instrutions.text = "You are in the pilots seat\n"
            + "Your job is to pilot the ship, making sure it survives and doesn't cause\ntoo many casualties.\n"
            + "You can move with W,A,S,D and shoot with Spacebar\n"
            + "Using your thrusters also gets rid of power.\n"
            + "Your teammates' actions will affect your situation, make sure you\ncommunicate with them!\n"
            + "When your teammates are ready, press Spacebar to start the game\n\n"
            + "Good luck.";
            //+ "\n"

        var createKey =  function(scene, key){
                return scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[key]);
            };

        this.icon = this.add.image(32,32,'pilot-icon');
        this.icon.scaleX = 1/8;
        this.icon.scaleY = 1/8;
        this.backKey = createKey(this,'ESC');
        this.forwardKey = createKey(this,'W');
        this.backwardsKey = createKey(this,'S');
        this.leftKey = createKey(this,'A');
        this.rightKey = createKey(this,'D');
        this.fireKey = createKey(this,'SPACE');

        this.ship = this.physics.add.sprite(CANVAS_HEIGHT/2,CANVAS_WIDTH/2,'ship');
        this.ship.body.angularDrag = 0;
        this.ship.body.bounceX = 1;
        this.ship.body.bounceY = 1;
        this.ship.body.collideWorldBounds = true;
        this.ship.body.dragX = 6;
        this.ship.body.dragY = 6;
        this.ship.depth = 10;
        this.ship.setScale(0.5);

        this.input.keyboard.on('keyup', function (event) {
            switch(event.key){
                case 't': sendMessage('test','This is the captain speaking.'); break;
                case 'm': sendMessage('missle');

            }
        });
        console.log(this.ship);

        //Exhaust
        var particles = this.add.particles('exhaust-particle');

        this.emitter = particles.createEmitter({
            speed: 500,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            angle: { min: 90+45, max: 90+45 },
        });
        this.emitter.on = false;
        this.emitter.changeDirection = function (newDirection, spread) {
            this.angle.start = newDirection-spread;
            this.angle.end   = newDirection+spread;
        };
        this.emitter.startFollow(this.ship);
        console.log(this.emitter);

        var explosionParticles = this.add.particles('explosion-particle');

        this.explosionEmitter = explosionParticles.createEmitter({
            speed: 500,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
        });
        this.explosionEmitter.setFrequency(-1,500);
        this.explosionEmitter.setLifespan(500);

        this.explosionSprite = this.physics.add.sprite(CANVAS_HEIGHT/2,CANVAS_WIDTH/2,'explosion-particle');
        this.explosionSprite.depth = 5;
        this.explosionSprite.setScale(3);
        this.explosionSprite.setVisible(false);

        this.missle = this.physics.add.sprite(0,0,'missle');
        this.missle.setVisible(false);
        this.missle.setBounce(1);
        this.missle.setCollideWorldBounds(true);



        this.asteroids = this.physics.add.group();
        this.bullets = this.physics.add.group();
        this.friendly = this.physics.add.group();

        this.physics.add.overlap(this.bullets, this.asteroids, this.hitAsteroid, null, this);
        this.physics.add.overlap(this.bullets, this.friendly, this.hitFriendly, null, this);
        this.physics.add.overlap(this.ship, this.asteroids, this.hitShip, null, this);

        this.laserCooldown = 0;
        this.asteroidSpawnCooldown = this.params.ASTEROID_SPAWN_COOLDOWN;
        this.friendlySpawnCooldown = this.params.FRIENDLY_SPAWN_COOLDOWN;

        this.heathBar = this.add.graphics();
        this.frienshipBar = this.add.graphics();
        this.powerBar = this.add.graphics();

        this.add.image(32,CANVAS_HEIGHT-16,'health-icon');
        this.add.image(32+48,CANVAS_HEIGHT-16,'frienship-icon');
        this.add.image(32+48*2,CANVAS_HEIGHT-16,'power-icon');

        this.heath = 100;
        this.frienship = 100;
        this.power = 0;
    },

    hitAsteroid: function(bullet, asteroid){
        this.killAsteroid(asteroid);
        this.bullets.remove(bullet,true, true);
    },

    killAsteroid: function(asteroid){
        this.asteroids.remove(asteroid,true, true);
    },

    hitFriendly: function(bullet, target){
        this.bullets.remove(bullet, true, true);
        this.killFriendly(target);
    },

    killFriendly: function(target){
        console.log('Friendy ship killed :(');
        this.frienship -= 10;
        this.friendly.remove(target, true, true);
    },

    hitShip: function(ship, asteroid){
        this.killAsteroid(asteroid);
        this.heath -= this.params.ASTEROID_DAMAGE;
    },

    pickPositionsNearEdge: function(distance){
        var x, y;
        var side = Math.ceil(Math.random()*4);
        switch(side){
            case 1:
                x = Math.random() * (CANVAS_WIDTH - distance*2) + distance;
                y = distance;
                break;
            case 2:
                x = distance ;
                y = Math.random() * (CANVAS_HEIGHT - distance*2) + distance;
                break;
            case 3:
                x = Math.random() * (CANVAS_WIDTH - distance*2) + distance;
                y = CANVAS_HEIGHT - distance;
                break;
            case 4:
                x = CANVAS_WIDTH - distance ;
                y = Math.random() * (CANVAS_HEIGHT - distance*2) + distance;
                break;
        }
        return {x: x, y: y};
    },

    isOutOfBounds: function(pos,margin){
         return pos.x<-margin || pos.x>CANVAS_WIDTH+margin || pos.y<-margin || pos.y>CANVAS_HEIGHT+margin;
    },

    distanceBetween: function(p1,p2){
        return Math.sqrt(Math.pow(p1.x-p2.x,2) + Math.pow(p1.y-p2.y,2));
    },

    update: function (timestep, dt) {
        if(this.backKey.isDown){
            console.log('Switching back to menu');
            switchToScene(this,'SceneStart');
        }
        if(gameStatus !== GS.GAME_STARTED && !DEBUG_IGNORE_GAME_STATE) {
            if(this.fireKey.isDown && gameStatus === GS.CONNECTED){
                sendMessage('startGame',{});
                gameStatus === GS.GAME_STARTED;
            }
            return;
        }

        this.instrutions.setVisible(false);
        this.background.depth = -10;

        var body = this.ship.body;
        var xDirection =  Math.sin(this.ship.rotation);
        var yDirection = -Math.cos(this.ship.rotation);


        var acceleration = 0;
        if(this.forwardKey.isDown) acceleration++;
        //if(this.backwardsKey.isDown) acceleration--;

        body.acceleration.x = acceleration*xDirection*this.params.ENGINE_POWER;
        body.acceleration.y = acceleration*yDirection*this.params.ENGINE_POWER;

        if(this.forwardKey.isDown){
            if(!this.cameras.main.shakeEffect.isRunning) this.cameras.main.shakeEffect.start(100,.005,.005);

            this.power -= this.params.POWER_USAGE * dt/1000;
            if(this.power<=0) this.power=0;
        }
        this.emitter.on = this.forwardKey.isDown;
            
        var rotation = 0;
        if(this.leftKey.isDown) rotation--;
        if(this.rightKey.isDown) rotation++;

        this.ship.rotation += rotation * this.params.ROTATION_SPEED * dt;
        this.emitter.changeDirection(this.ship.body.rotation+90, this.params.EXHAUST_SPREAD);

        //Asteroids
        if(this.asteroids.getLength() < this.params.MAX_ASTEROIDS && this.asteroidSpawnCooldown<0){
            this.asteroidSpawnCooldown = this.params.ASTEROID_SPAWN_COOLDOWN;
            var chance = 0.5;
            if(this.effects.shipAmount > 0) chance = 1;
            else if(this.effects.shipAmount < 0) chance = 0.25;
            
            if(Math.random() > 1-chance){                
                var pos = this.pickPositionsNearEdge(10);
                this.asteroids.add(this.physics.add.sprite(pos.x,pos.y,'meteor-big-1'));
                var newAsteroid = this.asteroids.children.entries[this.asteroids.children.entries.length-1];
                newAsteroid.setVelocity(Math.random()*100, Math.random()*100);
                newAsteroid.setBounce(1, 1);
                newAsteroid.setCollideWorldBounds(true);
            }
        }

        if(this.fireKey.isDown && this.laserCooldown <= 0){
            this.laserCooldown = this.params.BASIC_COOLDOW;   
            this.bullets.add(this.physics.add.sprite(this.ship.x + xDirection*10,this.ship.y + yDirection*10,'laser'));
            var newBullet = this.bullets.children.entries[this.bullets.children.entries.length-1];;
            newBullet.rotation = this.ship.rotation;
            newBullet.setVelocity(this.params.BULLET_SPEED * xDirection, this.params.BULLET_SPEED *yDirection)
            
            if(!this.cameras.main.shakeEffect.isRunning) this.cameras.main.shakeEffect.start(this.laserCooldown/2,.005,.005);

            this.ship.body.velocity.x -= xDirection * this.params.BULLET_RECOIL;
            this.ship.body.velocity.y -= yDirection * this.params.BULLET_RECOIL;       

        }

        var capChange = 0;
        if(this.effects.shipAmount >0) capChange += this.params.EXTRA_FRIENDLY;
        if(this.effects.shipAmount <0) capChange -= this.params.EXTRA_FRIENDLY/2;
        if(this.friendly.getLength() <= this.params.MAX_FRIENDLY+capChange && this.friendlySpawnCooldown < 0 ){
            this.friendlySpawnCooldown = this.params.FRIENDLY_SPAWN_COOLDOWN;
            var x,y,dx,dy,rot;
            var side = Math.ceil(Math.random()*4);
            var distance = -50;
            switch(side){
                case 1:
                    x = Math.random() * (CANVAS_WIDTH - distance*2) + distance;
                    y = distance;
                    dx = (Math.random()-0.5) * this.params.FRIENDLY_SIDE_SPEED;
                    dy = this.params.FRIENDLY_SPEED;
                    rot = Math.PI;
                    break;
                case 2:
                    x = distance ;
                    y = Math.random() * (CANVAS_HEIGHT - distance*2) + distance;
                    dx = this.params.FRIENDLY_SPEED;
                    dy = (Math.random()-0.5) * this.params.FRIENDLY_SIDE_SPEED;
                    rot = Math.PI*.5;
                    break;
                case 3:
                    x = Math.random() * (CANVAS_WIDTH - distance*2) + distance;
                    y = CANVAS_HEIGHT - distance;
                    dx = (Math.random()-0.5) * this.params.FRIENDLY_SIDE_SPEED;
                    dy = -this.params.FRIENDLY_SPEED;
                    rot = 0;
                    break;
                case 4:
                    x = CANVAS_WIDTH - distance ;
                    y = Math.random() * (CANVAS_HEIGHT - distance*2) + distance;
                    dx = -this.params.FRIENDLY_SPEED;
                    dy = (Math.random()-0.5) * this.params.FRIENDLY_SIDE_SPEED;
                    rot = Math.PI*1.5;
                    break;
            }
            this.friendly.add(this.physics.add.sprite(x,y,'friendly-ship'));
            var newShip = this.friendly.children.entries[this.friendly.children.entries.length-1];
            newShip.setScale(1/2);
            newShip.setVelocity(dx,dy);
            newShip.rotation = rot;
        }

        for (var i = 0; i < this.friendly.getLength(); i++) {
            if(this.isOutOfBounds(this.friendly.children.entries[i], 400)){
                this.friendly.remove(this.friendly.children.entries[i],true,true);
            }
        }

        for (var i = 0; i < this.bullets.getLength(); i++) {
            if(this.isOutOfBounds(this.bullets.children.entries[i], 200)){
                this.bullets.remove(this.bullets.children.entries[i],true,true);
                this.frienship -= this.params.FRIENSHIP_LOSS_ON_MISS;
            }
        }

        this.confusion.setVisible(this.effects.confisionLeft > 0);
        this.effects.confisionLeft -= dt;

        this.laserCooldown -= dt;
        this.asteroidSpawnCooldown -= dt;
        this.friendlySpawnCooldown -= dt;

        if(this.asteroidSpawnCooldown) this.effects.asteroidAmount = 0;
        if(this.friendlySpawnCooldown) this.effects.shipAmount = 0;

        this.effects.missleTimer -= dt;
        if(this.effects.missleActive){            
            if(this.effects.missleTimer < 0){
                this.effects.missleActive = false;
                this.missle.setVisible(false);
                //Explosion!
                this.explosionSprite.setPosition(this.missle.x,this.missle.y);
                this.explosionSprite.setVisible(true);
                this.explosionSprite.alpha = .8;

                this.explosionEmitter.setPosition(this.missle.x,this.missle.y);
                this.explosionEmitter.explode();

                var killList = [];
                for (var i = 0; i < this.asteroids.getLength(); i++) {
                    var target = this.asteroids.children.entries[i];
                    if(this.distanceBetween(target,this.missle) < this.params.MISSLE_RADIUS){
                        killList.push(target);
                    }
                }
                for (var i = 0; i < killList.length; i++) {
                    this.killAsteroid(killList[i]);
                }

                killList = [];
                for (var i = 0; i < this.friendly.getLength(); i++) {
                    var target = this.friendly.children.entries[i];
                    if(this.distanceBetween(target,this.missle) < this.params.MISSLE_RADIUS){
                        killList.push(target);
                    }
                }
                for (var i = 0; i < killList.length; i++) {
                    this.killFriendly(killList[i]);
                }

            }
        } else {
            this.explosionSprite.alpha = 1 + this.effects.missleTimer/1000;
        }

        this.power += this.params.POWER_GAIN*dt/1000;
        if(this.power > 100) this.endGame('Engines exploded');
        if(this.heath <= 0) this.endGame('The ship got destroyed');
        if(this.frienship <= 0) this.endGame('You killed too many civilians.');


        this.heathBar.clear();
        this.heathBar.fillStyle(0xff1111, 1);
        this.heathBar.fillRect(16, CANVAS_HEIGHT-this.heath*5 - 16, 32, this.heath*5);

        this.frienshipBar.clear();
        this.frienshipBar.fillStyle(0x11ff11, 1);
        this.frienshipBar.fillRect(16 + 48, CANVAS_HEIGHT-this.frienship*5 - 16, 32, this.frienship*5);

        this.powerBar.clear();
        this.powerBar.fillStyle(0x5555ff, 1);
        this.powerBar.fillRect(16 + 48*2, CANVAS_HEIGHT-this.power*5 - 16, 32, this.power*5);

    },

    endGame: function(message){
        if(gameStatus === GS.GAME_OVER) return;
        console.log('Ending the game');
        sendMessage('endGame',message);
        gameStatus = GS.GAME_OVER;
        //TODO switch to game over scene
    },

    receiveMessage: function (data) {
        switch(data.type){
            case 'missle':
                this.effects.missleActive = true;
                this.effects.missleTimer = this.params.MISSLE_TIME;
                this.missle.setPosition(this.ship.x,this.ship.y);
                this.missle.rotation = this.ship.rotation;
                this.missle.setVisible(true);
                this.missle.setVelocity(Math.sin(this.ship.rotation)*this.params.MISSLE_SPEED, -Math.cos(this.ship.rotation)*this.params.MISSLE_SPEED);
                break;
            case 'commsResult':
                this.effects.shipAmount = data.content ? 1 : -1;
                this.effects.shipTimeLeft = this.params.SHIP_EFFECT_TIME;
                break;
            case 'snakeDies':
                this.effects.asteroidAmount = 1;
                this.effects.asteroidTimeLeft = this.params.ASTEROID_EFFECT_TIME;
        }
    },

    



});
