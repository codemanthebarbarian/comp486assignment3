/**
 * The bumper cars scene representing a bumper cars ride.
 */
class BumperCars extends Phaser.Scene {

    /**
     * The constructor inherited from Phaser.Scene
     */
    constructor() {
        let cfg = {
            key: 'bumpercars',
            physics: {
                default: 'matter',
                matter: {
                    debug: true
                }
            }
        }
        super(cfg);
        this.carTarget = 'target';
        this.carLine = 'line';
    }

    /**
     * The method called by Phaser which loads the scene's assets
     */
    preload() {
        this.load.audio('background', './assets/bumpercars/DesertMarch.mp3');
        this.load.audio('bangShort', './assets/bumpercars/qubodup-BangShort.ogg', { instances: 10 });
        this.load.atlasXML('cars', './assets/bumpercars/spritesheet_vehicles_r.png', './assets/bumpercars/spritesheet_vehicles_r.xml');
        this.load.image('track_tiles', './assets/bumpercars/spritesheet_tiles.png');
        this.load.tilemapTiledJSON('track', './assets/bumpercars/bumpercar_track.json');
    }

    /**
     * The method called by Phaser when the scene is created.
     */
    create() {
        this.music = this.sound.add('background', { loop: true });
        this.music.play();
        this.hitSound = this.sound.add('bangShort', { loop: false });
        this.hits = 0;
        this.score = this.add.text(10, 10, 'Hits: ' + this.hits).setColor('#000000').setDepth(3);
        this.cameras.main.setBackgroundColor('#d3d3d3');
        let track = this.make.tilemap({ key: 'track' });
        let tiles = track.addTilesetImage('track', 'track_tiles');
        track.createStaticLayer('Tile Layer 1', tiles, 0, 0);
        this.debugLine = this.add.graphics({ lineStyle: { width: 1, color: 0xaa00aa } });
        this.matter.world.setBounds(20, 20, track.widthInPixels - 40, track.heightInPixels - 40).disableGravity();
        this.matter.world.on('collisionstart', this.countHits, this);
        this.player = this.matter.add.image(100 , 150, 'cars', 'car_blue_small_5.png');
        this.createCars();
        this.initializeInput();
        this.active = true;
        this.time.delayedCall(60000, () => {
            this.active = false;
            this.make.text({
                x: (game.canvas.clientWidth / 2),
                y: (game.canvas.clientHeight / 2),
                text: [ 'Ride Over', 'Exit to the south' ],
                style: {
                    font: 'bold 25px Arial',
                    fill: 'red'
                }
            }).setDepth(3).setOrigin(.5, .5);
        }, [], this);
    }

    /**
     * The method called by Phaser during the update loop
     */
    update() {
        if(!this.active) return; // Game over
        this.debugLine.clear();
        this.cars.getChildren().forEach(this.updateTarget, this);
        let speed = .12;
        if(this.up.isDown || this.thrust) {
            this.player.thrust(speed);
        }
        if(this.left.isDown) this.player.setAngularVelocity(-.1);
        else if(this.right.isDown) this.player.setAngularVelocity(.1);
    }

    /**
     * The method which initializes the input used by the scene
     */
    initializeInput(){
        let mouseTrack = new Phaser.Geom.Line(this.player.getCenter(), this.player.getCenter());
        this.thrust = false;

        /**
         * The function which is called to exit the scene.
         */
        let exit = function(){
            this.music.stop();
            this.scene.stop();
            this.scene.wake('carnival', { exit: 'bumpercars' });
        };

        /**
         * The method called to move the player's car.
         */
        let move = function(){
            this.thrust = true;
        }

        /**
         * The method called to stop the players car.
         */
        let stop = function(){
            this.thrust = false;
        }

        this.add.text(game.canvas.clientWidth - 20, 10, 'Exit').setOrigin(1, 0)
            .setColor('#000000').setDepth(3).setInteractive()
            .on('pointerdown', exit, this);
        this.input.keyboard.addCapture('UP, DOWN, LEFT, RIGHT');
        this.input.keyboard.on('keydown-ESC', exit, this);
        this.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        this.input.addPointer(1); // need two touch inputs: move and fire
        this.input.on('pointermove', function (pointer) {
            if(!this.active) return;
            //orient the car towards the pointer
            let c = this.player.getCenter();
            mouseTrack.x1 = c.x;
            mouseTrack.y1 = c.y;
            mouseTrack.x2 = pointer.x;
            mouseTrack.y2 = pointer.y;
            let a = Phaser.Math.RadToDeg(Phaser.Geom.Line.Angle(mouseTrack));
            if(this.player.angle > a) this.player.setAngularVelocity(-.1);
            else this.player.setAngularVelocity(.1);
        }, this);
        this.input.on('pointerdown', move, this);
        this.input.on('pointerup', stop, this);
    }

    /**
     * A method to count hits by and to the player's car.
     * @param event the collision event from Phaser
     */
    countHits(event) {

        /**
         * A function to determine if a collision occurred between the player's car
         * @param pair
         */
        let checkCollision = function (pair) {
            if (pair.bodyA.gameObject !== this.player) return;
            this.hitSound.play();
            this.cameras.main.shake(250, .025);
            ++this.hits;
            this.score.text = 'Hits: ' + this.hits;
        };

        let pairs = event.pairs;

        pairs.forEach(checkCollision, this);
    }

    /**
     * A function which will update a target for a non-plyaer car
     * @param car the car to update the target
     */
    updateTarget(car) {
        if(car.name === 'car0') return;
        this.setTarget(car);
        let target = car.getData(this.carTarget);
        let line = car.getData(this.carLine);
        let v = car.getCenter();
        line.x1 = v.x;
        line.y1 = v.y;
        v = this.cars.getChildren().find((c) => c.name === target).getCenter();
        line.x2 = v.x;
        line.y2 = v.y;
        let a = Phaser.Math.RadToDeg(Phaser.Geom.Line.Angle(line));
        if(car.angle > a) car.setAngularVelocity(-.1);
        else car.setAngularVelocity(.1);
        car.thrust(.12);
        this.debugLine.strokeLineShape(line);
    }

    /**
     * A method to set a target for a non-player car. A car will fixate on another car
     * for a random period of time
     * @param car the car to set the target for
     */
    setTarget(car) {
        if(Phaser.Math.Between(-1, 120) > 0) return; // keep same target
        let key = 'car' + Phaser.Math.Between(0, 7);
        if(car.name === key) return; // dont target self
        car.setData(this.carTarget, key);
    }

    /**
     * A method to setup all the non-player cars for the bumper cars session.
     */
    createCars() {
        let car1 = this.matter.add.image(100, 250, 'cars', 'car_red_small_5.png');
        let car2 = this.matter.add.image(100, 300, 'cars', 'car_green_small_5.png');
        let car3 = this.matter.add.image(100, 350, 'cars', 'car_yellow_small_5.png');
        let car4 = this.matter.add.image(800, 150, 'cars', 'car_yellow_small_2.png');
        let car5 = this.matter.add.image(800, 250, 'cars', 'car_red_small_2.png');
        let car6 = this.matter.add.image(800, 350, 'cars', 'car_green_small_2.png');
        let car7  = this.matter.add.image(800, 450, 'cars', 'car_blue_small_2.png');

        this.cars = this.add.group();
        let bounce = 2; let mass = 60; let friction = .10;
        this.player.setBounce(bounce).setMass(mass).setFrictionAir(friction).name = 'car0';
        car1.setBounce(bounce).setMass(mass).setFrictionAir(friction).setDataEnabled().name = 'car1';
        car2.setBounce(bounce).setMass(mass).setFrictionAir(friction).setDataEnabled().name = 'car2';
        car3.setBounce(bounce).setMass(mass).setFrictionAir(friction).setDataEnabled().name = 'car3';
        car4.setBounce(bounce).setMass(mass).setFrictionAir(friction).setDataEnabled().setAngle(180).name = 'car4';
        car5.setBounce(bounce).setMass(mass).setFrictionAir(friction).setDataEnabled().setAngle(180).name = 'car5';
        car6.setBounce(bounce).setMass(mass).setFrictionAir(friction).setDataEnabled().setAngle(180).name = 'car6';
        car7.setBounce(bounce).setMass(mass).setFrictionAir(friction).setDataEnabled().setAngle(180).name = 'car7';
        car1.setData(this.carTarget, car2.name);
        car2.setData(this.carTarget, this.player.name);
        car3.setData(this.carTarget, car7.name);
        car4.setData(this.carTarget, this.player.name);
        car5.setData(this.carTarget, car3.name);
        car6.setData(this.carTarget, car4.name);
        car7.setData(this.carTarget, car2.name);
        car1.setData(this.carLine, new Phaser.Geom.Line(car1.getCenter(), car2.getCenter()));
        car2.setData(this.carLine, new Phaser.Geom.Line(car2.getCenter(), this.player.getCenter()));
        car3.setData(this.carLine, new Phaser.Geom.Line(car3.getCenter(), car7.getCenter()));
        car4.setData(this.carLine, new Phaser.Geom.Line(car4.getCenter(), this.player.getCenter()));
        car5.setData(this.carLine, new Phaser.Geom.Line(car4.getCenter(), car3.getCenter()));
        car6.setData(this.carLine, new Phaser.Geom.Line(car4.getCenter(), car4.getCenter()));
        car7.setData(this.carLine, new Phaser.Geom.Line(car4.getCenter(), car2.getCenter()));
        this.cars.add(this.player).add(car1).add(car2).add(car3).add(car4).add(car5).add(car6).add(car7);
    }

}