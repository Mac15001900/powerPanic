//Station buttons
var StationButton = new Phaser.Class({

    initialize:

    function StationButton(scene, image, name, sceneName, pos, showOccupant=true){
        this.sprite = scene.add.image(pos.x, pos.y, image);
        this.nameText = scene.add.text(pos.x, pos.y+32+8, name, { font: "24px Arial", fill: "#19de65" }).setOrigin(0.5, 0);
        if(showOccupant) this.occupantText = scene.add.text(pos.x, pos.y+32*2+8, 'Free', { font: "16px Arial", fill: "#19de65" }).setOrigin(0.5, 0);
        this.sceneName = sceneName;
        this.taken = false;

        this.sprite.setInteractive().on('pointerup', function(event){
            switchToScene(scene, sceneName);
        });

        this.sprite.on('pointerover',()=>{
            if(!this.taken) this.sprite.setScale(1.1);
        });
        this.sprite.on('pointerout',()=>{
            this.sprite.setScale(1);
        })
    },

    takeOver : function(playerName){
        if(this.taken) return;
        this.sprite.alpha = 0.6;
        this.nameText.setFill("#aaaaaa");
        this.occupantText.setFill("#aaaaaa");
        this.occupantText.text = playerName;
        this.taken = true;
    },

    free: function(){
        if(!this.taken) return;
        this.sprite.alpha = 1;
        this.nameText.setFill("#19de65");
        this.occupantText.setFill("#19de65");
        this.occupantText.text = 'Free';
        this.taken = false;
    },

    setDepth : function(depth){
        this.sprite.depth = depth;
        this.nameText.depth = depth;
        if(this.occupantText) this.occupantText.depth = depth;
    },

    setVisible : function(visible){
        this.sprite.setVisible(visible);
        this.nameText.setVisible(visible);
        if(this.occupantText) this.occupantText.setVisible(visible);
    }
});

//Creates a screen with instructions.
var InstructionScreen = new Phaser.Class({

    initialize:

    //Example usage: new InstructionScreen(this, instructionsText, 'background', 'icon-back', 9000)
    function InstructionScreen(scene, text, background, backIcon, depth, backgroundScale=1){
        this.background = scene.add.image(-10, -10, background).setOrigin(0).setScale(backgroundScale);
        this.instrutions = scene.add.text(20, 64, text, { font: "16px Arial", fill: "#19de65", wordWrap:{width:CANVAS_WIDTH-40} });
        this.backButton =  new StationButton(scene, backIcon, 'Menu', 'SceneStart', {x:CANVAS_WIDTH-(100-16), y:CANVAS_HEIGHT-100}, false); 

        this.background.depth = depth;
        this.instrutions.depth = depth+1;
        this.backButton.setDepth(depth+1);
    },

    hide : function(){
        this.background.setVisible(false);
        this.instrutions.setVisible(false);
        this.backButton.setVisible(false);
    },

});
