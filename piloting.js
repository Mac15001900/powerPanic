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

    },

    params: {
        ENGINE_POWER: 100,
        ROTATION_SPEED: 0.005,
        EXHAUST_SPREAD: 20,
        MAX_ASTEROIDS: 10,
        BASIC_COOLDOW: 1000,
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

    },

    update: function (timestep, dt) {
        if(this.backKey.isDown){
            console.log('Switching back to menu');
            this.scene.start('SceneStart');
        }
        var body = this.ship.body;


        var acceleration = 0;
        if(this.forwardKey.isDown) acceleration--;
        if(this.backwardsKey.isDown) acceleration++;

        body.acceleration.x = -acceleration*Math.sin(Math.PI*body.rotation/180)*this.params.ENGINE_POWER;
        body.acceleration.y = acceleration*Math.cos(Math.PI*body.rotation/180)*this.params.ENGINE_POWER;

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
                var x, y;
                var side = Math.ceil(Math.random()*4);
                switch(side){
                    case 1:
                        x = Math.random() * (CANVAS_WIDTH - 50) + 100;
                        y = 50;
                        break;
                    case 2:
                        x = 50 ;
                        y = Math.random() * (CANVAS_HEIGHT - 50) + 100;
                        break;
                    case 3:
                        x = Math.random() * (CANVAS_WIDTH - 50) + 100;
                        y = CANVAS_HEIGHT - 50;
                        break;
                    case 4:
                        x = CANVAS_WIDTH - 50 ;
                        y = Math.random() * (CANVAS_HEIGHT - 50) + 100;
                        break;
                }

                console.log('Spawning asteroid at x: '+x+', y: '+y);
                var newAsteroid = this.physics.add.sprite(x,y,'meteor-big-1');
                newAsteroid.setVelocity(Math.random()*100, Math.random()*100);
                newAsteroid.setBounce(1, 1);
                newAsteroid.setCollideWorldBounds(true);

                this.asteroids.push(newAsteroid);
            }
        }

        //if()

    },

    receiveMessage: function (data) {
        console.log(data);
    },

    



});
