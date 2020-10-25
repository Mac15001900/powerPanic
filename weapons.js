/*

wip/todo:
    - trigger restart on fail/success

*/

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
        this.load.image('power-icon', 'assets/powerupBlue_bolt.png');

        this.load.image('missile-top', 'assets/missile-top.png');   
        this.load.image('missile-mid1', 'assets/missile-middle1.png');   
        this.load.image('missile-mid2', 'assets/missile-middle2.png');   
        this.load.image('missile-bottom', 'assets/missile-bottom.png');   
        
        this.load.image('background', 'assets/black-stars.png');   
    },

    create: function () {

        this.background = this.add.image(0, 0, 'background').setOrigin(0).setScale(4);
        this.background.depth = 100;

        this.instrutions = this.add.text(20, 64, '', { font: "24px Arial", fill: "#19de65" });
        this.instrutions.depth = 101;        

        this.instrutions.text = "You're job is to build a missile!\nUse the spacebar to drop a piece of the missile\nStack 4 pieces and a winner is you!";   

        this.isPlaying = false;
        var didWin = false;

        var g1 = this.add.grid(350, 399, 100, 400, 4, 4, 0x057605);
        
        this.powerGain = 10;
        this.add.image(32,CANVAS_HEIGHT-16,'power-icon');
        this.powerBar = this.add.graphics();

        var text = this.add.text(200, 100, '', { font: "32px Arial", fill: "#19de65" });
        text.text = 'You are in weapons';
        this.icon = this.add.image(32,32,'weapons-icon');
        this.icon.scaleX = 1/8;
        this.icon.scaleY = 1/8;
        this.backKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        this.theGroup = this.add.group();

        var currentPiece;

        this.bottom = {
            name: 'missile-bottom'
        };
        this.mid1 = {
            name: 'missile-mid1'
        };
        this.mid2 = {
            name: 'missile-mid2'
        };
        this.top = {
            name: 'missile-top'
        };

        this.initializeMissileGame(this.bottom);     
    },

    update: function (timestep, dt) {

        power += this.powerGain*dt/1000;
        this.powerBar.clear();
        this.powerBar.fillStyle(0x5555ff, 1);
        this.powerBar.fillRect(16, CANVAS_HEIGHT-power*5 - 16, 32, power*5);
        if(power > 100) endGame('Power overload! The weapons system did a kaboom!!');

        if(gameStatus !== GS.GAME_STARTED && !DEBUG_IGNORE_GAME_STATE) return;
        this.instrutions.setVisible(false);
        this.background.depth = -10;

        if(this.backKey.isDown) {
            console.log('Switching back to menu');
            this.scene.start('SceneStart');
        }

        if(Phaser.Input.Keyboard.JustDown(this.spaceKey))
            this.dropPiece();     
            
        if (this.didWin == true){
            this.time.delayedCall(3000, function(){this.scene.restart()},[],this);
        }
            
    },

    initializeMissileGame: function(piece) {
        this.isPlaying = true;
        this.startPiece(piece);
    },
    
    startPiece: function(piece) {
        let x, y, i, v;
        if (piece.name === this.bottom.name) {
            x = 700;
            y = 500;
            i = 'missile-bottom';
            v = -200;
        } else if (piece.name === this.mid1.name) {
            x = 700;
            y = 400;
            i = 'missile-mid1';
            v = -300;
        } else if (piece.name === this.mid2.name) {
            x = 700;
            y = 300;
            i = 'missile-mid2';
            v = -400;
        } else if (piece.name === this.top.name) {            
            x = 700;
            y = 200;
            i = 'missile-top';
            v = -500;
        }

        piece = this.physics.add.image(x,y,i);
        piece.setVelocity(v, 0);
        piece.setBounce(1, 0);
        piece.setCollideWorldBounds(true);

        this.theGroup.add(piece);
        
        this.physics.add.collider(this.theGroup, this.currentPiece);
        this.physics.add.collider(this.theGroup, piece);
        this.physics.add.collider(piece, this.currentPiece);

        if (piece.name === this.top.name) {
            console.log("test--test--test--test--test--test--");
            this.physics.add.collider(piece, this.currentPiece, function() {                
                console.log("Test3");  
            });  
        }

        // this.physics.add.collider(piece, this.currentPiece, function() {
        //     if(piece.name == this.top.name)
        //         console.log("Test3");  
        // });        

        this.currentPiece = piece;
    },

    dropPiece: function () {        
        
        this.currentPiece.setVelocity(0,900);

        if (this.currentPiece.texture.key === this.mid2.name) {
            this.startPiece(this.top);
        } else if (this.currentPiece.texture.key === this.mid1.name) {
            this.startPiece(this.mid2);
        } else if (this.currentPiece.texture.key === this.bottom.name) {
            this.startPiece(this.mid1);            
        }
    },

    receiveMessage: function (data) {
        console.log(data);
    },
});