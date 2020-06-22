/**
 * The main scene for the game. This is the carnival and the map which the player
 * accesses other game elements.
 */
class CarnivalScene extends Phaser.Scene {

    /**
     * The scene constructor inherited from Phaser 3 scene
     */
    constructor() {
        super('carnival');
    }

    /**
     * Preloads any game assets required by the scene. These assets include the tiled JSON map file and
     * any related graphical and sound elements.
     */
    preload() {
        this.load.audio('rollupSong', './assets/carnival/RollUp.ogg');
        this.load.image('city', './assets/carnival/magecity.png');
        this.load.image('fence', './assets/carnival/fence_medieval.png');
        this.load.image('deco', './assets/carnival/decorations-medieval.png');
        this.load.tilemapTiledJSON('map', './assets/carnival/carnival.json');
        this.load.atlas('guy',  './assets/carnival/MainGuySpriteSheet.png',  './assets/carnival/MainGuySpriteSheet.json');
    }

    /**
     * Creates the initial scene. This is responsible for displaying the carnival map, setting up collision items,
     * starting any background audio, loading the player sprite, and setting up the zones for triggering the
     * other game elements.
     */
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
        // needs to be a dynamic layer to open close gates
        this.fences = this.map.createDynamicLayer('Fence', [ tilesDeco, tilesMage, tilesFence ], 0, 0);
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

        this.music = this.sound.add('rollupSong', { loop: true, volumne: .7});
        this.music.play();

        this.buildStages();
        this.loadText();
        this.setGates();
        this.pointerLine = new Phaser.Geom.Line(this.player.getCenter(), this.player.getCenter());
        this.debugLine = new Phaser.Geom.Line(this.player.getCenter(), this.player.getCenter());

        //  Set the camera and physics bounds to be the size of 4x4 bg images
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.setActionKeys();

        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        this.debugGraphics = this.add.graphics();
        this.drawDebug();
    }

    /**
     * Called when this scene awakes after the player interacts with a separate scene, it sets the sprite location or could
     * disable a zone so as not to continuously trigger a loop.
     * @param sys
     * @param data
     */
    onWake(sys, data) {
        if(this.music.isPaused) this.music.resume();
        if(!this.music.isPlaying) this.music.play();
        this.player.setData('zoneoverlap', true);
        if(data && data.exit == 'bumpercars'){
            let pnt = this.mapObjects.objects.find(o => o.name === 'bumpercars_exit', this);
            this.player.setData('bumpercars', 'exit')
            this.player.x = pnt.x;
            this.player.y = pnt.y;
        }
        //set the blocked sections
        this.setGates();
    }

    setActionKeys() {
        let showInventory = function(){
            this.scene.switch('inventory');
        }
        this.input.keyboard.on('keydown-I', showInventory, this);
    }

    /**
     * Set the gates for the areas the player can currently access based on their story state.
     */
    setGates(){
        /**
         * Removes a tile from the fence layer.
         * @param obj the map object representing the gate
         */
        let removeTile =  function(obj) {
            var x = this.map.worldToTileX(obj.x);
            var y = this.map.worldToTileY(obj.y);
            var tile = this.map.getTileAt(x, y, false, 'Fence');
            if(tile) this.map.removeTileAt(x, y, true, true, 'Fence');
        }

        /**
         * Adds the tile to the map layer.
         * @param obj the map object representing the gate
         */
        let addTile = function(obj){
            var x = this.map.worldToTileX(obj.x);
            var y = this.map.worldToTileY(obj.y);
            var tile = this.map.getTileAt(x, y, false, 'Fence');
            if(tile) return; // tile is there
            tile =this.map.putTileAt(obj.gid, x, y, true, 'Fence');
            if(tile) tile.setCollision(true, true, true, true);
        }

        let setBeerGarden = function(){
            let obj = this.mapObjects.objects.find(o => o.name === 'beergardengate');
            if(!obj) return;
            let openState = 'CHECKED';
            let state = this.quests.getState('beergarden');
            if(state && state === openState) removeTile.bind(this)(obj);
            else addTile.bind(this)(obj);
        }

        setBeerGarden.bind(this)();
    }

    /**
     * Called by Phaser during the update loop. This primarily updates the player object allows for
     * user interaction.
     */
    update() {
        if(!this.player.body.embedded && this.player.body.wasTouching) this.player.emit('zoneexit');
        //this.debugPointer();
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

    /**
     * used to debug pointer position. Was used when enabling mouse support.
     */
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

    /**
     * Used to handle player movement when using the mouse or touchscreen.
     * @param x the pointer x coordinate
     * @param y the pointer y coordinate
     * @param speed The speed to move the player
     * @param animation the animation to play
     * @returns {string} the animation key
     */
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

    /**
     * Sets up the player object. Creates the movement animations with keys.
     */
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

    /**
     * Used for debugging to identify colliding tiles.
     */
    drawDebug ()
    {
        // Pass in null for any of the style options to disable drawing that component
        this.map.renderDebug(this.debugGraphics, {
            tileColor: null, // Non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200), // Colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Colliding face edges
        }, this.ground);
    }

    /**
     * builds the game stages such as mini-games and story elements.
     */
    buildStages() {
        this.buildStory('entrance', 'entrance', 'entrance', 'entrance');
        this.buildStory('bumpercars', 'bumpercarsstory', 'bumpercarsstory', 'bumpercars');
        this.buildStory('shootinggallery', 'shootinggallerystory', 'shootinggallerystory', 'shootinggallery');
        this.buildStory('beergarden', 'beergardenentrance', 'beergardenentrance', 'beergarden');
        this.buildStory('pettingzoo', 'pettingzooentrance', 'pettingzooentrance', 'pettingzoo');
        this.buildStory('prizebooth1', 'prizebooth', 'prizebooth', 'prizebooth');
        this.buildStory('prizebooth2', 'prizebooth', 'prizebooth', 'prizebooth');
        this.buildStory('ticketbooth1', 'ticketbooth', 'ticketbooth', 'ticketsbooth');
        this.buildStory('ticketbooth2', 'ticketbooth', 'ticketbooth', 'ticketsbooth');
        this.buildStory('duck', 'duck', 'duck', 'duck');
    }

    /**
     * Builds a story element and binds it to a zone which can be triggered by the player.
     * @param zone the zone to bind the story to.
     * @param key the story key.
     * @param stage the story stage
     * @param file the name of the story's JSON file.
     */
    buildStory(zone, key, stage, file) {
        let obj = this.mapObjects.objects.find(o => o.name === zone, this);
        let zn = this.add.zone(obj.x, obj.y, obj.width, obj.height);
        zn.name = zone;
        if(!this.scene.manager.keys[key])  // add the scene if it does not exist
            this.scene.add(key, StoryScene, false, { story: file});
        this.physics.world.enable(zn);
        zn.body.debugBodyColor = 0xffff00;
        this.physics.add.overlap(this.player, zn, () => {
            if(this.player.getData('zoneoverlap')) return;
            this.player.setData('zoneoverlap', true);
            this.player.body.setVelocityY(0);
            this.player.body.setVelocityX(0);
            this.scene.sleep();
            this.scene.run(stage);
        }, null, this);
    }

    loadText(){
        let textObjects = this.map.filterObjects(this.mapObjects, o => {
            if(o.text) return true;
        }, this);
        textObjects.forEach(o => {
            this.add.text(o.x + (o.width / 2), o.y + (o.height / 2), o.text.text, {
                color: o.text.color,
                fontSize: o.text.height + 'px',
                align: 'center',
                backgroundColor: '#70706F',
                wordWrap: {
                    width: o.width,
                    useAdvancedWrap: true
                }
            }).setOrigin(.5, .5);
        }, this);
    }
}
