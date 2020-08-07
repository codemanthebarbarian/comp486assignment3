/**
 * The main entry for the game. This extends Phaser 3 scene.
 * It displays the main title .
 */
class SplashScene extends Phaser.Scene {

    /**
     * The scene constructor inherited from Phaser.Scene
     */
    constructor() {
        let cfg = {
            key: 'splash',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            }
        }
        super(cfg);
    }

    /**
     * Preloads any assets required by the scene
     */
    preload() {
        this.load.audio('circus', './assets/screens/CircusDilemma.mp3');
    }

    /**
     * Create the scene
     */
    create() {
        let music = this.sound.add('circus', { loop: true, volume: .5 });
        if(this.settings.isBackgroundMusicEnabled()) music.play();
        let xMid = game.canvas.width / 2;
        let graphics = this.add.graphics();
        graphics.lineStyle(1, 0xff0000, 1);

        this.add.text(xMid, game.canvas.height / 3,
            ['The Carnival','Trouble in Playland'],
            {
                font: '50px Arial'
            }).setOrigin(.5, .5).setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000);

        let playtxt = this.add.text(xMid, game.canvas.height * .6, 'Play',
            {
                font:'25px bold Arial',
                fill: 'yellow'
            }).setOrigin(.5, .5).setName('play').setInteractive();

        let settingstxt = this.add.text(xMid, game.canvas.height * .75, 'Settings',
            {
               font: '20px Arial',
               fill: 'yellow'
            }).setOrigin(.5, 1).setName('settings').setInteractive();

        this.add.text(xMid, game.canvas.height - 25,
            'Use \'Up\' and \'Down\' arrow keys to highlight and \'Enter\' to select',
            {
                font: '15px Arial',
                fill: 'yellow'
            }).setOrigin(.5, 1);

        /**
         * Sets the player's input for the scene
         */
        let setInput = function(){

            this.physics.add.existing(playtxt);
            this.physics.add.existing(settingstxt);

            let selected = playtxt;
            graphics.strokeRectShape(selected.getBounds());
            this.input.keyboard.addCapture('UP, DOWN');

            /**
             * Sets the selection to the next item.
             */
            let setNext = function(){
                if(selected.name === 'play') selected = settingstxt;
                else selected = playtxt;
                graphics.clear();
                graphics.strokeRectShape(selected.getBounds());
            }

            /**
             * Highlight any items when hovered over by the mouse
             * @param event the hover event
             * @param txt the items hovered
             */
            let onMouseOver = function(event, txt){
                let itm = Array.isArray(txt) ? txt[0] : txt;
                if(!itm.name) return;
                selected = itm;
                graphics.clear();
                graphics.strokeRectShape(selected.getBounds());
            }

            /**
             * Launches the initial playable scene (the carnival map)
             */
            let play = function() {
                music.stop();
                this.scene.stop();
                this.scene.start('carnival');
            };

            /**
             * Shows the properties scene
             */
            let showProperties = function() {
                let props = this.scene.get('settings');
                props.setCallingScene(this, music);
                this.scene.switch(props);
            }

            /**
             * Handle pointer input (either mouse or touch)
             * @param pointer
             */
            let onPointerDown = function(pointer) {
                let coord = pointer.position;
                let txt = this.physics.overlapCirc(coord.x, coord.y, 2);
                if(txt.length > 0) doInput.bind(this)();
            }

            /**
             * Do any action items from mouse or touch
             */
            let doInput = function(){
                if(selected.name === 'play') play.bind(this)();
                else showProperties.bind(this)();
            }

            this.input.keyboard.on('keydown-ENTER', doInput, this);
            this.input.keyboard.on('keydown-UP', setNext);
            this.input.keyboard.on('keydown-DOWN', setNext);
            this.input.on('pointerover', onMouseOver, this);
            this.input.on('pointerdown', onPointerDown, this);
        };

        setInput.bind(this)();
    }
}