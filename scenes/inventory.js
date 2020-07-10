/**
 * The scene used to display the players inventory.
 */
class Inventory extends Phaser.Scene {

    /**
     * Creates a new instance of the inventory scene
     */
    constructor(){
        super('inventory');
    }

    /**
     * Called when the scene is created. This is inherited from Phaser.Scene
     */
    create() {
        this.add.text(game.config.width / 2, 30, 'Inventory').setFontSize(50).setColor('#ffff00').setOrigin(.5, .5);
        this.add.text(game.config.width / 4, 75, "Cash: $" + this.inventory.cash()).setFontSize(25).setColor('#ffff00');
        this.add.text(game.config.width / 4, 100, "Tickets: " + this.inventory.tickets()).setFontSize(25).setColor('#ffff00');
        this.add.text(game.config.width / 4, 125, "Tokens: " + this.inventory.tokens()).setFontSize(25).setColor('#ffff00');
        this.add.text(game.config.width / 8, 150, "Items:").setFontSize(25).setColor('#ffff00');
        this.add.text(game.config.width / 8, 175, this.inventory.items()).setFontSize(25).setColor('#ffff00');

        /**
         * A function to exit the scene and return to the carnival scene.
         */
        let exit = function(){
            this.scene.stop();
            this.scene.wake('carnival');
        }

        this.add.text(game.canvas.clientWidth - 20, game.canvas.clientHeight - 20, 'Exit',
            {
                font: '25px bold Arial',
                fill: 'yellow'
            }).setOrigin(1, 1)
            .setInteractive()
            .on('pointerdown', exit, this);

        this.input.keyboard.on('keydown-ESC', exit, this);
    }
}