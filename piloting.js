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
        this.load.image('friendly-ship-1', 'assets/ship-green.png');
        this.load.image('friendly-ship-2', 'assets/ship-green-2.png');
        this.load.image('friendly-ship-3', 'assets/ship-green-3.png');
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
        this.load.image('missile', 'assets/spaceMissiles_003.png');

        this.load.image('health-icon', 'assets/powerupRed_shield.png');
        this.load.image('frienship-icon', 'assets/ship-green-mini.png');
        this.load.image('power-icon', 'assets/powerupBlue_bolt.png');

        this.load.image('ship-minus-icon', 'assets/ship_minus.png');
        this.load.image('ship-plus-icon', 'assets/ship_plus.png');
        this.load.image('asteroid-minus-icon', 'assets/meteor_minus.png');
        this.load.image('asteroid-plus-icon', 'assets/meteor_plus.png');



    },

    params: {
        ENGINE_POWER: 100,
        ROTATION_SPEED: 0.005,
        EXHAUST_SPREAD: 20,
        MAX_ASTEROIDS: 15,
        ASTEROID_DAMAGE: 10,
        ASTEROID_SPAWN_COOLDOWN: 700,
        ASTEROID_SPEED: 100,
        BASIC_ATTACK_COOLDOWN: 250,
        BULLET_SPEED: 1000,
        BULLET_RECOIL: 10,
        MAX_FRIENDLY: 15,
        EXTRA_FRIENDLY: 10,
        EXTRA_FRIENDLY_PERIOD: 4000,
        FRIENDLY_SPEED: 50,
        FRIENDLY_SIDE_SPEED: 40,
        FRIENDLY_ESCAPE_SPEED: 70,
        FRIENDLY_SPAWN_COOLDOWN: 1000,
        MISSILE_TIME: 500,
        MISSILE_SPEED: 500,
        MISSILE_RADIUS: 200,
        FRIENSHIP_LOSS_ON_KILL: 10,
        FRIENSHIP_LOSS_ON_MISS: 1,        
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
        missileActive: false,
        missileTimer: 0,
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

        
        this.shipMinusIcon = this.add.image(CANVAS_WIDTH-64,64, 'ship-minus-icon');
        this.shipPlusIcon = this.add.image(CANVAS_WIDTH-64,64, 'ship-plus-icon');
        this.asteroidMinusIcon = this.add.image(CANVAS_WIDTH-64,64, 'asteroid-minus-icon');
        this.asteroidPlusIcon = this.add.image(CANVAS_WIDTH-64,64, 'asteroid-plus-icon');
        this.shipMinusIcon.setVisible(false);
        this.shipPlusIcon.setVisible(false);
        this.asteroidMinusIcon.setVisible(false);
        this.asteroidPlusIcon.setVisible(false);
        this.shipMinusIcon.depth = 5;
        this.shipPlusIcon.depth = 5;
        this.asteroidMinusIcon.depth = 5;
        this.asteroidPlusIcon.depth = 5;


        this.ship = this.physics.add.sprite(CANVAS_HEIGHT/2,CANVAS_WIDTH/2,'ship');
        this.ship.body.angularDrag = 0;
        this.ship.body.bounceX = 1;
        this.ship.body.bounceY = 1;
        this.ship.body.collideWorldBounds = true;
        this.ship.body.dragX = 6;
        this.ship.body.dragY = 6;
        this.ship.depth = 10;
        this.ship.setScale(0.5);

        if(DEBUG_PILOT_PACKET_SENDING){
            this.input.keyboard.on('keyup', function (event) {
                switch(event.key){
                    case 't': sendMessage('test','This is the captain speaking.'); break;
                    case 'm': sendMessage('missile'); break;
                    case 'e': sendMessage('snakeEats'); break;
                    case 'r': sendMessage('snakeDies'); break;
                    case 'o': sendMessage('commsResult', true); break;
                    case 'p': sendMessage('commsResult', false); break;
                }
            });    
        }
        
        console.log(this.ship);

        //Exhaust
        var particles = this.add.particles('exhaust-particle');

        this.engineEmitter = particles.createEmitter({
            speed: 500,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            angle: { min: 90+45, max: 90+45 },
        });
        this.engineEmitter.on = false;
        this.engineEmitter.changeDirection = function (newDirection, spread) {
            this.angle.start = newDirection-spread;
            this.angle.end   = newDirection+spread;
        };
        this.engineEmitter.startFollow(this.ship);
        console.log(this.engineEmitter);

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

        this.missile = this.physics.add.sprite(0,0,'missile');
        this.missile.setVisible(false);
        this.missile.setBounce(1);
        this.missile.setCollideWorldBounds(true);



        this.asteroids = this.physics.add.group();
        this.bullets = this.physics.add.group();
        this.friendly = this.physics.add.group();

        this.physics.add.overlap(this.bullets, this.asteroids, this.hitAsteroid, null, this);
        this.physics.add.overlap(this.bullets, this.friendly, this.hitFriendly, null, this);
        this.physics.add.overlap(this.ship, this.asteroids, this.hitShip, null, this);

        this.laserCooldown = 0;
        this.asteroidSpawnCooldown = this.params.ASTEROID_SPAWN_COOLDOWN;
        this.friendlySpawnCooldown = this.params.FRIENDLY_SPAWN_COOLDOWN;

        this.healthBar = this.add.graphics();
        this.frienshipBar = this.add.graphics();
        this.powerBar = this.add.graphics();

        this.add.image(32,CANVAS_HEIGHT-16,'health-icon');
        this.add.image(32+48,CANVAS_HEIGHT-16,'frienship-icon');
        this.add.image(32+48*2,CANVAS_HEIGHT-16,'power-icon');

        this.health = 100;
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
        this.health -= this.params.ASTEROID_DAMAGE;
    },

    spawnFriendlyShip(extra=false){        
        var x,y,dx,dy;
        var side = Math.ceil(Math.random()*4);
        var distance = -50;
        switch(side){
            case 1:
                x = Math.random() * (CANVAS_WIDTH - distance*2) + distance;
                y = distance;
                dx = (Math.random()-0.5) * this.params.FRIENDLY_SIDE_SPEED;
                dy = this.params.FRIENDLY_SPEED;
                break;
            case 2:
                x = distance ;
                y = Math.random() * (CANVAS_HEIGHT - distance*2) + distance;
                dx = this.params.FRIENDLY_SPEED;
                dy = (Math.random()-0.5) * this.params.FRIENDLY_SIDE_SPEED;
                break;
            case 3:
                x = Math.random() * (CANVAS_WIDTH - distance*2) + distance;
                y = CANVAS_HEIGHT - distance;
                dx = (Math.random()-0.5) * this.params.FRIENDLY_SIDE_SPEED;
                dy = -this.params.FRIENDLY_SPEED;
                break;
            case 4:
                x = CANVAS_WIDTH - distance ;
                y = Math.random() * (CANVAS_HEIGHT - distance*2) + distance;
                dx = -this.params.FRIENDLY_SPEED;
                dy = (Math.random()-0.5) * this.params.FRIENDLY_SIDE_SPEED;
                break;
        }
        this.friendly.add(this.physics.add.sprite(x,y,'friendly-ship-'+Math.ceil(Math.random()*3)));
        var newShip = this.friendly.children.entries[this.friendly.children.entries.length-1];
        newShip.setScale(1/2);
        newShip.setVelocity(dx,dy);        
        this.adjustRotation(newShip, Math.PI/2);
        newShip.isExtra = extra;
    },

    countNonExtraShips(){
        return this.friendly.getChildren().filter(s=>!s.isExtra).length;
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

    adjustRotation: function(sprite, offset=0){
        sprite.rotation = Phaser.Math.Angle.Between(0, 0, sprite.body.velocity.x, sprite.body.velocity.y) + offset;
    },

    moveTowards: function(sprite, x, y, speed, offset=0){
        sprite.body.velocity = this.vec(x, y, speed);
        this.adjustRotation(sprite, offset);
    },

    distanceFromEdge: function(pos){
        var candidates = [pos.x, pos.y, CANVAS_WIDTH-pos.x, CANVAS_HEIGHT-pos.y];
        return candidates.map(Math.abs).reduce((a,b)=>Math.min(a,b));
    },

    vec: function(x, y, scale){
        if(!scale) return new Phaser.Math.Vector2(x, y);
        else return new Phaser.Math.Vector2(x, y).normalize().scale(scale);        
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


        //Ship movement
        var rotation = 0;
        if(this.leftKey.isDown) rotation--;
        if(this.rightKey.isDown) rotation++;

        this.ship.rotation += rotation * this.params.ROTATION_SPEED * dt;
        this.engineEmitter.changeDirection(this.ship.angle+90, this.params.EXHAUST_SPREAD);

        var xDirection = Math.sin(this.ship.rotation);
        var yDirection = -Math.cos(this.ship.rotation);

        var acceleration = 0;
        if(this.forwardKey.isDown){
            this.ship.body.acceleration = this.vec(xDirection, yDirection, this.params.ENGINE_POWER);

            this.power -= this.params.POWER_USAGE * dt/1000;
            if(this.power<=0) this.power=0;
            if(!this.cameras.main.shakeEffect.isRunning) this.cameras.main.shakeEffect.start(100,.005,.005);
        }else{
            this.ship.setAcceleration(0,0);
        }

        this.engineEmitter.on = this.forwardKey.isDown;
            
        

        //Asteroid spawning
        if(this.asteroidSpawnCooldown<0){
            this.asteroidSpawnCooldown = this.params.ASTEROID_SPAWN_COOLDOWN;
            if(this.asteroids.getLength() < this.params.MAX_ASTEROIDS){
                var chance = 0.5;
                if(this.effects.asteroidAmount > 0) chance = 1;
                else if(this.effects.asteroidAmount < 0) chance = 0.25;
                
                if(Math.random() > 1-chance){                
                    var pos = this.pickPositionsNearEdge(-50);
                    this.asteroids.add(this.physics.add.sprite(pos.x,pos.y,'meteor-big-'+Math.ceil(Math.random()*4)));
                    var newAsteroid = this.asteroids.children.entries[this.asteroids.children.entries.length-1];
                    newAsteroid.setFlip(Math.random()>0.5, Math.random()>0.5);
                    newAsteroid.setVelocity(Math.random()+0.1, Math.random()+0.1);
                    newAsteroid.body.velocity.scale(this.params.ASTEROID_SPEED);
                    newAsteroid.setBounce(1, 1);
                    newAsteroid.setCollideWorldBounds(true);
                }    
            }            
        }

        //Bullets
        if(this.fireKey.isDown && this.laserCooldown <= 0){
            this.laserCooldown = this.params.BASIC_ATTACK_COOLDOWN;   
            this.bullets.add(this.physics.add.sprite(this.ship.x + xDirection*10,this.ship.y + yDirection*10,'laser'));
            var newBullet = this.bullets.children.entries[this.bullets.children.entries.length-1];;
            newBullet.rotation = this.ship.rotation;
            newBullet.setVelocity(this.params.BULLET_SPEED * xDirection, this.params.BULLET_SPEED * yDirection);
            
            if(!this.cameras.main.shakeEffect.isRunning) this.cameras.main.shakeEffect.start(this.laserCooldown/2,.005,.005);

            this.ship.body.velocity.x -= xDirection * this.params.BULLET_RECOIL;
            this.ship.body.velocity.y -= yDirection * this.params.BULLET_RECOIL;       
        }

        for (var i = 0; i < this.bullets.getLength(); i++) {
            if(this.isOutOfBounds(this.bullets.children.entries[i], 200)){
                this.bullets.remove(this.bullets.children.entries[i],true,true);
                this.frienship -= this.params.FRIENSHIP_LOSS_ON_MISS;
            }
        }

        //Friendly ships
        if(this.friendlySpawnCooldown < 0){
            this.friendlySpawnCooldown = this.params.FRIENDLY_SPAWN_COOLDOWN;
            if(this.countNonExtraShips() <= this.params.MAX_FRIENDLY) this.spawnFriendlyShip(false);
        }

        for (var i = 0; i < this.friendly.getLength(); i++) {
            if(this.isOutOfBounds(this.friendly.children.entries[i], 400)){
                this.friendly.remove(this.friendly.children.entries[i],true,true);
            }
        }

        

        this.confusion.setVisible(this.effects.confisionLeft > 0);
        this.effects.confisionLeft -= dt;

        this.laserCooldown -= dt;
        this.asteroidSpawnCooldown -= dt;
        this.friendlySpawnCooldown -= dt;

        //Missile
        this.effects.missileTimer -= dt;
        if(this.effects.missileActive){            
            if(this.effects.missileTimer < 0){
                //Time for the missile to explode
                this.effects.missileActive = false;
                this.missile.setVisible(false);
                
                this.explosionSprite.setPosition(this.missile.x,this.missile.y);
                this.explosionSprite.setVisible(true);
                this.explosionSprite.alpha = .8;

                this.explosionEmitter.setPosition(this.missile.x,this.missile.y);
                this.explosionEmitter.explode();

                this.cameras.main.shakeEffect.start(600,.015,.015);

                var killList = [];
                for (var i = 0; i < this.asteroids.getLength(); i++) {
                    var target = this.asteroids.children.entries[i];
                    if(this.distanceBetween(target,this.missile) < this.params.MISSILE_RADIUS){
                        killList.push(target);
                    }
                }
                for (var i = 0; i < killList.length; i++) {
                    this.killAsteroid(killList[i]);
                }

                killList = [];
                for (var i = 0; i < this.friendly.getLength(); i++) {
                    var target = this.friendly.children.entries[i];
                    if(this.distanceBetween(target,this.missile) < this.params.MISSILE_RADIUS){
                        killList.push(target);
                    }
                }
                for (var i = 0; i < killList.length; i++) {
                    this.killFriendly(killList[i]);
                }
            } else {
                //Missile is still in flight
                this.adjustRotation(this.missile, Math.PI/2);
            }
        } else {
            this.explosionSprite.alpha = 1 + this.effects.missileTimer/1000;
        }

        //Stats and death
        this.power += this.params.POWER_GAIN*dt/1000;
        if(!DEBUG_IMMORTAL){
            if(this.power > 100) this.endGame('Engines exploded');
            if(this.health <= 0) this.endGame('The ship got destroyed by an asteroid');
            if(this.frienship <= 0) this.endGame('You killed too many civilians.');
        }

        this.healthBar.clear();
        this.healthBar.fillStyle(0xff1111, 1);
        this.healthBar.fillRect(16, CANVAS_HEIGHT-this.health*5 - 16, 32, this.health*5);

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
            case 'missile':
                this.effects.missileActive = true;
                this.effects.missileTimer = this.params.MISSILE_TIME;
                this.missile.setPosition(this.ship.x,this.ship.y);
                this.missile.rotation = this.ship.rotation;
                this.missile.setVisible(true);
                this.missile.setVelocity(Math.sin(this.ship.rotation)*this.params.MISSILE_SPEED, -Math.cos(this.ship.rotation)*this.params.MISSILE_SPEED);
                break;
            case 'commsResult':
                if(data.content){
                    this.friendlySpawnCooldown = this.params.SHIP_EFFECT_TIME;
                    for (var target of this.friendly.getChildren()) {
                        //var direction = this.ship.body.position.subtract(target);
                        var direction = target.body.position.subtract(this.ship);
                        this.moveTowards(target, direction.x, direction.y, this.params.FRIENDLY_ESCAPE_SPEED, Math.PI/2); //sprite, x, y, speed, offset=0
                    }
                    this.shipMinusIcon.setVisible(true);
                    this.time.delayedCall(1000, this.shipMinusIcon.setVisible(), [false], this);
                }else{
                    for (var i = 0; i < this.params.EXTRA_FRIENDLY; i++) {
                        this.time.delayedCall(Math.random()*this.params.EXTRA_FRIENDLY_PERIOD, this.spawnFriendlyShip, [true], this);
                    }

                    this.shipPlusIcon.setVisible(true);
                    this.time.delayedCall(1000, this.shipPlusIcon.setVisible(), [false], this);
                }
                break;
            case 'snakeEats':
                this.asteroidSpawnCooldown = this.params.ASTEROID_EFFECT_TIME;
                this.asteroidMinusIcon.setVisible(true);
                this.time.delayedCall(this.params.ASTEROID_EFFECT_TIME, function(){this.asteroidMinusIcon.setVisible(false)}, [], this);
                break;
            case 'snakeDies':
                this.effects.confisionLeft = 1500;
                break;
        }
    },

    



});
