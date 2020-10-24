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
	},

    create: function () {

        this.passwordList = [
            "SPACESHIP",
            "ASTRONAUT",
            "CELESTIAL",
            "SUPERNOVA",
            "GALAXY",
            "JUPITER",
            "UNIVERSE",
            "VACUUM",
            "ECLIPSE",
            "TELESCOPE",
            "SATELLITE",
            "NEBULAE",
            "ASTEROID",
            "METEORITE",
            "MERCURY",
            "GRAVITY",
            "VOYAGER",
            "SPUTNIK",
            "DISCOVERY",
            "ENTERPRISE",
            "ATLANTIS",
            "HOUSTON"
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
        console.log(this.password);
        console.log(this.passwordPos);


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
                if(this.input.text.length<12){
                    this.input.text+=letter;
                }
            });
        }
        this.icon = this.add.image(32,32,'key-icon');
        this.icon.scaleX = 1/8;
        this.icon.scaleY = 1/8;
        this.backKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);


        const a = 88;

        this.inputsquare = this.add.image(30+45*12,270, 'square');
        this.inputsquare.scaleX = 3;
        this.inputsquare.scaleY = 3/4;
        this.input = this.add.text(30+45*12,270, '', { font: "35px Arial", fill: "#19de65" }).setOrigin(0.5);

        this.clearsquare = this.add.image(30+45*12,270+a, 'square');
        this.clearsquare.scaleX = 3;
        this.clearsquare.scaleY = 3/4;
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
            this.input.text='';
        })

        this.backspacesquare = this.add.image(30+45*12,270+a*2, 'square');
        this.backspacesquare.scaleX = 3;
        this.backspacesquare.scaleY = 3/4;
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
            this.input.text = this.input.text.slice(0,-1);
        })

        this.submitsquare = this.add.image(30+45*12,270+a*3, 'square');
        this.submitsquare.scaleX = 3;
        this.submitsquare.scaleY = 3/4;
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
            if(this.input.text==this.password){
                console.log('correct');
            }
            else{
                console.log('wrong');
                this.input.text='';
            }
        })


    },

    update: function (timestep, dt) {
        if(this.backKey.isDown){
            console.log('Switching back to menu');
            this.scene.start('SceneStart');
        }
    },

    receiveMessage: function (data) {
        console.log(data);
    }
});