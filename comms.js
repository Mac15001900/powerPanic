var SceneComms = new Phaser.Class({

	Extends: Phaser.Scene,

	initialize: 

    function SceneComms () {
		Phaser.Scene.call (this, {key: 'SceneComms'});
		this.icon;
		this.backKey;
		this.squares;
	},

	preload: function() {
		this.load.image('icon-comms', 'assets/satellite-communication.png');
		this.load.image('square', 'assets/square.png');
        this.load.image('power-icon', 'assets/powerupBlue_bolt.png');
	},

    create: function () {

        this.womp = this.add.text(50,100, 'Comms needs your help! \nTranslate the messages correctly to clear the civilian ships. \n Hover over each character and find the green characters to spell the translation', { font: "20px Arial", fill: "#19de65" });
        this.pomp = this.add.text(50,200, '.', { font: "20px Arial", fill: "#19de65" });

        var powerIcon = this.add.image(96,48,'power-icon');
        powerIcon.depth = 2;
        this.powerBar = this.add.graphics();


        this.passwordList = [
            "CLEAR",
            "EVACUATE",
            "GOAWAY",
            "RUNAWAY",
            "LEAVE",
            "CLEARTHEAREA",
            "FLEE",
            "SCARPER",
            "SCRAM"
            ]
        this.password = this.passwordList[Math.floor(Math.random()*this.passwordList.length)];
        this.passwordPos = [];
for (let i = 0; i < this.password.length; i++) {
    let pos = Math.floor(Math.random()*64);
    while(this.passwordPos.includes(pos)){
        pos = Math.floor(Math.random()*64)
    }
    this.passwordPos.push(pos)
}
this.passwordPos.sort(function(a,b){return a-b});
        this.squares = [];
        this.text = [];
        let counter = 0;
        for (let i = 0; i < 64; i++){
            let x = 30+45*(i%8);
            let y = 245+45*Math.floor(i/8);
            this.squares[i] = this.add.image(x,y,'square');
            this.text[i] = this.add.text(x,y, '', { font: "35px Arial", fill: "#19de65" }).setOrigin(0.5);
            let letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random()*26)]
            if(this.passwordPos.includes(i)){
                letter = this.password[counter];
                this.text[i].text = this.password[counter];
                counter++;
            }else{
            this.text[i].text = letter;
            }
            this.squares[i].scaleX = 1/3;
            this.squares[i].scaleY = 1/3;
            this.squares[i].setInteractive();
            this.squares[i].on('pointerover', ()=>{
                if(this.passwordPos.includes(i)){
                    this.squares[i].setTint(0x00ff00)
                }else{
                this.squares[i].setTint(0xff0000);
                 }
            });
            this.squares[i].on('pointerout', ()=>{
                this.squares[i].setTint(0xffffff);
            });
            this.squares[i].on('pointerup', ()=>{
                if(this.inputt.text.length<12){
                    this.inputt.text+=letter;
                }
            });
        }
        this.icon = this.add.image(32,32,'icon-comms');
        this.icon.scaleX = 1/8;
        this.icon.scaleY = 1/8;
        this.backKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);


        const a = 89;

        this.inputsquare = this.add.image(30+45*12,270, 'square');
        this.inputsquare.scaleX = 3;
        this.inputsquare.scaleY = 0.7;
        this.inputt = this.add.text(30+45*12,270, '', { font: "35px Arial", fill: "#19de65" }).setOrigin(0.5);

        this.clearsquare = this.add.image(30+45*12,270+a, 'square');
        this.clearsquare.scaleX = 3;
        this.clearsquare.scaleY = 0.7;
        this.clear = this.add.text(30+45*12,270+a, '',{font: "20px Arial", fill: "#19de65"}).setOrigin(0.5);
        this.clear.text = 'CLEAR';
        this.clearsquare.setInteractive();
        this.clearsquare.on('pointerover',()=>{
            this.clearsquare.setTint(0xffff00)
        });
        this.clearsquare.on('pointerout',()=>{
            this.clearsquare.clearTint();
        })
        this.clearsquare.on('pointerup',()=>{
            this.inputt.text='';
        })

        this.backspacesquare = this.add.image(30+45*12,270+a*2, 'square');
        this.backspacesquare.scaleX = 3;
        this.backspacesquare.scaleY = 0.72;
        this.backspace = this.add.text(30+45*12,270+a*2, '', {font: "20px Arial", fill: "#19de65"}).setOrigin(0.5);
        this.backspace.text = 'BACKSPACE';
        this.backspacesquare.setInteractive();
        this.backspacesquare.on('pointerover',()=>{
             this.backspacesquare.setTint(0xffff00);
        });
        this.backspacesquare.on('pointerout',()=>{
            this.backspacesquare.clearTint();
        })
        this.backspacesquare.on('pointerup',()=>{
            this.inputt.text = this.inputt.text.slice(0,-1);
        })

        this.submitsquare = this.add.image(30+45*12,270+a*3, 'square');
        this.submitsquare.scaleX = 3;
        this.submitsquare.scaleY = 0.7;
        this.submit = this.add.text(30+45*12,270+a*3, '', {font: "20px Arial", fill:"#19de65"}).setOrigin(0.5);
        this.submit.text = 'SUBMIT';
        this.submitsquare.setInteractive();
        this.submitsquare.on('pointerover',()=>{
            this.submitsquare.setTint(0xffff00)
        });
        this.submitsquare.on('pointerout',()=>{
            this.submitsquare.clearTint();
        })
        this.submitsquare.on('pointerup',()=>{
            power -= 13;
            if(this.inputt.text==this.password){
                this.inputt.text='';
                this.pomp.text = 'CORRECT!';
                sendMessage('commsResult',true);
                this.time.delayedCall(3000, function(){this.scene.restart()}, [], this);
            }
            else{
                this.inputt.text='';
                this.pomp.text='INCORRECT';
                sendMessage('commsResult',false);
                this.time.delayedCall(3000, function(){this.scene.restart()}, [], this);
              }
        })


    },

    update: function (timestep, dt) {
        if(this.backKey.isDown){
            console.log('Switching back to menu');
            switchToScene(this,'SceneStart');
        }
        if(gameStatus !== GS.GAME_STARTED && !DEBUG_IGNORE_GAME_STATE) return;

        power += 2*dt/1000;
        this.powerBar.clear();
        this.powerBar.fillStyle(0x5555ff, 1);
        this.powerBar.fillRect(96, 32, power*6.5, 32);
        if(power > 100) endGame('Your communication system exploded');
    },

    receiveMessage: function (data) {
        console.log(data);
    },
});