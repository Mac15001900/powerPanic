var ScenePiloting = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function ScenePiloting () {
        Phaser.Scene.call(this, { key: 'ScenePiloting' });
        this.icon;
        this.backKey;
        this.testKey;
    },

    preload: function () {
        console.log('Preload in piloting');
        this.load.image('pilot-icon', 'assets/icon-pilot.png');   
    },

    create: function () {
        var text = this.add.text(200, 200, '', { font: "32px Arial", fill: "#19de65" });
        text.text = 'You are in piloting';
        this.icon = this.add.image(32,32,'pilot-icon');
        this.icon.scaleX = 1/8;
        this.icon.scaleY = 1/8;
        this.backKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.input.keyboard.on('keyup', function (event) {
            switch(event.key){
                case 't': sendMessage('test','This is the captain speaking.'); break;
            }
            console.dir(event);

        });

    },

    update: function (timestep, dt) {
        if(this.backKey.isDown){
            console.log('Switching back to menu');
            this.scene.start('SceneStart');
        }

    },

    receiveMessage: function (data) {
        console.log(data);
    },

});