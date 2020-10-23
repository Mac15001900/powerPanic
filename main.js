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
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    var currentStation = 'WEAPONS';
    var station = ['WEAPONS','NAVIGATION','PILOT','SHIELD'];

    var game = new Phaser.Game(config);
    var text;
    var keyA;

    function preload ()
    {
        this.load.image('logo', 'assets/testLogo.png');     
        console.log(game)   ;
        console.log(currentStation);
        console.log(text);

    }

    function create ()
    {
        text = this.add.text(200, 200, '', { font: "32px Arial", fill: "#19de65" });
        text.text = 'This is definitely not  '+currentStation;

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

        /*this.input.on('pointerdown', function () {

            console.log('Going to Navigation');

            this.scene.start('SceneNavigation');

        }, this);  */      

        //keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    }

    function update(timestep, dt) {
        console.log('Update called with dt: '+dt)
        /*if(keyA.isDown()){
            console.log('A is held down');
        }*/
    }