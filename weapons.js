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

        this.load.image('red-particle', 'assets/red-particle.png');  
        
        this.load.image('background', 'assets/black-stars.png');   
    },

    create: function () {

        this.background = this.add.image(0, 0, 'background').setOrigin(0).setScale(4);
        this.background.depth = 100;

        this.instrutions = this.add.text(40, 64, '', { font: "16px Arial", fill: "#19de65", wordWrap:{width:CANVAS_WIDTH-40} });
        this.instrutions.depth = 101;        

        this.instrutions.text = "You are the weapons expert.\n\nYour job is to build and fire missiles, using up a lot of energy. " +
            "Drop down pieces with spacebar or by touching/clicking the screen. Stack 4 pieces to create a missile.\n\n" +
            "Missiles are fired immidiately after being built. Warn your pilot before you do that - or you'll risk a lot of civilian casualties. "+
            "If your missile is skewed to the side, it will skew in that direction when fired - also warn the pilot about that!\n\n"+
            "As with any station, make sure the power bar never overloads (firing missiles decreases it).\n\n" +
            "\nWaiting for the pilot to start the game...";

        this.isPlaying = false;

        var g1 = this.add.grid(350, 399, 100, 400, 4, 4, 0x057605);
        
        this.powerGain = 2.5;
        var powerIcon = this.add.image(32,CANVAS_HEIGHT-16,'power-icon');
        powerIcon.depth = 5;
        this.powerBar = this.add.graphics();

        this.icon = this.add.image(32,32,'weapons-icon');
        this.icon.scaleX = 1/8;
        this.icon.scaleY = 1/8;

        this.backKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        this.theGroup = this.physics.add.group();
        //When two objects from this group touch, call onCollision
        this.physics.add.overlap(this.theGroup, this.theGroup, this.onCollision, null, this);
        //When an object touches world bounds, call onBoundCollision
        this.physics.world.on('worldbounds', this.onBoundsCollision, this);

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

        this.input.on('pointerdown', function () {
            if(gameStatus === GS.GAME_STARTED || g.debug.ignore_game_state) this.dropPiece(); 
        }, this);

        var weldingParticles = this.add.particles('red-particle');
        this.weldingEmitter = weldingParticles.createEmitter({
            speed: 400,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 350,
            gravityY: 2500,
            frequency: -1,
            quantity: 11,
        });

        this.initializeMissileGame(this.bottom);     
    },

    update: function (timestep, dt) {
        if(this.backKey.isDown) {
            console.log('Switching back to menu');
            switchToScene(this,'SceneStart');
        }
        if(gameStatus !== GS.GAME_STARTED && !g.debug.ignore_game_state) return;
        this.instrutions.setVisible(false);
        this.background.depth = -10;

        power += this.powerGain*dt/1000;
        this.powerBar.clear();
        this.powerBar.fillStyle(0x5555ff, 1);
        this.powerBar.fillRect(16, CANVAS_HEIGHT-power*5 - 16, 32, power*5);
        if(power > 100) endGame('Power overload! The weapons system did a kaboom!!');        

        if(Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.dropPiece();     
    },

    initializeMissileGame: function(piece) {
        this.isPlaying = true;
        this.startPiece(piece);
    },
    
    startPiece: function(piece) {
        let x, y, i, v, id;
        if (piece.name === this.bottom.name) {
            x = 700;
            y = 500;
            i = 'missile-bottom';
            v = -200;
            id = 0;
        } else if (piece.name === this.mid1.name) {
            x = 700;
            y = 400;
            i = 'missile-mid1';
            v = -300;
            id = 1;
        } else if (piece.name === this.mid2.name) {
            x = 700;
            y = 300;
            i = 'missile-mid2';
            v = -400;
            id = 2;
        } else if (piece.name === this.top.name) {            
            x = 700;
            y = 200;
            i = 'missile-top';
            v = -500;
            id = 3;
        }

        //Randomising x to prevent spamming spacebar from being a viable strategy
        piece = this.physics.add.image(Phaser.Math.RND.between(CANVAS_WIDTH*.66,CANVAS_WIDTH-50), y, i);
        
        this.theGroup.add(piece);

        piece.setVelocity(v, 0);
        piece.setBounce(1, 0);
        piece.setCollideWorldBounds(true);
        piece.id = id;
        piece.body.onWorldBounds = true;

        this.currentPiece = piece;
    },

    dropPiece: function () {                
        this.currentPiece.setVelocity(0,600);
        this.currentPiece.dropped = true;

        if (this.currentPiece.texture.key === this.mid2.name) {
            this.startPiece(this.top);
        } else if (this.currentPiece.texture.key === this.mid1.name) {
            this.startPiece(this.mid2);
        } else if (this.currentPiece.texture.key === this.bottom.name) {
            this.startPiece(this.mid1);            
        } 
    },

    getPiece: function(id){
        return this.theGroup.children.entries.filter(p=>p.id === id)[0];
    },

    onCollision: function(first, second){
        if(first.landed && second.landed) return;
        first.setVelocity(0,0);
        first.landed = true;
        second.setVelocity(0,0);
        second.landed = true;
        this.cameras.main.shakeEffect.start(100,.010,.010);
        if(first.id === 3) this.checkVictory(first);
        else if(second.id === 3) this.checkVictory(second);
        console.log('Collision between '+first.id+' and '+second.id);

        this.weldingEmitter.setPosition((first.x+second.x)/2, (first.y+second.y)/2);
        this.weldingEmitter.explode();
    },

    onBoundsCollision: function(body){
        var piece = body.gameObject;
        if(!piece.dropped) return; //Return if not dropped yet
        piece.setVelocity(0,0);
        piece.landed;
        this.cameras.main.shakeEffect.start(100,.010,.010);
        if(piece.id === 3) this.checkVictory(piece);
    },

    checkVictory: function(piece){
        if(piece.y<CANVAS_HEIGHT-160){
            console.log('Victory!');
            power-=35;
            if(power<0) power=0;
            sendMessage('missile', {offset: piece.x - this.getPiece(0).x});
        }else{
            console.log('Not Victory!');            
        }
        this.time.delayedCall(1000, function(){this.scene.restart()}, [], this);
    },

    receiveMessage: function (data) {
        console.log(data);
    },
});