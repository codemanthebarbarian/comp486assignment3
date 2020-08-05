/**
 * A scene where the player can interact with game settings.
 * Currently the player has the ability to do the following:
 * - toggle background music
 * - reset the game (clears all progress)
 */
class SettingsScene extends Phaser.Scene {

    /**
     * The constructor for the scene. Inherited from Phaser 3 scene.
     */
    constructor() {
        let cfg = {
            key: 'settings',
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
     * Creates and loads the scene.
     */
    create(){

        this.add.text(game.canvas.clientWidth / 2, 10,
            'Settings',
            {
                font: 'bold 50px Arial',
                fill: 'yellow'
            }
        ).setOrigin(.5, 0);

        let gameStateFmt = 'Game State: %1';
        let toggleBackgroundMusicTxt = 'Background Music:  %1';
        let graphics = this.add.graphics();
        graphics.lineStyle(1, 0xff0000, 1);

        let musicToggle = this.add.text(null, null,
          Phaser.Utils.String.Format(toggleBackgroundMusicTxt,
             [ this.settings.isBackgroundMusicEnabled() ? 'ON' : 'OFF' ]),
            {
                font: '25px Arial',
                fill: 'yellow'
            }
        ).setOrigin(.5).setName('toggleBackground').setInteractive();

        /**
         * Gets the current state of the game
         * @return {boolean} true if a new game (default state) otherwise false
         */
        let getGameResetState = function(){
          return this.inventory.isReset() && this.quests.isReset();
        };

        /**
         * Toggles the background music state
         */
        let toggleBackgroundMusic = function(){
            let enabled = this.settings.toggleBackgroundMusicEnabled();
            musicToggle.setText(Phaser.Utils.String.Format(toggleBackgroundMusicTxt,
                [ enabled ? 'ON' : 'OFF' ]));
            if(this.backgroundMusic) {
                if(!enabled && this.backgroundMusic.isPlaying)
                    this.backgroundMusic.stop();
                else if (enabled && !this.backgroundMusic.isPlaying)
                    this.backgroundMusic.play();
            }
        };

        let resetTxt = this.add.text(null, null, 'Reset Game',
            {
                font: '25px Arial',
                fill: 'yellow'
            }).setOrigin(.5).setName('resetGame').setInteractive();
        let exitTxt = this.add.text(null, null, 'Exit',
            {
                font: '25px Arial',
                fill: 'yellow'
            }).setOrigin(.5).setName('exit').setInteractive();
        let gameStateTxt = this.add.text(
            game.canvas.clientWidth / 2, game.canvas.height - 10,
            Phaser.Utils.String.Format(gameStateFmt, getGameResetState.bind(this)() ? ['New Game'] : ['In Progress']),
            {
                font: '20px Arial',
                fill: 'yellow'
            }).setOrigin(.5, 1);
        let gameStateDebug = this.add.text(
            game.canvas.clientWidth / 2, game.canvas.height - 35,
            '',
            {
                font: '15px Arial',
                fill: 'red'
            }).setOrigin(.5, 1);

        let items = this.add.group()
            .add(musicToggle)
            .add(resetTxt)
            .add(exitTxt)
            .incXY(game.canvas.clientWidth / 2, 200, null, 100);

        this.physics.add.existing(musicToggle);
        this.physics.add.existing(resetTxt);
        this.physics.add.existing(exitTxt);

        /**
         * Resets the game to a new game.
         */
        let reset = function() {
            this.quests.reset();
            this.inventory.reset();
            this.caller = this.scene.get('splash');
            gameStateTxt.setText(Phaser.Utils.String.Format(gameStateFmt, getGameResetState.bind(this)() ? ['Reset'] : ['In Progress']));
        };

        /**
         * Toggles the game between debug modes
         */
        let setDebug = function() {
            this.settings.toggleDebug();
            let txt = 'Debug Mode (Refresh Required): ' + (this.settings.isDebugging() ? 'ON' : 'OFF');
            gameStateDebug.setText(txt);
            this.settings.save();
        };

        /**
         * Set the scene's player input
         */
        let setInput = function(){

            let selected = -1;
            this.input.keyboard.addCapture('UP, DOWN');
            //this is the hidden command to put the game into debug mode
            this.input.keyboard.createCombo('debug', { resetOnMatch: true, maxKeyDelay: 1000 });

            this.input.keyboard.on('keycombomatch', function (event) {
                setDebug.bind(this)();
            }, this);

            /**
             * Highlights the currently selected option.
             */
            let highlight = function() {
                if(selected < 0) return;
                graphics.clear();
                graphics.strokeRectShape(items.getChildren()[selected].getBounds());
            }

            /**
             * The method to exit the settings. If a scene is not provided it will resume the
             * carnival scene by default.
             */
            let exit = function(){
                this.scene.stop();
                if(this.caller) this.scene.wake(this.caller);
                else this.scene.wake('carnival');
            };

            /**
             * Handles the mouse over event. This will highlight the interactive text
             * element.
             * @param event the mouse event
             * @param txt the interactive text being hovered over
             */
            let onMouseOver = function(event, txt){
                let itm = Array.isArray(txt) ? txt[0] : txt;
                if(!itm.name) return;
                selected = items.getChildren().indexOf(itm);
                highlight();
            };

            /**
             * Executes the selected command on pointer down if the pointer is currently hovering
             * over the currently selected option.
             * @param pointer the pointer object
             */
            let onPointerDown = function(pointer){
                let coord = pointer.position;
                let txt = this.physics.overlapCirc(coord.x, coord.y, 2);
                if(txt.length > 0) onEnter.bind(this)();
            };

            /**
             * move the index to the next interactive element.
             */
            let moveNext = function() {
                ++selected;
                if(selected >= items.length) selected = 0;
                highlight();
            };

            /**
             * move to the previous interactive element
             */
            let movePrevious = function() {
                --selected;
                if(selected < 0) selected = items.length - 1;
                highlight();
            };

            /**
             * handle the execute function for the interactive element.
             */
            let onEnter = function(){
                if(selected < 0) return;
                let item = items.getChildren()[selected];
                switch(item.name){
                    case 'exit':
                        exit.bind(this)();
                        break;
                    case 'resetGame':
                        reset.bind(this)();
                        break;
                    case 'toggleBackground':
                        toggleBackgroundMusic.bind(this)();
                        break;
                }
            };

            this.input.on('pointerover', onMouseOver, this);
            this.input.on('pointerdown', onPointerDown, this);
            this.input.keyboard.on('keydown-ESC', exit, this);
            this.input.keyboard.on('keydown-DOWN', moveNext, this);
            this.input.keyboard.on('keydown-UP', movePrevious, this);
            this.input.keyboard.on('keydown-ENTER', onEnter, this);
        };

        setInput.bind(this)();

    }

    /**
     * Sets the scene which the settings were called from. If the background music is provided
     * this will stop is from playing if the calling scene provides it and the user
     * toggles it.
     * @param scene the calling scene
     * @param backgroundMusic the background music from the calling scene
     */
    setCallingScene(scene, backgroundMusic){
        this.caller = scene;
        this.backgroundMusic = backgroundMusic;
    }

}