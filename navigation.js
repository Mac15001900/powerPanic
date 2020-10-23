var SceneNavigation = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function SceneNavigation () {
        Phaser.Scene.call(this, { key: 'SceneNavigation' });
    },

    preload: function () {
        
    },

    create: function ()
    {
        var text = this.add.text(200, 200, '', { font: "32px Arial", fill: "#19de65" });
        text.text = 'You are in navigation';

    }

});