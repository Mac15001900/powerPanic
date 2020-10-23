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
    },

    params: {
        ENGINE_POWER: 100,
        ROTATION_SPEED: 0.005,
        EXHAUST_SPREAD: 20,
    },

    create: function () {
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

        this.ship = this.physics.add.sprite(CANVAS_HEIGHT/2,CANVAS_WIDTH/2,'ship');
        this.ship.body.angularDrag = 0;
        this.ship.body.bounceX = 1;
        this.ship.body.bounceY = 1;
        this.ship.body.collideWorldBounds = true;
        this.ship.body.dragX = 6;
        this.ship.body.dragY = 6;
        this.ship.depth = 10;

        this.input.keyboard.on('keyup', function (event) {
            switch(event.key){
                case 't': sendMessage('test','This is the captain speaking.'); break;
            }
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
            /*this.angle.propertyValue = {
                min:newDirection-spread,
                max:newDirection+spread,
            }*/
            this.angle.start = newDirection-spread;
            this.angle.end   = newDirection+spread;
        };
        this.emitter.startFollow(this.ship);
        console.log(this.emitter);

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

        this.emitter.on = this.forwardKey.isDown;
            
        var rotation = 0;
        if(this.leftKey.isDown) rotation--;
        if(this.rightKey.isDown) rotation++;
        //console.log(rotation)       ;

        //this.ship.angularVelocity = rotation * this.params.ROTATION_SPEED;
        this.ship.rotation += rotation * this.params.ROTATION_SPEED * dt;
        this.emitter.changeDirection(this.ship.body.rotation+90, this.params.EXHAUST_SPREAD);
        //this.ship.rotation = rotation;

    },

    receiveMessage: function (data) {
        console.log(data);
    },

    



});