/**
 * The main entry for the game. This extends Phaser 3 scene.
 * It displays the main title .
 */
class SplashScene extends Phaser.Scene {

    constructor() {
        super('splash');
    }

    preload() {
        //Should pre-load and graphics
    }

    create() {
        let text1 = this.add.text(100, 100, 'The Carnival');

        text1.setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000);

        let exit = function() {
            this.scene.stop();
            this.scene.start('carnival');
        };

        this.input.keyboard.on('keydown-ENTER', exit, this);
        this.input.on('pointerdown', exit, this);
    }
}