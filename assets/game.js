/*
 * This file hold classes share throughout the game
 * NEW FOR ASSIGNMENT 3
 */

/**
 * A class representing character statistics used in game calculations.
 */
class Stats {

    /**
     * creates a new instance of character stats
     * @param hitPoints the total hitpoints
     * @param speed the speed of travel
     * @param damage the dampage per second if colliding
     */
    constructor(hitPoints, speed, damage) {
        this.baseHitPoints = hitPoints;
        this.baseSpeed = speed;
        this.level = 1;
        this.hitPoints = hitPoints;
        this.speed = speed;
        this.baseDamage = damage;
        this.damage = damage;
    }

    /**
     * reset the stats to original values
     */
    reset() {
        this.hitPoints = this.baseHitPoints;
        this.speed = this.baseSpeed;
        this.damage = this.baseDamage;
    }

}

const Game = {
    diffAngle: function(a, b) {
        let diff = Game.to360(a) - Game.to360(b);
        if (diff < -180) diff += 360;
        if (diff > 180) diff -= 360;
        return diff;
    },
    to360: function(angle) {
        if(angle < 0) {
            return 360 + angle;
        }
        return angle;
    }
}

/**
 * A class representing weapon statistics used in game calculations.
 */
class Weapon {

    /**
     * Creates an instance of weapon stats
     * @param damage
     * @param fireRate
     * @param range
     * @param velocity
     */
    constructor(damage, fireRate, range, velocity) {
        this.baseDamage = damage;
        this.baseFireRate = fireRate;
        this.baseRange = range;
        this.baseVelocity = velocity;
        this.level = 1;
        this.damage = damage;
        this.fireRate = fireRate;
        this.range = range;
        this.velocity = velocity;
    }

    /**
     * Resets the stats to their original levels
     */
    reset() {
        this.damage = this.baseDamage;
        this.fireRate = this.baseFireRate;
        this.range = this.baseRange;
        this.velocity = this.baseVelocity;
    }

}

/**
 * The player character sprite used in the cave scene.
 */
class Player extends Phaser.GameObjects.Container {

    constructor(scene, x, y, health, speed) {
        super(scene, x, y);
        this.currentAnimation = 'down';
        this.setSize(20,25,true);
        this.setDataEnabled();
        this.isWalking = false;
        this.facing = 90;
        this.stats = new Stats(health, speed);
        this.sprite = scene.add.sprite(0,0, 'guy');
        this.barWidth = health / 3;

        // create a health bar 
        if(! scene.textures.exists('hitbar')) {
            let graphics = scene.make.graphics().fillStyle(0xffff00).fillRect(0, 0, this.barWidth, 6);
            graphics.generateTexture('hitbar', this.barWidth, 6);
            graphics.destroy();
        }
        this.hp = scene.add.image(0, -20, 'hitbar').setDepth(6);
        this.add(this.sprite);
        this.add(this.hp);

        //The global animations have been create, nothing to do
        if(!scene.anims.exists('left')) {
            scene.anims.create({
                key: 'left',
                frames: scene.anims.generateFrameNames('guy', {prefix: 'MainGuy', frames: [10], zeroPad: 4}),
                frameRate: 20,
                repeat: -1
            });
            scene.anims.create({
                key: 'walk-left',
                frames: scene.anims.generateFrameNames('guy', {prefix: 'MainGuy', start: 9, end: 11, zeroPad: 4}),
                frameRate: 20,
                repeat: -1
            });
            scene.anims.create({
                key: 'right',
                frames: scene.anims.generateFrameNames('guy', {prefix: 'MainGuy', frames: [4], zeroPad: 4}),
                frameRate: 20,
                repeat: 1
            });
            scene.anims.create({
                key: 'walk-right',
                frames: scene.anims.generateFrameNames('guy', {prefix: 'MainGuy', start: 3, end: 5, zeroPad: 4}),
                frameRate: 5,
                repeat: -1
            });
            scene.anims.create({
                key: 'down',
                frames: scene.anims.generateFrameNames('guy', {prefix: 'MainGuy', frames: [1], zeroPad: 4}),
                frameRate: 20,
                repeat: 1
            });
            scene.anims.create({
                key: 'walk-down',
                frames: scene.anims.generateFrameNames('guy', {prefix: 'MainGuy', start: 0, end: 2, zeroPad: 4}),
                frameRate: 5,
                repeat: -1
            });
            scene.anims.create({
                key: 'up',
                frames: scene.anims.generateFrameNames('guy', {prefix: 'MainGuy', frames: [7], zeroPad: 4}),
                frameRate: 20,
                repeat: 1
            });
            scene.anims.create({
                key: 'walk-up',
                frames: scene.anims.generateFrameNames('guy', {prefix: 'MainGuy', start: 6, end: 8, zeroPad: 4}),
                frameRate: 5,
                repeat: -1
            });
        }
    }

    getCenter(v) {
        if(!v) return new Phaser.Math.Vector2(this.x, this.y);
        v.x = this.x;
        v.y = this.y;
    }

    /**
     * register a hit or damage on the player
     * @param damage the damage to inflict.
     * @return {boolean} true if the player's hitpoints have been used up
     */
    registerHit(damage) {
        this.stats.hitPoints -= damage;
        let width = (this.stats.hitPoints / this.stats.baseHitPoints) * this.barWidth;
        this.hp.setDisplaySize( width, 6);
        return this.stats.hitPoints <= 0;
    }

    /**
     * Sets the animation to play
     * @param isWalking true if the player is moving
     * @param direction the direction of travel
     */
    setAnimation(isWalking, direction){
        this.isWalking = isWalking;
        //This commented code from prior to walking backward..
        // if(!isWalking) {
        //     //not walking, so we've stopped just face previous direction
        //     //or keep facing in same direction
        //     this.currentAnimation = this.currentAnimation.replace('walk-', '');
        // } else if (direction !== this.facing) {
            // there has been a change in direction
            let absDir = Math.abs(direction);
            if (absDir % 90) {
                //Walking at an angle if they were not walking they should be
                if (!this.currentAnimation.includes('walk-'))
                    this.currentAnimation = 'walk-' + this.currentAnimation;
            } else {
                // walking it a 90 degree angle
                if (absDir === 180) this.currentAnimation = 'walk-left';
                else if (direction === 0) this.currentAnimation = 'walk-right';
                else if (direction < 0) this.currentAnimation = 'walk-up';
                else this.currentAnimation = 'walk-down';
            }
        // }

        if(!isWalking) this.currentAnimation = this.currentAnimation.replace('walk-', '');
        this.isWalking = isWalking;
        this.facing = direction;
        this.sprite.anims.play(this.currentAnimation, true);
    }
}

/**
 * A non-player bat sprite. Used in the cave scene.
 */
class Bat extends Phaser.GameObjects.Container {

    /**
     * Creates a new instance of a bat enemy. The level will increase speed, strength and damage
     * delivered by the bat
     * @param scene the scene to add it to
     * @param x the x coordinate
     * @param y the y coordinate
     * @param level the bat level
     */
    constructor(scene, x, y, level) {
        super(scene, x, y);
        this.level = level;
        this.setSize(20,16,true);
        let speed = 25 + ( 7 * level );
        let hp = 85 + ( 13 * level );
        let damage = 10 + (3 * level);
        if(! scene.textures.exists('hitbar')) {
            let graphics = scene.make.graphics().fillStyle(0xffff00).fillRect(0, 0, 32, 6);
            graphics.generateTexture('hitbar', 32, 6);
            graphics.destroy();
        }
        this.hp = scene.add.image(0, -20, 'hitbar').setDepth(6);
        this.stats = new Stats(hp, speed, damage);
        this.sprite = scene.add.sprite(0,0,'bat').setDepth(5);
        this.add(this.sprite);
        this.add(this.hp);

        //if the animations do not exist, create them.
        if(!scene.anims.exists('bat-left')){
            scene.anims.create({
                key: 'bat-left',
                frames: scene.anims.generateFrameNumbers('bat', { start: 12, end: 15 }),
                frameRate: 20,
                repeat: -1,
                yoyo: true
            });
            scene.anims.create({
                key: 'bat-right',
                frames: scene.anims.generateFrameNumbers('bat', { start: 4, end: 7 }),
                frameRate: 20,
                repeat: -1,
                yoyo: true
            });
            scene.anims.create({
                key: 'bat-up',
                frames: scene.anims.generateFrameNumbers('bat', { start: 8, end: 11 }),
                frameRate: 20,
                repeat: -1,
                yoyo: true
            });
            scene.anims.create({
                key: 'bat-down',
                frames: scene.anims.generateFrameNumbers('bat', { start: 0, end: 3 }),
                frameRate: 20,
                repeat: -1,
                yoyo: true
            });
        }
    }

    // this is container, so we need to make a getCenter (was available in sprite)
    getCenter(v) {
        if(!v) return new Phaser.Math.Vector2(this.x, this.y);
        v.x = this.x;
        v.y = this.y;
    }

    /**
     * Register a hit (damage to the bat)
     * @param damage the damage amount
     * @return {boolean} true if the bat's hp has been used up
     */
    registerHit(damage) {
        this.stats.hitPoints -= damage;
        let width = (this.stats.hitPoints / this.stats.baseHitPoints) * 32;
        this.hp.setDisplaySize( width, 6);
        if(this.stats.hitPoints > 0) return false;
        this.destroy();
        return true;
    }

    /**
     * Override the update method in the sprite class
     * (param descriptions from Phaser documentation)
     * @param time {number} The current time. Either a High Resolution Timer value if it comes from Request Animation Frame, or Date.now if using SetTimeout.
     * @param delta {number} The delta time in ms since the last frame. This is a smoothed and capped value based on the FPS rate.
     * @param target {Vector2}
     */
    update(time, delta, target){
        if(!this.body) return;
        let me = this.getCenter();
        let x = target.x - me.x;
        let y = target.y - me.y;
        if(x > this.stats.speed) x = this.stats.speed;
        if(y > this.stats.speed) y = this.stats.speed;
        this.body.setVelocityX(x);
        this.body.setVelocityY(y);
        this.body.velocity.normalize().scale(this.stats.speed);
    }

}

/**
 * The crosshairs class displayed for player aiming.
 */
class Crosshair extends Phaser.GameObjects.Image {

    /**
     * Creates a new instance of crosshairs for aiming.
     * @param scene
     * @param center
     * @param worldBounds
     */
    constructor (scene, center, worldBounds)
    {
        super(scene, center.x, center.y + 250, 'hud', 'crosshair_white_small.png');
        this.setDisplaySize(24, 24);
        this.limit = new Phaser.Geom.Circle(center.x, center.y, 250);
        this.direction = 90;
        this.minX = worldBounds.x;
        this.minY = worldBounds.y;
        this.maxX = worldBounds.x + worldBounds.width;
        this.maxY = worldBounds.y + worldBounds.height;
    }

    /**
     *
     * @param vectorPlayer
     * @param playerFacing
     * @param direction - for left + for right 0 for no
     * @param line the line from the player to the mouse
     */
    update(vectorPlayer, playerFacing, direction, line){

        // we want to move crosshairs left to right more or less
        // so reverse if player if facing up or directly right or left
        let reverse = playerFacing > 0;

        let constrain = function() {

            // Normalize the angle to what we expect
            if(this.direction >= 180) this.direction += -360;
            else if(this.direction < -180) this.direction += 360;

            // this code use to limit crosshairs based on players facing direction... didn't play well
            //get our acceptable range
            // let swath = 80; // max degrees left of right of players facing direction
            // let max = playerFacing + swath;
            // let min = playerFacing - swath;
            //
            // // normalize the min and max
            // if(min >= 180) min += -360;
            // if(min < -180) min += 360;
            // if(max >= 180) max += -360;
            // if(max < -180) max += 360;


            // if (min > max) {
            //     if(this.direction >= min) return;
            //     if(this.direction <= max) return;
            //     if(this.direction < 0) this.direction = max; //closer to the max
            //     else this.direction = min;
            // } else {
            //     if(this.direction < min) this.direction = min;
            //     if(this.direction > max) this.direction = max;
            // }
        };

        if(line) {
            this.direction = Phaser.Math.RadToDeg(Phaser.Geom.Line.Angle(line));
           constrain.bind(this)();
        } else if(direction){
            //if(reverse) direction *= -1; //flip if reversed
            this.direction += direction > 0 ? 1.7 : -1.7;
           constrain.bind(this)();
        }

        this.limit.setPosition(vectorPlayer.x, vectorPlayer.y);
        var p = Phaser.Geom.Circle.CircumferencePoint(this.limit, Phaser.Math.DegToRad(this.direction));
        if(p.x < this.minX) p.x = this.minX;
        if(p.x > this.maxX) p.x = this.maxX;
        if(p.y < this.minY) p.y = this.minY;
        if(p.y > this.maxY) p.y = this.maxY;
        this.setPosition(p.x, p.y);
    }
}

/**
 * Represents an individual bullet fired from a weapon.
 */
class Bullet extends Phaser.GameObjects.Image {

    /**
     * Creates a new bullet instance
     * @param scene
     * @param x
     * @param y
     * @param range the bullet range
     * @param velocity the bullet velocity
     */
    constructor(scene, x, y, range, velocity) {
        super(scene, x, y, 'cave_bullet');
        this.setDisplaySize(17, 7);
        this.setActive(false);
        this.setVisible(false);
        this.range = range;
        this.velocity = velocity;
    }

    /**
     * fires the bullet from the provided location
     * @param vector2 where to fire from
     * @param angle the angle of travel
     * @param range the range (if different from default)
     * @param velocity if different from default
     */
    fire(vector2, angle, range, velocity) {
        if(range) this.range = range;
        if(velocity) this.velocity = velocity;
        this.origin = vector2.clone();
        this.setPosition(this.origin.x, this.origin.y);
        this.body.world.add(this.body);
        this.body.setSize(7,7, true);
        this.body.onWorldBounds = true;
        this.setAngle(angle);
        this.setActive(true);
        this.setVisible(true);
    }

    /**
     * recycle the bullet for reuse
     */
    recycle() {
        this.setActive(false);
        this.setVisible(false);
        this.body.world.remove(this.body);
        this.body.onWorldBounds = false;
    }

    /**
     * what to do when world bounds have been hit
     */
    onWorldBoundsHandler() {
        this.recycle();
    }

    /**
     * Override the update method in the sprite class
     * (param descriptions from Phaser documentation)
     * @param time {number} The current time. Either a High Resolution Timer value if it comes from Request Animation Frame, or Date.now if using SetTimeout.
     * @param delta {number} The delta time in ms since the last frame. This is a smoothed and capped value based on the FPS rate.
     */
    update(time, delta){
        let c = this.getCenter();
        let d = Phaser.Math.Distance.BetweenPoints(this.origin, c);
        if(d > this.range) return this.recycle();
        this.scene.physics.velocityFromAngle(this.angle, this.velocity, this.body.velocity);
    }
}