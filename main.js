/*const g.debug.ignore_taken_stations = false;
const g.debug.show_hitboxes = false;
const g.debug.use_dev_server = false;
const g.debug.use_random_server = false;
const g.debug.randomise_username = false;
const g.debug.ignore_game_state = false;
const g.debug.immortal = false;
const g.debug.pilot_packet_sending = false;
const g.debug.disable_messages = false;*/

//The one global variable to rule them all; put everything that should be accessible globally here
var g = {
    stationList : ["SceneNavigation", "SceneWeapons", "ScenePiloting", "SceneShields", "SceneSnake", "SceneComms"],
    debug: tempDebugConfigUntilIFigureOutHowToSynchronouslyLoadJSON,
};

var SceneStart = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function SceneStart() {
        Phaser.Scene.call(this, { key: 'SceneStart' });
        this.testText;
        this.keyW;
        this.keyN;
        this.keyP;
        this.keyS;
        this.keyM;
        this.keyC;
    }, 

    preload: function() {
        this.load.image('logo', 'assets/testLogo.png');     
        this.load.image('icon-weapons', 'assets/icon-laser.png');
        this.load.image('icon-navigation', 'assets/icon-navigation.png');
        this.load.image('icon-piloting', 'assets/icon-pilot.png');
        this.load.image('icon-shields', 'assets/icon-shield.png');
        this.load.image('icon-comms', 'assets/satellite-communication.png');
        this.load.image('square', 'assets/square.png');

        //this.load.json('debug-config', 'debugConfig.json');
        console.log(game);
    },

    create: function() {
        //g.debug = this.cache.json.get('debug-config');

        this.testText = this.add.text(32, 32, '', { font: "16px Arial", fill: "#19de65" });
        this.testText.text = 'Select a station using the following keys:\n W for weapons\nN for navigation\nC for communication\nP for pilot (required).'; //TODO Add lore and good instructions here

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

        this.input.on('pointerdown', function () {

            console.log('Mouse clicked');

        }, this);

        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
        this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

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
        if(gameStatus === GS.NOT_CONNECTED) return; //Don't switch until there's a connection
        if(this.keyW.isDown) switchToScene(this,'SceneWeapons');
        if(this.keyN.isDown) switchToScene(this,'SceneSnake');
        if(this.keyP.isDown) switchToScene(this,'ScenePiloting');
        if(this.keyS.isDown) switchToScene(this,'SceneShields');
        if(this.keyA.isDown) switchToScene(this,'SceneSnake');
        if(this.keyC.isDown) switchToScene(this,'SceneComms');

        this.testText.text = "";
        var sceneList = g.stationList;
        for (var i = 0; i < sceneList.length; i++) {
            if(takenStations[sceneList[i]]) {
                var operator = members.filter(m=>m.id===takenStations[sceneList[i]])[0];
                if(operator) this.testText.text += sceneList[i] + ': '+operator.clientData.name+'\n';
                else this.testText.text += sceneList[i] + ': ????\n';

            }
        }

        /*.forEach(function(name){
            if(takenStations[name]) console.log('Name: '+members.filter(m=>m.id===takenStations[name])[0]+'\n');
            //this.text += 'Name: '+members.filter(m=>m.id===takenStations[name])[0]+'\n';
        });*/
    },

    receiveMessage: function (){},



});

//Station switching

var takenStations = {};
function switchToScene(currentScene, targetScene, freeCurrent=true) {
    var currentKey = currentScene.scene.key;
    if(takenStations[targetScene] && targetScene !== 'SceneStart' && !g.debug.ignore_taken_stations){
        console.error('Tried to switch to a taken station '+targetScene);
        //alert('That station is taken');
        return false;
    }

    if(g.stationList.includes(currentScene.scene.key) && freeCurrent){
        takenStations[currentKey] = null;        
        sendMessage('stationLeft', currentKey);
    }
    
    if(g.stationList.includes(targetScene)){
        sendMessage('stationTaken', targetScene);
        console.log('Taking over '+targetScene);
        takenStations[currentKey] = drone.clientId;
    }
    
    currentScene.scene.start(targetScene);
}

function endGame(message) {
    if(gameStatus !== GS.GAME_STARTED) return;
    console.log('Ending the game');
    sendMessage('endGame',message);
    gameStatus = GS.GAME_OVER;
}

function setInstructions(text) {
    document.querySelector('#instructions').innerHTML = text;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GS = {
    NOT_CONNECTED: 0,
    CONNECTED: 1,
    GAME_STARTED: 2,
    GAME_OVER: 3
};
var gameStatus = GS.NOT_CONNECTED;
var power=0;


var config = {
        type: Phaser.AUTO,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        physics: {
            default: 'arcade',
            arcade: {
                debug: g.debug.show_hitboxes,
            }
        },
        scene:  [SceneStart, SceneNavigation, SceneWeapons, ScenePiloting, SceneShields, SceneSnake, SceneComms],
    };

var game = new Phaser.Game(config);

//Networking stuff

const ROOM_NAME_BASE = 'observable-main-';
const CHANNEL_ID = 'zb4mnOSMgmoONGoM';
var members;
var roomName = getRoom();

function getUsername() {
    if(g.debug.randomise_username) return getRandomName();
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

function getRoom() {
    if(g.debug.use_dev_server) return ROOM_NAME_BASE+'dev';
    if(g.debug.use_random_server) return ROOM_NAME_BASE+'random-'+Math.random();

    var room;
    room = prompt("Enter the room name to join or create a room.","");
      
    while(!room){
        var room = prompt("Enter the room name (it can't be empty) to join or create a room.","");
    }
    return(ROOM_NAME_BASE+room);
}

const drone = new ScaleDrone(CHANNEL_ID, {
  data: { // Will be sent out as clientData via events
    name: getUsername(),
  },
});

function sendMessage(type, content) {
    if(g.debug.disable_messages) return;
  drone.publish({
    room: roomName,
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
    console.error('No active scene found');
}

drone.on('open', error => {
    if (error) {
        return console.error(error);
    }
    console.log('Successfully connected to Scaledrone');
     
    const room = drone.subscribe(roomName);
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
        console.log(members[index].clientData.name+' left');
        for (var i = 0; i < g.stationList.length; i++) {
            if(takenStations[g.stationList[i]]===id) takenStations[g.stationList[i]] = null;
        }
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
                    takenStations[data.content] = null;
                    console.log(serverMember.clientData.name + ' leaves '+data.content);
                    break;
                case 'stationTaken': //Sent whenever someone takes over a station
                    //if(!takenStations.includes(data.content)) takenStations.push(data.content);
                    if(data.content === 'SceneStart') console.error.log(serverMember.clientData.name + ' just reserved the main menu...');
                    var currentScene = getActiveScene();
                    if(currentScene.scene.key === data.content && serverMember.id != drone.clientId  && !g.debug.ignore_taken_stations){
                        //Someone else joined our scene
                        switchToScene(currentScene,'SceneStart');
                        sendMessage('stationJammed', data.content);
                    }
                    takenStations[data.content] = serverMember.id;
                    console.log(serverMember.clientData.name + ' takes over '+data.content);
                    break;
                case 'stationJammed': //For whatever reason, there are multiple people on the same station. Recover by having them all leave.
                    console.error.log('Scene jam at '+data.content)
                    if(getActiveScene().scene.key === data.content && !g.debug.ignore_taken_stations) switchToScene(currentScene,'SceneStart');
                    takenStations[data.content] = null;
                    break;
                case 'welcome': //Sent whenever a new player joins
                    if(gameStatus===GS.NOT_CONNECTED){
                        gameStatus = data.content.gameStatus;
                        takenStations = data.content.takenStations;
                    }
                    break;
                case 'startGame': //Sent when the pilot starts the game. Scenes should listen and react to this
                    gameStatus = GS.GAME_STARTED;
                    break;
                case 'endGame': //Sent when the game ends.
                    //TODO create a game over screen
                    switchToScene(getActiveScene(),'SceneStart');
                    power = 0;
                    gameStatus = GS.CONNECTED;                    
                    alert('Game over\n'+data.content);
                    break;
            }            
        } else {
            console.log('Server: '+data.content); 
        }
    });

});
