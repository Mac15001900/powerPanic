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
        MAX_FRIENDLY: 15,
        FRIENDLY_SPEED: 50,
        FRIENDLY_SIDE_SPEED: 25,
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

        this.asteroids = this.physics.add.group();
        this.bullets = this.physics.add.group();
        this.friendly = this.physics.add.group();

        this.physics.add.overlap(this.bullets, this.asteroids, this.hitAsteroid, null, this);
        this.physics.add.overlap(this.bullets, this.friendly, this.hitFriendly, null, this);

        this.basicCooldown = 0;

    },

    hitAsteroid: function(bullet, asteroid){
        /*bullet.destroy();
        asteroid.destroy();
        this.asteroids = this.asteroids.filter(a=>a.active);
        this.bullets = this.bullets.filter(b=>b.active);
        this.physics.add.overlap(this.bullets, this.asteroids, this.hitAsteroid, null, this);*/
        this.asteroids.remove(asteroid,true, true);
        this.bullets.remove(bullet,true, true);
    },

    hitFriendly: function(bullet, target){
        console.log('Friendy ship shot');
        this.bullets.remove(bullet, true, true);
        this.friendly.remove(target, true, true);
        //this.physics.add.overlap(this.bullets, this.friendly, this.hitFriendly, null, this);          
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

    update: function (timestep, dt) {
        this.asteroids.runChildUpdate = true;
        this.asteroids.preUpdate(timestep,dt);


        if(this.backKey.isDown){
            console.log('Switching back to menu');
            switchToScene(this,'SceneStart');
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
        if(this.asteroids.getLength() < this.params.MAX_ASTEROIDS){
            if(Math.random()>0.5){
                var pos = this.pickPositionsNearEdge(50);
                this.asteroids.add(this.physics.add.sprite(pos.x,pos.y,'meteor-big-1'));
                var newAsteroid = this.asteroids.children.entries[this.asteroids.children.entries.length-1];
                newAsteroid.setVelocity(Math.random()*100, Math.random()*100);
                newAsteroid.setBounce(1, 1);
                newAsteroid.setCollideWorldBounds(true);
            }
        }

        if(this.fireKey.isDown && this.basicCooldown <= 0){
            this.basicCooldown = this.params.BASIC_COOLDOW;            
            this.bullets.add(this.physics.add.sprite(this.ship.x + xDirection*10,this.ship.y + yDirection*10,'laser'));
            var newBullet = this.bullets.children.entries[this.bullets.children.entries.length-1];;
            newBullet.rotation = this.ship.rotation;
            newBullet.setVelocity(this.params.BULLET_SPEED * xDirection, this.params.BULLET_SPEED *yDirection)
            
            if(!this.cameras.main.shakeEffect.isRunning) this.cameras.main.shakeEffect.start(this.basicCooldown/2,.005,.005);

            this.ship.body.velocity.x -= xDirection * this.params.BULLET_RECOIL;
            this.ship.body.velocity.y -= yDirection * this.params.BULLET_RECOIL;       

        }

        if(this.friendly.getLength() <= this.params.MAX_FRIENDLY){
            var x,y,dx,dy;
            var side = Math.ceil(Math.random()*4);
            var distance = 50;
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
            this.friendly.add(this.physics.add.sprite(x,y,'friendly-ship'));
            var newShip = this.friendly.children.entries[this.friendly.children.entries.length-1];
            newShip.setScale(1/2);
            newShip.setVelocity(dx,dy);


            
            console.log('Spawning a friendly ship');  
            console.log(rotation);
        }

        for (var i = 0; i < this.friendly.getLength(); i++) {
            if(this.isOutOfBounds(this.friendly.children.entries[i], 200)){
                console.log('Removing friendly ship')
                this.friendly.remove(this.friendly.children.entries[i],true,true);
            }
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
