/**
 * Represents a cave level in the game
 */
class Cave extends Phaser.Scene {
    /**
     * The constructor inherited from Phaser.Scene
     */
    constructor() {
        super('cave');
    }

    /**
     * loads the cave assets.
     */
    preload() {
        this.load.spritesheet('bat', './assets/cave/32x32-bat-sprite.png', { frameWidth: 32, frameHeight: 32 } );
        this.load.image('cave_bullet', './assets/cave/icon_bullet_gold_short.png');
        this.load.atlasXML('hud', './assets/shootinggallery/spritesheet_hud.png',
            './assets/shootinggallery/spritesheet_hud.xml');
        this.load.spritesheet('blood', './assets/cave/BloodParticle.png', { frameWidth: 128, frameHeight: 128} );
        this.load.image('caveset', './assets/cave/cavern_ruins.png');
        this.load.tilemapTiledJSON('cavemap', './assets/cave/cave0.json');
    }

    /**
     * Create the instance of the cave level
     */
    create() {
        this.level = this.quests.getState('caveLevel');
        if(! this.level) {
            this.level = 1;
            this.quests.setState('caveLevel', this.level);
            this.quests.save();
        }
        this.initializeMap();
        this.initialzePlayer();

        let center = this.player.getCenter();
        this.visible = this.add.circle(center.x, center.y, 350);
        this.physics.world.enable(this.visible);
        if(isDebugging) this.visible.setStrokeStyle(1, 0xaa00aa);
        this.particles = this.add.particles('blood');
        this.emitter = this.particles.createEmitter({
            frame: [ 0, 1, 2, 3, 4, 5, 6, 7],
            quantity: 10,
            lifespan: 500,
            speed: { min: 50, max: 150 },
            scale: { start: .1, end: .05 },
            alpha: { start: 1, end: 0 },
            on: false
        });

        let onWorldBounds = function(body){
            let obj = body.gameObject;
            if(obj.onWorldBoundsHandler) obj.onWorldBoundsHandler();
        };

        this.initializeInput();
        this.initializeEnemy();
        this.initializeWeapon();
        this.physics.world.on('worldbounds', onWorldBounds);
        //this.physics.add.overloap(this.enemies, this.visible);
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
        this.kills = 0;
        this.score = this.add.text(10,10, "Kills: " + this.kills).setFontSize(50).setColor('#ffff00').setDepth(7).setOrigin(0,0);
        this.score.setScrollFactor(0);
    }

    update (time, delta) {

        /**
         * Tries to fire the weapon.
         */
        let tryFire = function () {
            if (this.lastFire < this.weapon.fireRate) return;
            this.doFire();
        }

        /**
         * The package of parameters used in player update
         * @type {{dirY: number, dirX: number, aim: number, isWalking: number, direction: number}}
         */
        let params = {
            isWalking: 0, // is the player walking
            direction: 0, // the new facing direction
            dirY: 0,      // y direction (up -1 down 1)
            dirX: 0,      // x direction (left -1 or right 1)
            aim: 0        // aim direction
        }

        let calcDirection = function() {
            if(!params.dirX && !params.dirY) return params.direction = this.player.facing;
            if(params.dirY){
                params.direction = params.dirY > 0 ? 90 : -90;
                if(params.dirX) {
                    params.direction = params.dirX > 0 ?
                        (45 * params.dirY) :
                        (135 * params.dirY);
                }
            } else {
                // we are facing left or right
                params.direction = params.dirX > 0 ? 0 : -180;
            }
        };

        /**
         * Update the line used to set the crosshairs using the mouse
         * @return {null|number|LineAndPositionSetting}
         */
        let updateLine = function() {
            if(this.pointer.x < 0) return null;
            let p = this.player.getCenter();
            this.line.x1 = p.x;
            this.line.y1 = p.y;
            this.line.x2 = this.pointer.x;
            this.line.y2 = this.pointer.y;
            this.pointer.x = -1;
            return this.line;
        };
        //check if player exited zone
        if(!this.player.body.embedded && this.player.body.wasTouching) this.player.emit('zoneexit');
        let c = this.player.getCenter();
        this.visible.setPosition(c.x, c.y);
        this.lastFire += delta;
        this.handleInput(params);
        calcDirection.bind(this)();
        this.player.setAnimation(params.isWalking, params.direction);
        this.aim.update(this.player.getCenter(), this.player.facing, params.aim, updateLine.bind(this)());
        var inRange = this.physics.overlapCirc(this.visible.x, this.visible.y, this.visible.radius, true, true);
        var ctr = this.player.getCenter();
        inRange.forEach(body => {
            let go = body.gameObject;
            if(go.name && go.name.includes('bat')) go.update(time, delta, ctr);
        }, this);
        if(this.fire) tryFire.bind(this)();
    }

    /**
     * The function which is called to exit the scene.
     */
    exit() {
        //this.music.stop();
        this.scene.stop();
        this.scene.wake('carnival', { exit: 'cave' });
    };

    onHitEnemy(bullet, enemy) {
        if(!bullet.active || !enemy.active) return;
        let isKilled = enemy.registerHit(this.weapon.damage);
        if(isKilled) {
            ++this.kills;
            this.score.setText('Kills: ' + this.kills);
        }
        this.emitter.setAngle(bullet.body.gameObject.angle);
        this.particles.emitParticleAt(enemy.x, enemy.y);
        bullet.recycle();
    }

    initializeMap() {
        this.map = this.make.tilemap({ key: 'cavemap' });
        let tilesCave = this.map.addTilesetImage('cavern_ruins', 'caveset');
        this.ground = this.map.createStaticLayer('ground', tilesCave, 0, 0);
        this.top = this.map.createStaticLayer('top', tilesCave, 0, 0).setDepth(6);
        this.wallMid = this.map.createStaticLayer('wallMid', tilesCave, 0, 0).setDepth(5);
        this.wallBottom = this.map.createStaticLayer('wallBottom', tilesCave, 0 ,0).setDepth(5);
        this.itemsBottom = this.map.createStaticLayer('itemsBottom1', tilesCave, 0, 0).setDepth(4);
        this.mapObjects = this.map.getObjectLayer('objects1');
        this.ground.setCollisionByProperty({ collideable: true });
        this.top.setCollisionByProperty({ collideable: true });
        this.wallMid.setCollisionByProperty({ collideable: true });
        this.wallBottom.setCollisionByProperty({ collideable: true });
        this.itemsBottom.setCollisionByProperty({ collideable: true });
        this.cameras.main.setBounds(0, 0,  this.map.widthInPixels, this.map.heightInPixels);
        this.physics.world.setBounds(0, 0,  this.map.widthInPixels, this.map.heightInPixels);
    }

    initializeEnemy() {
        //let spawnPoints = this.mapObjects.objects.filter(o => o.name.includes('spawn'));
        let initializeBats = function() {
            //let spawn = this.mapObjects.objects.find((o) => o.name === 'spawn1', this);
            //let rect = new Phaser.Geom.Rectangle(spawn.x, spawn.y, spawn.width, spawn.height);
            let items = [];
            let spawnPoints = this.mapObjects.objects.filter(o => o.name.includes('spawn'));
            spawnPoints.forEach( spawn => {
                let rect = new Phaser.Geom.Rectangle(spawn.x, spawn.y, spawn.width, spawn.height);
                for (let i = 0; i < 10; ++i) {
                    let pt = rect.getRandomPoint();
                    items.push(this.add.existing(
                        new Bat(this, pt.x, pt.y, this.level).setName('bat' + i)
                    ));
                }
            }, this);
            this.enemies = this.physics.add.group({
                allowRotation: false,
                collideWorldBounds: true
            });
            this.enemies.addMultiple(items);
            this.enemies.children.each(bat => {
                bat.body.setSize(20, 16, true);
                bat.anims.play('bat-down');
                bat.setDepth(3);
            } );
            this.enemies.runChildUpdate = false;
            this.physics.add.collider(this.enemies, this.top, null, null, this);
            this.physics.add.collider(this.enemies, this.wallMid, null, null, this);
            this.physics.add.collider(this.enemies, this.wallBottom, null, null, this);
            // leave items bottom, bats can fly over them
        };
        initializeBats.bind(this)();

        this.physics.add.collider(this.enemies);
        this.physics.add.collider(this.player, this.enemies);
    }

    initializeWeapon() {

        this.weapon = this.weapons.get('Shotgun');

        let initializeBullets = function() {
            let items = [];
            for(let i = 0 ; i < 50 ; ++i){
                let bullet = new Bullet(this, -50,-50, this.weapon.range, this.weapon.velocity);
                bullet.setDepth(3);
                let b = this.add.existing(bullet);
                items.push(b);
            }
            this.bullets = this.physics.add.group({
                maxSize: 50,
                allowRotation: false,
                collideWorldBounds: true
            });
            this.bullets.addMultiple(items);
            this.bullets.runChildUpdate = true;
        };

        let onMapCollideHandler = function(bullet, bodyB){
            let bulletGameObject = bullet.gameObject;
            if(bullet.recycle) bullet.recycle()
            else if(bulletGameObject && bulletGameObject.recycle) bulletGameObject.recycle();
        }

        /**
         * fire a single projectile
         */
        let fireSingle = function() {
            let bullet = this.bullets.get();
            if(bullet){
                bullet.fire(this.player.getCenter(), this.aim.direction);
                this.lastFire = 0;
            }
        };

        /**
         * fire a single projectile
         */
        let fireScatter = function() {
            for(let i = 0 ; i < 7 ; ++i) {
                let bullet = this.bullets.get();
                if (bullet) {
                    let angle = Phaser.Math.Between(-6, 6) + this.aim.direction;
                    let range = Phaser.Math.Between(-40, 15) + this.weapon.range;
                    let velocity = Phaser.Math.Between(-125, 75) + this.weapon.velocity;
                    bullet.fire(this.player.getCenter(), angle, range, velocity);
                    this.lastFire = 0;
                }
            }
        };

        this.doFire = this.weapon.name === 'Shotgun' ? fireScatter : fireSingle;

        initializeBullets.bind(this)();
        this.physics.add.collider(this.bullets, this.wallBottom, onMapCollideHandler, null, this);
        this.physics.add.collider(this.bullets, this.top, onMapCollideHandler, null, this);
        this.physics.add.collider(this.bullets, this.wallMid, onMapCollideHandler, null, this);
        this.physics.add.collider(this.bullets, this.itemsBottom, onMapCollideHandler, null, this);
        this.physics.add.collider(this.bullets, this.enemies, this.onHitEnemy, null, this);

        this.lastFire = 0;
    }

    initialzePlayer() {
        let spawnPoint = this.mapObjects.objects.find((o) => o.name === 'player', this);
        this.player = this.physics.add.existing(this.add.existing(new Player(this, spawnPoint.x, spawnPoint.y))).setDepth(1);
        this.player.body.setCollideWorldBounds(true);
        this.aim = this.add.existing(new Crosshair(this, this.player.getCenter(), this.physics.world.bounds)).setDepth(8);
        this.player.on('zoneexit', () => this.player.setData('zoneoverlap', false), this);
        this.physics.add.collider(this.player, this.wallBottom, null, null, this);
        this.physics.add.collider(this.player, this.wallMid, null, null, this);
        this.physics.add.collider(this.player, this.top, null, null, this);
        this.physics.add.collider(this.player, this.itemsBottom, null, null, this);
        // setup the player exit
        let obj = this.mapObjects.objects.find(o => o.name === 'exit', this);
        let zn = this.add.zone(obj.x, obj.y, obj.width, obj.height);
        this.physics.world.enable(zn);
        zn.body.debugBodyColor = 0xffff00;
        this.physics.add.overlap(this.player, zn, () => {
            if(this.player.getData('zoneoverlap')) return;
            this.player.setData('zoneoverlap', true);
            this.player.body.setVelocityY(0);
            this.player.body.setVelocityX(0);
            if(this.enemies.children.entries.filter( e => e.stats.hitPoints > 0).length > 0) return;
            this.exit();
        }, null, this);
    }

    initializeInput() {
        //grab tin input keys
        this.input.keyboard.addCapture('UP, DOWN, LEFT, RIGHT, SPACE');
        this.cursors = this.input.keyboard.createCursorKeys();
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.input.keyboard.on('keydown-ESC', this.exit, this);
        this.pointer = new Phaser.Math.Vector2(-1,-1);
        this.line = new Phaser.Geom.Line(this.player.x, this.player.y, this.aim.x, this.aim.y);
        this.input.on('pointermove', function(pointer){
            this.pointer.x = pointer.worldX;
            this.pointer.y = pointer.worldY;
        }, this);
        this.fire = false;

        /**
         * Use the right handed keyboard layout. This will use the arrow keys for
         * target firing and WASD for movement.
         */
        let righty = function(params) {
            let speed = this.player.stats.speed;
            this.fire = this.input.activePointer.isDown || this.cursors.up.isDown;
            if(this.cursors.left.isDown) params.aim = -1;
            if(this.cursors.right.isDown) params.aim = 1;

            if (this.W.isDown) {
                params.dirY = -1;
                params.isWalking = 1;
                this.player.body.setVelocityY(-speed);
            } else if (this.S.isDown) {
                params.dirY = 1;
                params.isWalking = 1;
                this.player.body.setVelocityY(speed);
            } else this.player.body.setVelocityY(0);

            if (this.A.isDown) {
                params.isWalking = 1;
                params.dirX = -1;
                this.player.body.setVelocityX(-speed);
            } else if (this.D.isDown) {
                params.isWalking = 1;
                params.dirX = 1;
                this.player.body.setVelocityX(speed);
            } else this.player.body.setVelocityX(0);
            this.player.body.velocity.normalize().scale(speed);
        };

        /**
         * Use the right handed keyboard layout. This will use the arrow keys for
         * target firing and WASD for movement.
         */
        let lefty = function(params) {
            let speed = this.player.stats.speed;
            this.fire = this.input.activePointer.isDown || this.W.isDown;
            if(this.A.isDown) params.aim = -1;
            if(this.D.isDown) params.aim = 1;

            if (this.cursors.up.isDown) {
                params.dirY = -1;
                params.isWalking = 1;
                this.player.body.setVelocityY(-speed);
            } else if (this.cursors.down.isDown) {
                params.dirY = 1;
                params.isWalking = 1;
                this.player.body.setVelocityY(speed);
            } else this.player.body.setVelocityY(0);

            if (this.cursors.left.isDown) {
                params.isWalking = 1;
                params.dirX = -1;
                this.player.body.setVelocityX(-speed);
            } else if (this.cursors.right.isDown) {
                params.isWalking = 1;
                params.dirX = 1;
                this.player.body.setVelocityX(speed);
            } else this.player.body.setVelocityX(0);
            this.player.body.velocity.normalize().scale(speed);
        };

        this.handleInput = this.settings.isRightHanded() ? righty : lefty;
    }
}