var SceneNavigation = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function SceneNavigation () {
        Phaser.Scene.call(this, { key: 'SceneNavigation' });
        this.icon;
        this.backKey;
    },

    preload: function () {
        console.log('Preload in navigation');
        this.load.image('nav-icon', 'assets/icon-navigation.png');   
    },

    create: function () {
        var text = this.add.text(200, 200, '', { font: "32px Arial", fill: "#19de65" });
        text.text = 'You are in navigation';
        this.icon = this.add.image(32,32,'nav-icon');
        this.icon.scaleX = 1/8;
        this.icon.scaleY = 1/8;
        this.backKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

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