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
        this.load.image('exhaust', 'assets/blue-particle.png');
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

    },

    params: {
        ENGINE_POWER: 100,
        ROTATION_SPEED: 0.005,
        EXHAUST_SPREAD: 20,
        MAX_ASTEROIDS: 10,
        BASIC_COOLDOW: 250,
        BULLET_SPEED: 1000,
        BULLET_RECOIL: 10,
        MAX_FRIENDLY: 3,
    },

    create: function () {
        var background = this.add.image(0, 0, 'background').setOrigin(0).setScale(4);
        background.depth = -10;

        var text = this.add.text(200, 200, '', { font: "32px Arial", fill: "#19de65" });
        var createKey =  function(scene, key){
                return scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[key]);
            };

        text.text = 'You are in piloting';
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
                case 't': sendMessage('test','This is the captain speaking.'); break;            }
        });
        console.log(this.ship);

        //Exhaust
        var particles = this.add.particles('exhaust');

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

        this.asteroids = [];
        this.bullets = [];
        this.friendly = [];

        this.physics.add.overlap(this.bullets, this.asteroids, this.hitAsteroid, null, this);

        this.basicCooldown = 0;

    },

    hitAsteroid: function(bullet, asteroid){
        bullet.destroy();
        asteroid.destroy();
        this.asteroids = this.asteroids.filter(a=>a.active);
        this.bullets = this.bullets.filter(b=>b.active);
        this.physics.add.overlap(this.bullets, this.asteroids, this.hitAsteroid, null, this);
    },

    pickPositionsNearEdge: function(distance){
        var x, y;
                var side = Math.ceil(Math.random()*4);
                switch(side){
                    case 1:
                        x = Math.random() * (CANVAS_WIDTH - distance) + 100;
                        y = distance;
                        break;
                    case 2:
                        x = distance ;
                        y = Math.random() * (CANVAS_HEIGHT - distance) + 100;
                        break;
                    case 3:
                        x = Math.random() * (CANVAS_WIDTH - distance) + 100;
                        y = CANVAS_HEIGHT - distance;
                        break;
                    case 4:
                        x = CANVAS_WIDTH - distance ;
                        y = Math.random() * (CANVAS_HEIGHT - distance) + 100;
                        break;
                }
        return {x: x, y: y};
    },

    update: function (timestep, dt) {
        if(this.backKey.isDown){
            console.log('Switching back to menu');
            this.scene.start('SceneStart');
        }
        var body = this.ship.body;
        var xDirection =  Math.sin(this.ship.rotation);
        var yDirection = -Math.cos(this.ship.rotation);


        var acceleration = 0;
        if(this.forwardKey.isDown) acceleration++;
        if(this.backwardsKey.isDown) acceleration--;

        body.acceleration.x = acceleration*xDirection*this.params.ENGINE_POWER;
        body.acceleration.y = acceleration*yDirection*this.params.ENGINE_POWER;

        if(this.forwardKey.isDown && !this.cameras.main.shakeEffect.isRunning){
            this.cameras.main.shakeEffect.start(100,.005,.005)
        }
        this.emitter.on = this.forwardKey.isDown;
            
        var rotation = 0;
        if(this.leftKey.isDown) rotation--;
        if(this.rightKey.isDown) rotation++;
        //console.log(rotation)       ;

        //this.ship.angularVelocity = rotation * this.params.ROTATION_SPEED;
        this.ship.rotation += rotation * this.params.ROTATION_SPEED * dt;
        this.emitter.changeDirection(this.ship.body.rotation+90, this.params.EXHAUST_SPREAD);
        //this.ship.rotation = rotation;

        //Asteroids
        if(this.asteroids.length < this.params.MAX_ASTEROIDS){
            if(Math.random()>0.5){
                var pos = this.pickPositionsNearEdge(50);

                console.log('Spawning asteroid at x: '+pos.x+', y: '+pos.y);
                var newAsteroid = this.physics.add.sprite(pos.x,pos.y,'meteor-big-1');
                newAsteroid.setVelocity(Math.random()*100, Math.random()*100);
                newAsteroid.setBounce(1, 1);
                newAsteroid.setCollideWorldBounds(true);

                this.asteroids.push(newAsteroid);
            }
        }

        if(this.fireKey.isDown && this.basicCooldown <= 0){
            this.basicCooldown = this.params.BASIC_COOLDOW;            
            
            var newBullet = this.physics.add.sprite(this.ship.x + xDirection*10,this.ship.y + yDirection*10,'laser');
            newBullet.rotation = this.ship.rotation;
            newBullet.setVelocity(this.params.BULLET_SPEED * xDirection, this.params.BULLET_SPEED *yDirection)
            this.bullets.push(newBullet);
            if(!this.cameras.main.shakeEffect.isRunning) this.cameras.main.shakeEffect.start(this.basicCooldown/2,.005,.005);

            this.ship.body.velocity.x -= xDirection * this.params.BULLET_RECOIL;
            this.ship.body.velocity.y -= yDirection * this.params.BULLET_RECOIL;       

        }

        if(this.friendly.length < this.params.MAX_FRIENDLY){
            var pos = this.pickPositionsNearEdge(50);
            var newShip = this.physics.add.sprite(pos.x,pos.y,'friendly-ship');
            newShip.setScale(1/2);
            newShip.setVelocity(200,0);
            this.friendly.push(newShip);
        }

        /*for (var i = 0; i < this.bullets.length; i++) {
            if(this.bullets[i].x<0 ||
        }*/

        this.basicCooldown -= dt;

    },

    receiveMessage: function (data) {
        console.log(data);
    },

    



});
