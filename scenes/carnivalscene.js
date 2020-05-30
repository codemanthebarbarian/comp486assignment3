
class CarnivalScene extends Phaser.Scene {

    constructor() {
        super('carnival');
    }

    preload() {
        this.load.image('city', './assets/carnival/magecity.png');
        this.load.image('fence', './assets/carnival/fence_medieval.png');
        this.load.image('deco', './assets/carnival/decorations-medieval.png');
        this.load.tilemapTiledJSON('map', './assets/carnival/carnival.json');
        this.load.atlas('guy',  './assets/carnival/MainGuySpriteSheet.png',  './assets/carnival/MainGuySpriteSheet.json');
    }

    create() {
        this.events.on('pause', this.input.keyboard.resetKeys, this.input.keyboard);
        this.events.on('sleep', this.input.keyboard.resetKeys, this.input.keyboard);
        this.events.on('wake', this.onWake, this);
        this.map = this.make.tilemap({ key: 'map' });
        var tilesMage = this.map.addTilesetImage('magecity', 'city');
        var tilesDeco = this.map.addTilesetImage('deco-med', 'deco');
        var tilesFence = this.map.addTilesetImage('fence_medieval', 'fence');
        // these layers are painted below the player
        this.ground = this.map.createStaticLayer('ground', [ tilesDeco, tilesMage, tilesFence ], 0, 0);
        this.fences = this.map.createStaticLayer('Fence', [ tilesDeco, tilesMage, tilesFence ], 0, 0);
        this.mapObjects = this.map.getObjectLayer('objects');

        this.ground.setCollisionByProperty({ collideable: true });
        this.fences.setCollisionByProperty({ collideable: true });

        let spawnPoint = this.mapObjects.objects.find((o) => o.name === 'spawn', this);
        this.player = this.physics.add.sprite(spawnPoint.x , spawnPoint.y, 'guy');
        this.setupPlayer();
        // These layers are painted on top of the player
        this.buildings = this.map.createStaticLayer('buildings', [ tilesDeco, tilesMage, tilesFence ], 0, 0);
        this.top = this.map.createStaticLayer('top',  [ tilesDeco, tilesMage, tilesFence ], 0, 0);
        this.buildings.setCollisionByProperty({ collideable: true });
        this.top.setCollisionByProperty({ collideable: true });

        this.player.setCollideWorldBounds(true);
        this.player.on('zoneexit', () => this.player.setData('zoneoverlap', false), this);
        this.physics.add.collider(this.player, this.ground, null, null, this);
        this.physics.add.collider(this.player, this.fences, null, null, this);
        this.physics.add.collider(this.player, this.buildings, null, null, this);
        this.physics.add.collider(this.player, this.top, null, null, this);

        this.buildStages();
        this.pointerLine = new Phaser.Geom.Line(this.player.getCenter(), this.player.getCenter());
        this.debugLine = new Phaser.Geom.Line(this.player.getCenter(), this.player.getCenter());
        this.textDebug = this.add.text(500, 500, 'TEXT');

        //  Set the camera and physics bounds to be the size of 4x4 bg images
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        //this.input.on('pointerdown', function (pointer) {
            //this.scene.switch('shootinggallery');
            //this.scene.switch('bumpercars');
        //, this);

        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        this.debugGraphics = this.add.graphics();
        this.drawDebug();
    }

    onWake(sys, data) {
        this.player.setData('zoneoverlap', true);
        if(data && data.exit == 'bumpercars'){
            let pnt = this.mapObjects.objects.find(o => o.name === 'bumpercars_exit', this);
            this.player.setData('bumpercars', 'exit')
            this.player.x = pnt.x;
            this.player.y = pnt.y;
        }
    }

    update() {
        if(!this.player.body.embedded && this.player.body.wasTouching) this.player.emit('zoneexit');
        this.debugPointer();
        let animation = this.player.anims.currentAnim ? this.player.anims.currentAnim.key : 'down';
        let speed = 75;
        if(this.up.isDown) {
            this.player.body.setVelocityY(speed * -1);
            animation = 'walk-up';
        } else if(this.down.isDown) {
            this.player.body.setVelocityY(speed);
            animation = 'walk-down';
        } else {
            this.player.body.setVelocityY(0);
        }
        if(this.left.isDown) {
            this.player.body.setVelocityX(speed * -1);
            animation = 'walk-left';
        } else if(this.right.isDown) {
            this.player.body.setVelocityX(speed);
            animation = 'walk-right';
        } else {
            this.player.body.setVelocityX(0);
        }
        if(this.input.mousePointer.isDown){
            let x = this.input.mousePointer.worldX;
            let y = this.input.mousePointer.worldY;
            animation = this.handlePointerMove(x, y, speed, animation);
        }
        if(this.input.pointer1.isDown){
            let x = this.input.pointer1.worldX;
            let y = this.input.pointer1.worldY;
            animation = this.handlePointerMove(x, y, speed, animation);
        }
        if( this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0)
            animation = animation.replace('walk-', '');
        this.player.anims.play(animation, true);
        this.player.body.velocity.normalize().scale(speed);
    }

    debugPointer() {
        let ctr = this.player.getCenter();
        this.debugLine.x1 = ctr.x;
        this.debugLine.y1 = ctr.y;
        ctr.x = this.input.mousePointer.worldX;
        ctr.y = this.input.mousePointer.worldY;
        this.debugLine.x2 = ctr.x;
        this.debugLine.y2 = ctr.y;
        this.textDebug.x = ctr.x;
        this.textDebug.y = ctr.y;
        this.textDebug.text = Phaser.Geom.Line.Angle(this.debugLine);
    }

    handlePointerMove(x, y, speed, animation) {
        let ctr = this.player.getCenter();
        this.pointerLine.x1 = ctr.x;
        this.pointerLine.y1 = ctr.y;
        this.pointerLine.x2 = x;
        this.pointerLine.y2 = y;
        let a = Phaser.Geom.Line.Angle(this.pointerLine);
        let l = Phaser.Geom.Line.Length(this.pointerLine);
        if(l > 50){
            if(a > -2.5 && a < -.7) {
                this.player.body.setVelocityY(speed * -1);
                animation = 'walk-up';
            } else if(a < 2.5 && a > .7) {
                this.player.body.setVelocityY(speed);
                animation = 'walk-down';
            } else {
                this.player.body.setVelocityY(0);
            }
            if(a < -2 || a > 2) {
                this.player.body.setVelocityX(speed * -1);
                animation = 'walk-left';
            } else if(a > -1 && a < 1 ) {
                this.player.body.setVelocityX(speed);
                animation = 'walk-right';
            } else {
                this.player.body.setVelocityX(0);
            }
        }
        return animation;
    }

    setupPlayer() {
        this.player.setSize(20,25,true);
        this.player.setDataEnabled();
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNames('guy', { prefix: 'MainGuy', frames: [ 10 ], zeroPad: 4 }),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNames('guy', { prefix: 'MainGuy', start: 9, end: 11, zeroPad: 4 }),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNames('guy', { prefix: 'MainGuy',  frames: [ 4 ], zeroPad: 4 }),
            frameRate: 20,
            repeat: 1
        });
        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNames('guy', { prefix: 'MainGuy', start: 3, end: 5, zeroPad: 4}),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNames('guy', { prefix: 'MainGuy', frames: [ 1 ], zeroPad: 4 }),
            frameRate: 20,
            repeat: 1
        });
        this.anims.create({
            key: 'walk-down',
            frames: this.anims.generateFrameNames('guy', { prefix: 'MainGuy', start: 0, end: 2, zeroPad: 4 }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNames('guy', { prefix: 'MainGuy', frames: [ 7 ], zeroPad: 4 }),
            frameRate: 20,
            repeat: 1
        });
        this.anims.create({
            key: 'walk-up',
            frames: this.anims.generateFrameNames('guy', { prefix: 'MainGuy', start: 6, end: 8, zeroPad: 4 }),
            frameRate: 5,
            repeat: -1
        });
    }

    drawDebug ()
    {
        //debugGraphics.clear();

        //if (showDebug)
        //{
            // Pass in null for any of the style options to disable drawing that component
            this.map.renderDebug(this.debugGraphics, {
                tileColor: null, // Non-colliding tiles
                collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200), // Colliding tiles
                faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Colliding face edges
            }, this.ground);
        //}

        //helpText.setText(getHelpMessage());
    }

    buildStages() {
        this.buildStory('entrance', 'entrance', 'entrance');
        this.buildStage('bumpercars',
            () => {
                if(this.player.data.values.bumpercars === 'enter') return;
                this.player.setData('bumpercars', 'enter');
                this.scene.switch('bumpercars');
            });
        this.buildStage('shootinggallery',
            () => {
                if(this.player.getData('zoneoverlap')) return;
                this.player.setData('zineoverlap', true);
                //if(this.player.data.values.shootinggallery === 'enter') return;
                this.player.setData('shootinggallery', 'enter');
                this.scene.switch('shootinggallery');
            });
    }

    buildStory(zone, key, stage, file) {
        let obj = this.mapObjects.objects.find(o => o.name === zone, this);
        let zn = this.add.zone(obj.x, obj.y, obj.width, obj.height);
        zn.name = zone;
        let sn = this.scene.add(key, StoryScene, false, { story: stage})
        this.physics.world.enable(zn);
        zn.body.debugBodyColor = 0xffff00;
        this.physics.add.overlap(this.player, zn, () => {
            if(this.player.getData('zoneoverlap')) return;
            this.player.setData('zoneoverlap', true);
            //if(this.player.data.values.entrance) return;
            this.player.body.setVelocityY(0);
            this.player.body.setVelocityX(0);
            this.player.setData('entrance', 'complete');
            this.scene.sleep();
            this.scene.run(key); //, { stage: 'entrance'});
        }, null, this);
    }

    buildStage(name, onOverlap) {
        let obj = this.mapObjects.objects.find(o => o.name === name, this);
        let zn = this.add.zone(obj.x, obj.y, obj.width, obj.height);
        zn.name = name;
        this.physics.world.enable(zn);
        zn.body.debugBodyColor = 0xffff00;
        this.physics.add.overlap(this.player, zn, onOverlap, null, this);
    }
}
