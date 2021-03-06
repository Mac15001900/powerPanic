//The one global variable to rule them all; put everything that should be accessible globally here
var g = {
    stationList : ["SceneWeapons", "ScenePiloting", "SceneNavigation", "SceneComms"],
    debug: tempDebugConfigUntilIFigureOutHowToSynchronouslyLoadJSON,
};

//Handle high-level debug options
if(!g.debug.allow_debug){
    Object.entries(g.debug).forEach(entry=>g.debug[entry[0]]=false);
}

//The main menu
var SceneStart = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function SceneStart() {
        Phaser.Scene.call(this, { key: 'SceneStart' });
    }, 

    preload: function() {
        this.load.image('logo', 'assets/textLogo.png'); //Generated with https://cooltext.com/Logo-Design-Supernova

        this.load.image('icon-piloting', 'assets/icon-pilot.png'); //https://game-icons.net/1x1/delapouite/car-seat.html
        this.load.image('icon-weapons', 'assets/icon-weapons.png'); //https://game-icons.net/1x1/lorc/ringed-beam.html
        this.load.image('icon-navigation', 'assets/icon-navigation.png'); //https://game-icons.net/1x1/lorc/radar-sweep.html
        this.load.image('icon-comms', 'assets/icon-communication.png'); //https://game-icons.net/1x1/delapouite/satellite-communication.html

        this.load.image('stars-background', 'assets/blue-sky.jpg');
    },

    create: function() {
        //g.debug = this.cache.json.get('debug-config');

        this.background = this.add.image(-10, -10, 'stars-background').setOrigin(0).setScale(1.6);
        this.background.depth = -10;

        this.textLogo = this.add.image(CANVAS_WIDTH/2, 100, 'logo');

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
            //console.dir(event);

        });

        //Station buttons
        this.buttons = {};
        var buttonX = 120;  //x+x+3dx = 800
        var buttonY = CANVAS_HEIGHT/2 + 50;
        var buttonDx = (CANVAS_WIDTH-buttonX*2)/3;
        this.buttons['ScenePiloting'] = new StationButton(this, 'icon-piloting', 'Piloting', 'ScenePiloting', {x:buttonX, y:buttonY});
        this.buttons['SceneWeapons'] = new StationButton(this, 'icon-weapons', 'Weapons', 'SceneWeapons', {x:buttonX + buttonDx, y:buttonY});
        this.buttons['SceneNavigation'] = new StationButton(this, 'icon-navigation', 'Navigation', 'SceneNavigation', {x:buttonX + buttonDx*2, y:buttonY});
        this.buttons['SceneComms'] = new StationButton(this, 'icon-comms', 'Comms', 'SceneComms', {x:buttonX + buttonDx*3, y:buttonY});

    },

    update: function(timestep, dt) {
        //Note: those have to be here, otherwise they don't see this.scene properly
        if(g.gameStatus === GS.NOT_CONNECTED) return; //Don't switch until there's a connection
        if(this.keyW.isDown) switchToScene(this,'SceneWeapons');
        if(this.keyN.isDown) switchToScene(this,'SceneNavigation');
        if(this.keyP.isDown) switchToScene(this,'ScenePiloting');
        if(this.keyS.isDown) switchToScene(this,'SceneShields');
        if(this.keyC.isDown) switchToScene(this,'SceneComms');

        for (var i = 0; i < g.stationList.length; i++) {
            var station = g.stationList[i];
            if(takenStations[station]) this.buttons[station].takeOver(nameFromId(takenStations[station]));
            else if (this.buttons[station]) this.buttons[station].free();
        }

    },

    receiveMessage: function (){},

});




//Station switching

var takenStations = {};
function switchToScene(currentScene, targetScene, freeCurrent=true) {
    if(g.gameStatus === GS.NOT_CONNECTED) return;
    var currentKey = currentScene.scene.key;
    console.log('Switching from '+currentKey);

    if(takenStations[targetScene] && targetScene !== 'SceneStart' && !g.debug.ignore_taken_stations){
        console.error('Tried to switch to a taken station '+targetScene);
        return false;
    }

    
    if(g.stationList.includes(currentKey) && freeCurrent){
        takenStations[currentKey] = null;        
        sendMessage('stationLeft', currentKey);
    }
    
    if(g.stationList.includes(targetScene)){
        sendMessage('stationTaken', targetScene);
        console.log('Taking over '+targetScene);
        if(g.gameStatus !== GS.CONNECTED) console.error('Switching to station with gamestate '+g.gameStatus);
        takenStations[currentKey] = drone.clientId;
    }
    
    currentScene.scene.start(targetScene);
}

function endGame(message) {
    if(g.gameStatus !== GS.GAME_STARTED) return;
    console.log('Ending the game');
    g.gameStatus = GS.GAME_OVER;
    sendMessage('endGame',message);    
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
g.gameStatus = GS.NOT_CONNECTED;
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
        scene:  [SceneStart, SceneNavigation, SceneWeapons, ScenePiloting, SceneShields, SceneComms],
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

function nameFromId(id){
    return members.filter(m=>m.id===id)[0].clientData.name;
}

const drone = new ScaleDrone(CHANNEL_ID, {
  data: { // Will be sent out as clientData via events
    name: getUsername(),
  },
});

function sendMessage(type, content) {
    if(g.debug.disable_messages) return;
    var message = {type: type, content: content};
    if(members.length === 1) mainReceiveMessage(message, members[0]);
    else drone.publish({room: roomName, message: message}); 
}

g.activeScene = function() {
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
       console.log('Successfully joined room '+roomName);
    });
     
     // List of currently online members, emitted once
    room.on('members', m => {
        members = m;
        if(members.length === 1 ){
            g.gameStatus = GS.CONNECTED;
        }
    });
     
    // User joined the room
    room.on('member_join', member => {
        members.push(member);
        sendMessage('welcome', {gameStatus: g.gameStatus, takenStations: takenStations});
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
    });

    room.on('data', mainReceiveMessage);

});

function mainReceiveMessage(data, serverMember){
    //Data is received here
    var currentScene = g.activeScene();
    currentScene.receiveMessage(data);      
    console.log(data);
    if (serverMember) {        
        switch(data.type){
            case 'test': alert(serverMember.clientData.name+' sends a test message: '+data.content); break;
            case 'stationLeft': //Sent whenever someone leaves a station
                takenStations[data.content] = null;
                console.log(serverMember.clientData.name + ' leaves '+data.content);
                break;
            case 'stationTaken': //Sent whenever someone takes over a station
                if(data.content === 'SceneStart') console.error(serverMember.clientData.name + ' just reserved the main menu...');                
                if(currentScene.scene.key === data.content && serverMember.id != drone.clientId){
                    //Someone else joined our scene
                    sendMessage('stationJammed', data.content);
                }
                takenStations[data.content] = serverMember.id;
                console.log(serverMember.clientData.name + ' takes over '+data.content);
                break;
            case 'stationJammed': //For whatever reason, there are multiple people on the same station. Recover by having them all leave.
                console.error('Scene jam at '+data.content)
                if(currentScene.scene.key === data.content && !g.debug.ignore_taken_stations) switchToScene(currentScene,'SceneStart');
                takenStations[data.content] = null;
                break;
            case 'welcome': //Sent whenever a new player joins
                if(g.gameStatus===GS.NOT_CONNECTED){
                    g.gameStatus = data.content.gameStatus;
                    takenStations = data.content.takenStations;
                }
                break;
            case 'startGame': //Sent when the pilot starts the game. Scenes can listen and react to this, or just poll gameStatus
                g.gameStatus = GS.GAME_STARTED;
                break;
            case 'endGame': //Sent when the game ends.
                //TODO create a game over screen
                switchToScene(currentScene,'SceneStart');
                power = 0;
                g.gameStatus = GS.CONNECTED;                    
                alert('Game over\n'+data.content);
                break;
        }            
    } else {
        console.log('Server: '+data.content); 
    }
}
