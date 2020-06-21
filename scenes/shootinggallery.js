
class ShootingGallery extends Phaser.Scene {

    constructor() {
        let cfg = {
            key: 'shootinggallery',
            physics: {
                default: 'matter',
                matter: {
                    debug: true
                }
            }
        }
        super(cfg);
    }

    preload() {
        this.load.audio('theme', './assets/shootinggallery/in_the_circus_psg2.ogg');
        this.load.audio('fire', './assets/shootinggallery/sfx_15b.ogg');
        this.load.audio('hit', './assets/shootinggallery/pings_and_scrapes_Marker_2.wav');
        this.load.atlasXML('objects', './assets/shootinggallery/spritesheet_objects.png',
            './assets/shootinggallery/spritesheet_objects.xml');
        this.load.atlasXML('hud', './assets/shootinggallery/spritesheet_hud.png',
            './assets/shootinggallery/spritesheet_hud.xml');
        this.load.atlasXML('stall', './assets/shootinggallery/spritesheet_stall.png',
            './assets/shootinggallery/spritesheet_stall.xml');
        // Load body shapes from JSON file generated using PhysicsEditor
        this.load.json('object_shapes', './assets/shootinggallery/objects_matter.json');
        this.load.json('stall_shapes', './assets/shootinggallery/stall_matter.json');
    }

    create() {
        this.music = this.sound.add('theme', { loop: true, volume: .5 });
        this.miss = this.sound.add('fire', { loop : false });
        this.hit = this.sound.add('hit', { loop: false});
        this.music.play();
        this.hits = 0;
        this.shots = 24;
        this.matter.world.setBounds(-150, 0, game.config.width + 450, game.config.height + 200).disableGravity();
        this.objectShapes = this.cache.json.get('object_shapes');
        this.stallShapes = this.cache.json.get('stall_shapes');
        this.nonColliding = this.matter.world.nextGroup(true);
        this.drawLast();
        this.drawMid();
        this.drawFront();
        this.crosshair = this.matter.add.image(game.canvas.clientWidth / 2, game.canvas.clientHeight / 2, 'hud', 'crosshair_red_small.png')
            .setDepth(6).setCollisionGroup(this.nonColliding);

        this.score = this.add.text(10,25, "Hits: " + this.hits).setFontSize(50).setColor('#ffff00');
        this.txtExit = this.add.text(game.canvas.clientWidth - 20, 25, 'Exit').setFontSize(50).setColor('#ffff00').setOrigin(1);
        this.matter.add.gameObject(this.txtExit).setDepth(6).setCollisionGroup(this.nonColliding);
        this.initializeInput();
    }

    initializeInput(){

        let speed = 5;

        let exit = function() {
            this.scene.stop();
            this.scene.wake('carnival');
        };

        let moveUp = function() { this.crosshair.setVelocityY(-speed); };
        let moveDown = function() { this.crosshair.setVelocityY(speed); };
        let moveLeft = function() { this.crosshair.setVelocityX(-speed); };
        let moveRight = function() { this.crosshair.setVelocityX(speed); };
        let stopX = function() { this.crosshair.setVelocityX(0); };
        let stopY = function() { this.crosshair.setVelocityY(0); };

        let initializeKeyboard = function() {
            this.input.keyboard.addCapture('UP, DOWN, LEFT, RIGHT', 'SPACE', 'ESC');
            this.input.keyboard.on('keydown-ESC', exit, this);
            this.input.keyboard.on('keydown-RIGHT', moveRight, this);
            this.input.keyboard.on('keyup-RIGHT', stopX, this);
            this.input.keyboard.on('keydown-LEFT', moveLeft, this);
            this.input.keyboard.on('keyup-LEFT', stopX, this);
            this.input.keyboard.on('keydown-UP', moveUp, this);
            this.input.keyboard.on('keyup-UP', stopY, this);
            this.input.keyboard.on('keydown-DOWN', moveDown, this);
            this.input.keyboard.on('keyup-DOWN', stopY, this);
            this.input.keyboard.on('keydown-SPACE', this.shoot, this);
        };

        let initializeTouch = function() {
            this.input.addPointer(1); // need two touch inputs: move and fire
            this.input.on('pointermove', function (pointer) {
                this.crosshair.x = pointer.x;
                this.crosshair.y = pointer.y;
            }, this);
            this.input.on('pointerdown', this.shoot, this);
            this.txtExit.on('exit', exit, this);
        }

        initializeKeyboard.bind(this)();
        initializeTouch.bind(this)();
    }

    update(){
        this.score.text = "Hits: " + this.hits;
        this.crosshair.x += Phaser.Math.Between(-2, 2);
        this.crosshair.y += Phaser.Math.Between(-2, 2);
    }

    shoot(){
        if(this.shots < 0) return;
        this.bulletGroup.getChildren().pop().destroy();
        --this.shots;
        this.miss.play();
        let x = this.crosshair.x;
        let y = this.crosshair.y;
        let shot = this.matter.add.image(x,y,'objects', 'shot_blue_small.png', { shape: this.objectShapes.shot_blue_small })
            .setCollisionGroup(this.nonColliding);
        if(this.matter.overlap(shot, this.txtExit)){
            this.txtExit.emit('exit');
        } else if(this.matter.overlap(shot, this.shieldFront)){
            shot.setDepth(6);
        } else if(this.matter.overlap(shot, this.targetsFront)){
            ++this.hits;
            this.hit.play();
            shot.setDepth(4);
        } else if(this.matter.overlap(shot, this.shieldMid)){
            shot.setDepth(4);
        } else if(this.matter.overlap(shot, this.ducksMid)){
            ++this.hits;
            this.hit.play();
            shot.setDepth(2);
        } else if(this.matter.overlap(shot, this.shieldBack)){
            shot.setDepth(2);
        } else if(this.matter.overlap(shot, this.ducksBack)){
            ++this.hits;
            this.hit.play();
        }
    }

    drawLast(){
        this.ducksBack = [];
        let graphics = this.add.graphics();
        let path = new Phaser.Curves.Path(0, 150);
        for (let i = 0; i < 10; i++) {
            // xRadius, yRadius, startAngle, endAngle, clockwise, rotation
            if (i % 2 === 0)
                path.ellipseTo(96, 62, 135, 45, true, 0); // 180 360
            else
                path.ellipseTo(96, 62, 225, 315, false, 0);
        }
        graphics.lineStyle(1, 0xffffff, 1);
        path.draw(graphics);
        this.resizeShape(this.objectShapes.duck_target_yellow, 0.5);
        for (let i = 0 ; i < 10 ; ++i) {
            let follower = this.add.follower(path, 96, 150, 'objects', 'duck_target_yellow.png' ).setScale(0.5).setDepth(1);
            this.ducksBack.push(
                this.matter.add.gameObject(follower, { shape: this.objectShapes.duck_target_yellow })
                    .setCollisionGroup(this.nonColliding)
            );
            follower.startFollow(
                {
                    duration: 10000,
                    positionOnPath: true,
                    repeat: -1,
                    //delay: i * 1000
                    startAt: i * .1
                }
            );
        }
        this.shieldBack = [];
        let z, x;
        for (z= 0 , x = 0 ; z < 9 ; ++z , x += 132 ){
            this.shieldBack.push(
                this.matter.add.image(x, 235, 'stall', 'water2.png', { shape: this.stallShapes.water2 })
                    .setDepth(2).setCollisionGroup(this.nonColliding)
            );
        }
    }

    drawMid(){
        this.ducksMid = [];
        let graphics = this.add.graphics();
        let path = new Phaser.Curves.Path(960, 300);
        for (let i = 0; i < 10; i++) {
            // xRadius, yRadius, startAngle, endAngle, clockwise, rotation
            if (i % 2 === 0)
                path.ellipseTo(-96, 62, 135, 45, true, 0); // 180 360
            else
                path.ellipseTo(-96, 62, 225, 315, false, 0);
        }
        graphics.lineStyle(1, 0xffffff, 1);
        path.draw(graphics).setDepth(3);
        this.resizeShape(this.objectShapes.duck_target_white_flip, 0.5);
        for (let i = 0 ; i < 10 ; ++i) {
            let follower = this.add.follower(path, 96, 300, 'objects', 'duck_target_white.png').setFlipX(true).setScale(0.5).setDepth(3);
            this.ducksMid.push(
                this.matter.add.gameObject(follower, { shape: this.objectShapes.duck_target_white_flip })
                    .setCollisionGroup(this.nonColliding)
            );
            follower.startFollow(
                {
                    duration: 10000,
                    positionOnPath: true,
                    repeat: -1,
                    startAt: i * .1
                }
            );
        }
        this.shieldMid = [];
        let z, x;
        for (z= 0 , x = 0 ; z < 9 ; ++z , x += 132 ){
            this.shieldMid.push(
                this.matter.add.image(x, 405, 'stall', 'water1.png', { shape: this.stallShapes.water1 })
                    .setDepth(4).setCollisionGroup(this.nonColliding)
            );
        }
    }

    drawFront() {
        this.targetsFront = [];
        let graphics = this.add.graphics();
        let path = new Phaser.Curves.Path();
        this.resizeShape(this.objectShapes.target_colored, 0.3);
        path.add(new Phaser.Curves.Ellipse(320, 500, 100, 100, 135, 45));
        graphics.lineStyle(1, 0xffffff, 1);
        path.draw(graphics).setDepth(5);
        let follower = this.add.follower(path, 320, 500, 'objects', 'target_colored.png').setDepth(5);
        follower.setScale(0.3).setDepth(5);
        this.targetsFront.push(
            this.matter.add.gameObject(follower, { shape: this.objectShapes.target_colored })
                .setCollisionGroup(this.nonColliding)
        );
        follower.startFollow({
            duration: 3000,
            positionOnPath: true,
            yoyo: true,
            ease: 'Sine.easeInOut',
            repeat: -1
        });
        let path2 = new Phaser.Curves.Path();
        path2.add(new Phaser.Curves.Ellipse(640, 500, 100, 100, 135, 45));
        path2.draw(graphics).setDepth(5);
        let follower2 = this.add.follower(path2, 640, 500, 'objects', 'target_colored.png').setDepth(5);
        follower2.setScale(0.3).setDepth(5);
        this.targetsFront.push(
            this.matter.add.gameObject(follower2, { shape: this.objectShapes.target_colored })
                .setCollisionGroup(this.nonColliding)
        );
        follower2.startFollow({
            duration: 3000,
            positionOnPath: true,
            yoyo: true,
            ease: 'Sine.easeInOut',
            repeat: -1,
            startAt: 1
        });
        this.shieldFront = [];
        let z, x;
        for (z = 0 , x = 0 ; z < 5 ; ++z , x += 256 ){
            this.shieldFront.push(
                this.matter.add.image(x, 600, 'stall', 'bg_wood.png', { shape: this.stallShapes.bg_wood })
                    .setDepth(6).setCollisionGroup(this.nonColliding)
            );
        }

        this.bulletGroup = this.add.group({
            key: 'hud',
            frame: 'icon_bullet_gold_long.png',
            quantity: 25,
            setXY:
                {
                    x: 35,
                    y: 550,
                    stepX: 35
                },
            setDepth: { value: 7, step: 0 }
        });
    }

    /**
     * This resizes the shape for the hit target. It checks to see if something has been resized as
     * it will shrink it on multiple loads.
     * @param shape the shape to resize
     * @param scale how much to resize it
     */
    resizeShape(shape, scale){
        if(shape.isResized) return;
        shape.isResized = true;
        let newData = [];
        let data = shape.fixtures;

        for(let i = 0; i < data.length; i++) {
            if(data[i].vertices) {
                let vertices = [];
                for (let j = 0; j < data[i].vertices.length; ++j) {
                    let vals = [];
                    for (let k = 0; k < data[i].vertices[j].length; ++k) {
                        vals.push({
                            x: data[i].vertices[j][k].x * scale,
                            y: data[i].vertices[j][k].y * scale
                        });
                    }
                    vertices.push(vals);
                }
                newData.push({ vertices : vertices });
            }
            if(data[i].circle){
                let circle = {};
                circle.x = data[i].circle.x * scale;
                circle.y = data[i].circle.y * scale;
                circle.radius = data[i].circle.radius * scale;
                newData.push({ circle: circle });
            }
        }
        shape.fixtures = newData;
    }
}