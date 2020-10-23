var SceneStart = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function SceneStart() {
        Phaser.Scene.call(this, { key: 'SceneStart' });
        this.currentStation = 'WEAPONS';
        this.station = ['WEAPONS','NAVIGATION','PILOT','SHIELD'];
        this.text;
        this.keyW;
        this.keyN;
        this.keyP;
        this.keyS;
    }, 

    preload: function() {
        this.load.image('logo', 'assets/testLogo.png');     
        console.log(game)   ;
        console.log(this.currentStation);
    },

    create: function() {
        text = this.add.text(200, 200, '', { font: "32px Arial", fill: "#19de65" });
        text.text = 'This is a start menu thingy.\n Use W,N,P and S to switch to stations.';

        this.add.image(400, 300, 'sky');

        var particles = this.add.particles('red');

        var emitter = particles.createEmitter({
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD'
        });

        var logo = this.physics.add.image(400, 100, 'logo');

        logo.setVelocity(100, 200);
        logo.setBounce(1, 1);
        logo.setCollideWorldBounds(true);

        emitter.startFollow(logo);

        console.log('Does any of this work?');

        this.input.on('pointerdown', function () {

            console.log('Mouse clicked');

        }, this);        

        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
        this.keyN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N)
        this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P)
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    },

    update: function(timestep, dt) {
        if(this.keyW.isDown) this.scene.start('SceneWeapons');
        if(this.keyN.isDown) this.scene.start('SceneNavigation');
        if(this.keyP.isDown) this.scene.start('ScenePiloting');
        if(this.keyS.isDown) this.scene.start('SceneShields');        
    }



});

var config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 200 }
            }
        },
        scene:  [SceneStart, SceneNavigation, SceneWeapons, ScenePiloting, SceneShields],
        /*{
            preload: preload,
            create: create,
            update: update
        }*/
    };

var game = new Phaser.Game(config);

    