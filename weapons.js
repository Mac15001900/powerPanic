// const Rectangle = require("../phaser/src/geom/rectangle/Rectangle");

var SceneWeapons = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function SceneWeapons () {
        Phaser.Scene.call(this, { key: 'SceneWeapons' });
        this.icon;
        this.backKey;
    },

    preload: function () {
        console.log('Preload in weapons');
        this.load.image('weapons-icon', 'assets/icon-laser.png');   
        this.load.image('missile-top', 'assets/missile-top.png');   
        this.load.image('missile-middle1', 'assets/missile-middle1.png');   
        this.load.image('missile-middle2', 'assets/missile-middle2.png');   
        this.load.image('missile-bottom', 'assets/missile-bottom.png');   
    },

    create: function () {
        this.isPlaying = false;
        var g1 = this.add.grid(350, 350, 400, 400, 16, 16, 0x057605);

        const rect = this.add.rectangle(350, 550, 400, 10, 0x1EE530, 1);

        var text = this.add.text(200, 100, '', { font: "32px Arial", fill: "#19de65" });
        text.text = 'You are in weapons';
        this.icon = this.add.image(32,32,'weapons-icon');
        this.icon.scaleX = 1/8;
        this.icon.scaleY = 1/8;
        this.backKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // var floor;
        // floor = new Phaser.Rectangle(20,20,20,20);
        
        this.bottom;
        this.mid1;
        this.mid2;
        this.top;


        // this.physics.add.collider(this.bottom, g1);

        this.initializeMissileGame();
        // this.bottom = this.add.image(700,500,'missile-bottom');
        // this.mid1 = this.add.image(700,400,'missile-middle1');
        // this.mid2 = this.add.image(700,300,'missile-middle2');
        // this.top = this.add.image(700,200,'missile-top');
    },

    update: function (timestep, dt) {
        if(this.backKey.isDown){
            console.log('Switching back to menu');
            this.scene.start('SceneStart');
        }

        if(this.spaceKey.isDown)
            this.dropPiece();

    },

    initializeMissileGame: function() {
        this.isPlaying = true;
        this.currentPiece = this.bottom;
        this.startPiece();
    },
    
    startPiece: function () {
        var x, y, i, v;
        if (this.currentPiece == this.bottom) {
            x = 700;
            y = 500;
            i = 'missile-bottom';
            v = -200;
        }
        
        this.currentPiece = this.physics.add.image(x,y,i);
        this.currentPiece.setVelocity(v, 0);
        this.currentPiece.setBounce(1, 0);
        this.currentPiece.setCollideWorldBounds(true);

        // emitter.startFollow(this.currentPiece);
    },

    dropPiece: function () {
        console.log("We made it into the drop funk! YEEHAW");
        this.currentPiece.setVelocity(0,.3);
    },

    receiveMessage: function (data) {
        console.log(data);
    },        
});
