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
        this.load.image('missile-mid1', 'assets/missile-middle1.png');   
        this.load.image('missile-mid2', 'assets/missile-middle2.png');   
        this.load.image('missile-bottom', 'assets/missile-bottom.png');   
    },

    create: function () {
        this.isPlaying = false;
        var g1 = this.add.grid(350, 399, 100, 400, 4, 4, 0x057605);

        // const floor = this.add.rectangle(350, 550, 400, 10, 0x1EE530, 1);

        var text = this.add.text(200, 100, '', { font: "32px Arial", fill: "#19de65" });
        text.text = 'You are in weapons';
        this.icon = this.add.image(32,32,'weapons-icon');
        this.icon.scaleX = 1/8;
        this.icon.scaleY = 1/8;
        this.backKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // var floor;
        // floor = new Phaser.Rectangle(20,20,20,20);
        
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


        // this.physics.add.collider(this.bottom, floor);

        this.initializeMissileGame(this.bottom);
        // this.bottom = this.add.image(700,500,'missile-bottom');
        // this.mid1 = this.add.image(700,400,'missile-middle1');
        // this.mid2 = this.add.image(700,300,'missile-middle2');
        // this.top = this.add.image(700,200,'missile-top');
    },

    update: function (timestep, dt) {
        // if(gameStatus !== GS.GAME_STARTED) {

        // }
        // console.log(this.currentPiece.texture.key);
        if(this.backKey.isDown) {
            console.log('Switching back to menu');
            this.scene.start('SceneStart');
        }

        if(Phaser.Input.Keyboard.JustDown(this.spaceKey))
            this.dropPiece();

    },

    initializeMissileGame: function(piece) {
        this.isPlaying = true;
        // this.currentPiece = this.bottom;
        this.startPiece(piece);
    },
    
    startPiece: function (piece) {
        console.log("In start piece function");
        let x, y, i, v;
        if (piece.name === this.bottom.name) {
            console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
            x = 700;
            y = 500;
            i = 'missile-bottom';
            v = -200;
        } else if (piece.name === this.mid1.name) {
            console.log("YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY");
            x = 700;
            y = 400;
            i = 'missile-mid1';
            v = -200;
        } else if (piece.name === this.mid2.name) {
            console.log("ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ");
            x = 700;
            y = 300;
            i = 'missile-mid2';
            v = -200;
        } else if (piece.name === this.top.name) {
            console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP");
            x = 700;
            y = 200;
            i = 'missile-top';
            v = -200;
        }

        piece = this.physics.add.image(x,y,i);
        piece.setVelocity(v, 0);
        piece.setBounce(1, 0);
        piece.setCollideWorldBounds(true);
        this.physics.add.collider(piece, this.currentPiece);

        this.currentPiece = piece;
        // emitter.startFollow(this.currentPiece);
    },

    dropPiece: function () {        
        // console.log("We made it into the drop funk! YEEHAW");
        console.log("In drop piece function"); 
        
        // console.log("this.currentPiece is:");
        // console.log(this.currentPiece); 
        
        // console.log("this.currentPiece.name is:");
        // console.log(this.currentPiece.name); 

        console.log("this.currentPiece.texture.key is:");
        console.log(this.currentPiece.texture.key); 
        
        this.currentPiece.setVelocity(0,900);

        if (this.currentPiece.texture.key === this.mid2.name) {
            this.startPiece(this.top);
        } else if (this.currentPiece.texture.key === this.mid1.name) {
            this.startPiece(this.mid2);
        } else if (this.currentPiece.texture.key === this.bottom.name) {
            this.startPiece(this.mid1);            
        }

        // if (this.currentPiece.name === this.mid2.name) {
        //     this.startPiece(this.top);
        // } else if (this.currentPiece.name === this.mid1.name) {
        //     this.startPiece(this.mid2);
        // } else if (this.currentPiece.name === this.bottom.name) {
        //     this.startPiece(this.mid1);            
        // }

        // this.startPiece(this.currentPiece);
    },

    receiveMessage: function (data) {
        console.log(data);
        //when receive message like "Start game"
    },
});


// tearsOfPainAndExhaustion.mp4