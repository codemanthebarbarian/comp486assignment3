
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
        this.matter.world.setBounds(-150, 0, game.config.width + 450, game.config.height + 200).disableGravity();
        this.objectShapes = this.cache.json.get('object_shapes');
        this.stallShapes = this.cache.json.get('stall_shapes');
        this.nonColliding = this.matter.world.nextGroup(true);
        this.drawLast();
        this.drawMid();
        this.drawFront();
        this.crosshair = this.add.sprite(game.canvas.clientWidth / 2, game.canvas.clientHeight / 2, 'hud', 'crosshair_red_small.png').setDepth(5);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.on('pointermove', function (pointer) {
            this.crosshair.x = pointer.x;
            this.crosshair.y = pointer.y;
        }, this);
        this.input.on('pointerdown', this.shoot, this);
        let text1 = this.add.text(game.canvas.clientWidth / 2, 10, 'This is the Shooting Gallery scene');
        this.score = this.add.text(10,10, "Hits: " + this.hits);
        text1.setOrigin(0.5); //centre the text
        text1.setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000);
        this.score.setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000);
    }

    update(){
        this.score.text = "Hits: " + this.hits;
        if(this.spaceKey.isDown) {
            this.scene.stop();
            this.scene.wake('carnival');
        }
        this.crosshair.x += Phaser.Math.Between(-2, 2);
        this.crosshair.y += Phaser.Math.Between(-2, 2);
    }

    shoot(){
        this.miss.play();
        let x = this.crosshair.x;
        let y = this.crosshair.y;
        let shot = this.matter.add.image(x,y,'objects', 'shot_blue_small.png', { shape: this.objectShapes.shot_blue_small })
            .setCollisionGroup(this.nonColliding);
        if(this.matter.overlap(shot, this.shieldFront)){
            shot.depth(6);
        } else if(this.matter.overlap(shot, this.targetsFront)){
            ++this.hits;
            this.hit.play();
            shot.depth(4);
        } else if(this.matter.overlap(shot, this.shieldMid)){
            shot.depth(4);
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

        /*
        this.physics.overlap(shot, this.ducksBack, function() {
            ++this.hits;
            this.hit.play();
        }, function(s, d) {

        }, this);*/
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
        //this.ducks = this.physics.add.group();
        //follower(path, x, y, texture [, frame])
        this.resizeShape(this.objectShapes.duck_target_yellow, 0.5);
        for (let i = 0 ; i < 10 ; ++i) {
            let follower = this.add.follower(path, 96, 150, 'objects', 'duck_target_yellow.png' ).setScale(0.5).setDepth(1);
            this.ducksBack.push(
                this.matter.add.gameObject(follower, { shape: this.objectShapes.duck_target_yellow })
                    .setCollisionGroup(this.nonColliding)
            );
            //startFollow( [config] [, startAt])
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
        //this.ducks = this.physics.add.group();
        this.resizeShape(this.objectShapes.duck_target_white_flip, 0.5);
        for (let i = 0 ; i < 10 ; ++i) {
            let follower = this.add.follower(path, 96, 300, 'objects', 'duck_target_white.png').setFlipX(true).setScale(0.5).setDepth(3);
            this.ducksMid.push(
                this.matter.add.gameObject(follower, { shape: this.objectShapes.duck_target_white_flip })
                    .setCollisionGroup(this.nonColliding)
            );
            //startFollow( [config] [, startAt])
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
        path.add(new Phaser.Curves.Ellipse(250, 500, 100, 100, 135, 45));
        graphics.lineStyle(1, 0xffffff, 1);
        path.draw(graphics).setDepth(5);
        let follower = this.add.follower(path, 250, 500, 'objects', 'target_colored.png').setDepth(5);
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
        this.shieldFront = [];//bg_wood.png
        let z, x;
        for (z = 0 , x = 0 ; z < 5 ; ++z , x += 256 ){
            this.shieldFront.push(
                this.matter.add.image(x, 600, 'stall', 'bg_wood.png', { shape: this.stallShapes.bg_wood })
                    .setDepth(6).setCollisionGroup(this.nonColliding)
            );
        }
    }

    resizeShape(shape, scale){
        let newData = [];
        let data = shape.fixtures;

        for(let i = 0; i < data.length; i++) {
            let vertices = [];
            for(let j = 0; j < data[i].vertices.length; ++j) {
                let vals = [];
                for(let k = 0; k < data[i].vertices[j].length; ++k){
                    vals.push({
                        x: data[i].vertices[j][k].x * scale,
                        y: data[i].vertices[j][k].y * scale
                    })
                }
                vertices.push(vals);
            }
            newData.push({ vertices : vertices });
        }
        shape.fixtures = newData;
        //return shape;
        //var item = {};
        //item[shapeKey] = newData;
        //game.load.physics(newPhysicsKey, '', item);

    }
}