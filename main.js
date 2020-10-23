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
        this.keyM;
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

        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
        this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        //Key events:
        this.input.keyboard.on('keyup', function (event) {
            switch(event.key){
                case 'z': alert('You pressed Z'); break;
                case 'm': sendMessage('test','Here is an "m" test'); break;
            }
            console.dir(event);

        });

    },

    update: function(timestep, dt) {
        //Note: those have to be here, otherwise they don't see this.scene properly
        if(this.keyW.isDown) this.scene.start('SceneWeapons');
        if(this.keyN.isDown) this.scene.start('SceneNavigation');
        if(this.keyP.isDown) this.scene.start('ScenePiloting');
        if(this.keyS.isDown) this.scene.start('SceneShields');
    },

    receiveMessage: function (){},



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
    };

var game = new Phaser.Game(config);

//Networking stuff

const ROOM_NAME = 'observable-main';
const CHANNEL_ID = 'zb4mnOSMgmoONGoM';
var members;

function getUsername() {
    var name;
    name = prompt("Enter your username","");
      
    while(!name){
        var name = prompt(s.enter_username_non_empty,"");
    }
    return(name);
}

function getRandomName() {
  const adjs = ["autumn", "hidden", "bitter", "misty", "silent", "empty", "dry", "dark", "summer", "icy", "delicate", "quiet", "white", "cool", "spring", "winter", "patient"];
  const nouns = ["waterfall", "river", "breeze", "moon", "rain", "wind", "sea", "morning", "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn", "glitter", "forest", "hill"];
  const name = adjs[Math.floor(Math.random() * adjs.length)] + "_" + nouns[Math.floor(Math.random() * nouns.length)];
  console.log('Your randomly generated name is: ' + name);
  return (name);
}

const drone = new ScaleDrone(CHANNEL_ID, {
  data: { // Will be sent out as clientData via events
    //name: getUsername(),
    name: getRandomName(),
  },
});

function sendMessage(type, content) {
  drone.publish({
    room: ROOM_NAME,
    message: {
      type: type,
      content: content
    },
  }); 
}

function forwardMessageToActiveScenes(data) {
    for (var i = 0; i < game.scene.scenes.length; i++) {
        if(game.scene.scenes[i].scene.settings.active){
            console.log(game.scene.scenes[i]);
            game.scene.scenes[i].receiveMessage(data);
        }
    }
}

drone.on('open', error => {
    if (error) {
        return console.error(error);
    }
    console.log('Successfully connected to Scaledrone');
     
    const room = drone.subscribe(ROOM_NAME);
    room.on('open', error => {
       if (error) {
           return console.error(error);
       }
       console.log('Successfully joined room');
    });
     
     // List of currently online members, emitted once
    room.on('members', m => {
        members = m;
        //TODO Update member display?
    });
     
    // User joined the room
    room.on('member_join', member => {
        members.push(member);
        console.log(member.clientData.name+' joined!');
    });
     
    // User left the room
    room.on('member_leave', ({id}) => {    
        const index = members.findIndex(member => member.id === id);
        members.splice(index, 1);
        //TODO Update member display?
    });

    room.on('data', (data, serverMember) => {
        //Data is received here
        forwardMessageToActiveScenes(data);        
        console.log(data);
        if (serverMember) {
            switch(data.type){
                case 'test': alert(serverMember.clientData.name+' sends a test message: '+data.content); break;
                default: alert('Unknown message type received: '+data.type)

            }            
        } else {
            console.log('Server: '+data.content); 
        }
    });

});

    