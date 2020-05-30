
class SplashScene extends Phaser.Scene {

    constructor() {
        super('splash');
    }

    preload() {
        //Should pre-load and graphics
    }

    create() {
        let text1 = this.add.text(100, 100, 'Phaser Text with Tint');

        text1.setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000);

        this.input.on('pointerdown', function (pointer) {

            this.scene.stop();
            this.scene.start('carnival');

        }, this);
    }
}