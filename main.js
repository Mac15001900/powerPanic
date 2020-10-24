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
        this.load.image('icon-weapons', 'assets/icon-laser.png');
        this.load.image('icon-navigation', 'assets/icon-navigation.png');
        this.load.image('icon-piloting', 'assets/icon-pilot.png');
        this.load.image('icon-shields', 'assets/icon-shield.png');
        console.log(game)   ;
        console.log(this.currentStation);
    },

    create: function() {
        text = this.add.text(200, 200, '', { font: "32px Arial", fill: "#19de65" });
        text.text = 'This is a start menu thingy.\n Use W,N,P,S and A to switch to stations.';

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
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

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
        if(this.keyW.isDown) switchToScene(this,'SceneWeapons');
        if(this.keyN.isDown) switchToScene(this,'SceneNavigation');
        if(this.keyP.isDown) switchToScene(this,'ScenePiloting');
        if(this.keyS.isDown) switchToScene(this,'SceneShields');
        if(this.keyA.isDown) switchToScene(this,'SceneSnake');
    },

    receiveMessage: function (){},



});

function switchToScene(currentScene, targetScene) {
    var currentKey = currentScene.scene.key;
    if(takenStations.includes(targetScene)){
        console.error('Tried to switch to a taken station '+targetScene);
        return false;
    }

    if(currentScene.scene.key !== 'SceneStart'){
        var index = takenStations.indexOf(currentKey);
        if(index !== -1) takenStations.splice(index,1);
        else console.error('Leaving station that was already free '+currentKey);
        sendMessage('stationLeft', currentKey);    
    }
    
    sendMessage('stationTaken', targetScene);
    currentScene.scene.start(targetScene);
}

function setInstructions(text) {
    // body...
}

const CANVAS_HEIGHT = 800;
const CANVAS_WIDTH = 600;
const GS = {
    NOT_CONNECTED: 0,
    CONNECTED: 1,
    GAME_STARTED: 2,
    GAME_OVER: 3
};
var gameStatus = GS.NOT_CONNECTED;


var config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        physics: {
            default: 'arcade',
            arcade: {

            }
        },
        scene:  [SceneStart, SceneNavigation, SceneWeapons, ScenePiloting, SceneShields, SceneSnake],
    };

var game = new Phaser.Game(config);

//Networking stuff

const ROOM_NAME = 'observable-main';
const CHANNEL_ID = 'zb4mnOSMgmoONGoM';
var members;
var takenStations = [];

function getUsername() {
    var name;
    name = prompt("Enter your username","");
      
    while(!name){
        var name = prompt("Enter your username (it can'this be empty)","");
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

function getActiveScene() {
    for (var i = 0; i < game.scene.scenes.length; i++) {
        if(game.scene.scenes[i].scene.settings.active){
            return(game.scene.scenes[i]);
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
        if(members.length === 1 ){
            gameStatus = GS.CONNECTED;
        }
        //TODO Update member display?
    });
     
    // User joined the room
    room.on('member_join', member => {
        members.push(member);
        sendMessage('welcome', {gameStatus: gameStatus, takenStations: takenStations});
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
        getActiveScene().receiveMessage(data);      
        console.log(data);
        if (serverMember) {
            switch(data.type){
                case 'test': alert(serverMember.clientData.name+' sends a test message: '+data.content); break;
                case 'stationLeft': //Sent whenever someone leaves a station
                    if(takenStations.includes(data.content)) takenStations.splice(takenStations.indexOf(data.content),1);
                    console.log(serverMember.clientData.name + ' leaves '+data.content);
                    break;
                case 'stationTaken': //Sent whenever someone takes over a station
                    if(!takenStations.includes(data.content)) takenStations.push(data.content);
                    console.log(serverMember.clientData.name + ' takes over '+data.content);
                    break;
                case 'wecome': //Sent whenever a new player joins
                    if(gameStatus===GS.NOT_CONNECTED){
                        gameStatus = data.content.gameStatus;
                        takenStations = data.content.takenStations;
                    }
                    break;
                case 'startGame': //Sent when the pilot starts the game. Scenes should listen and react to this
                    gameStatus = GS.GAME_STARTED;
                    break;
                case 'endGame': //Sent when the game ends. Scenes should listen and react to this
                    gameStatus = GS.GAME_OVER;
                    break;
                default: console.log('Unknown message type received: '+data.type)

            }            
        } else {
            console.log('Server: '+data.content); 
        }
    });

});

    