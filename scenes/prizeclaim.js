/**
 * A scene to confirm the player prize selection
 */
class PrizeClaimScene extends Phaser.Scene {

    /**
     * The constructor for the scene. Inherited from Phaser 3 scene.
     */
    constructor() {
        let cfg = {
            key: 'prizeclaim',
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
        let graphics = this.add.graphics();
        graphics.lineStyle(1, 0xff0000, 1);
        let center = game.canvas.clientWidth / 2;
        let hasTokens = this.inventory.hasTokens(this.cost);
        this.add.text(center, 10,
            'Prize Selection',
            {
                font: 'bold 25px Arial',
                fill: 'yellow'
            }
        ).setOrigin(.5, 0);
        this.add.text(center, game.canvas.clientHeight / 3,
            this.prize, {
            font: '75px'
            }).setOrigin(.5, 1);
        this.add.text(center, (game.canvas.clientHeight / 3) +10,
            'Tokens: ' + this.cost, {
                font:'25px Arial',
                fill: 'Yellow'
            }).setOrigin(.5, 0);

        /**
         * Sets the player's input.
         */
        let setInput = function(){

            this.input.keyboard.addCapture('UP, DOWN, LEFT, RIGHT');
            let yCoord = game.canvas.clientHeight * 2 / 3;
            let inputBack;
            let inputClaim;
            let selected;

            /**
             * Exit back to the prizes scene
             */
            let exit = function() {
                this.scene.stop();
                this.scene.wake('prizes');
            };

            /**
             * Highlight the selected prize.
             */
            let highlight = function(){
                graphics.clear();
                if (selected) graphics.strokeRectShape(selected.getBounds());
            }

            /**
             * Handles the mouse over event to highlight any selectable options.
             * @param event the mouse over event
             * @param txt the text hovered over
             */
            let onMouseOver = function(event, txt) {
                if(!txt) return;
                let itm = Array.isArray(txt) ? txt[0] : txt;
                if(!itm || !itm.name) return;
                selected = itm;
                highlight();
            };

            /**
             * Handles the on pointer down event (either mouse or touch screen)
             * @param pointer the pointer object
             */
            let onPointerDown = function(pointer) {
                let coord = pointer.position;
                let txt = this.physics.overlapCirc(coord.x, coord.y, 2);
                if(txt.length > 0) handler.onEnter.bind(this)();
            };

            /**
             * Selects the prize and puts it into the player's inventory.
             */
            let claimPrize = function() {
                this.inventory.getTokens(this.cost);
                this.inventory.addItem(this.prize);
                this.inventory.save();
                exit.bind(this)();
            };

            /**
             * The input handler for when the player has enough tokens to claim the prize
             * @type {{init: init, onEnter: onEnter, moveNext: moveNext, movePrevious: movePrevious}}
             */
            let hasTokensHandler = {
                /**
                 * The initialization function for this handler
                 */
                init : function() {
                    inputClaim = this.add.text(center - 10, yCoord,
                    'Claim', {
                        font: '25px Arial',
                        fill: 'Yellow'
                    }).setOrigin(1, .5).setName('claim').setInteractive();
                    inputBack = this.add.text(center + 10, yCoord,
                    'Back', {
                        font: '25px Arial',
                        fill: 'Yellow'
                    }).setOrigin(0, .5).setName('back').setInteractive();
                    this.physics.add.existing(inputClaim);
                    this.physics.add.existing(inputBack);
                },

                /**
                 * The move next function for this handler
                 */
                moveNext: function() {
                    if(selected && selected.name === 'claim') selected = inputBack;
                    else selected = inputClaim;
                    highlight();
                },

                /**
                 * The move previous function for this handler
                 */
                movePrevious: function(){
                    if(selected && selected.name === 'back') selected = inputClaim;
                    else selected = inputBack;
                    highlight();
                },

                /**
                 * The on enter function for this handler
                 */
                onEnter: function() {
                    if(!selected) return;
                    if(selected.name === 'claim') claimPrize.bind(this)();
                    else exit.bind(this)();
                }

            };

            /**
             * The handler implementation for when the player does not have enough tokens to claim the prize.
             * @type {{init: init, onEnter: onEnter, moveNext: moveNext, movePrevious: movePrevious}}
             */
            let shortTokensHandler = {
                /**
                 * The initialization method for this handler.
                 */
                init: function() {
                    this.add.text(center, yCoord - 5,
                        'Not enough tokens.', {
                            font: '25px Arial',
                            fill: 'Yellow'
                        }).setOrigin(.5, 1);
                    inputBack = this.add.text(center, yCoord + 5,
                        'Back', {
                            font: '25px Arial',
                            fill: 'Yellow'
                        }).setOrigin(.5, 0).setName('back').setInteractive();
                    this.physics.add.existing(inputBack);
                },

                /**
                 * The movenext function for this handler
                 */
                moveNext: function() {
                    selected = inputBack;
                    highlight();
                },

                /**
                 * The moveprevious function for this handler
                 */
                movePrevious: function(){
                    selected = inputBack;
                    highlight();
                },

                /**
                 * The onenter function for this handler
                 */
                onEnter: function() {
                    if(!selected) return;
                    exit.bind(this)();
                }

            };

            let handler = hasTokens ? hasTokensHandler : shortTokensHandler;
            handler.init.bind(this)();

            this.input.on('pointerover', onMouseOver, this);
            this.input.on('pointerdown', onPointerDown, this);
            this.input.keyboard.on('keydown-DOWN', handler.moveNext, this);
            this.input.keyboard.on('keydown-RIGHT', handler.moveNext, this);
            this.input.keyboard.on('keydown-s', handler.moveNext, this);
            this.input.keyboard.on('keydown-D', handler.moveNext, this);
            this.input.keyboard.on('keydown-UP', handler.movePrevious, this);
            this.input.keyboard.on('keydown-LEFT', handler.movePrevious, this);
            this.input.keyboard.on('keydown-W', handler.movePrevious, this);
            this.input.keyboard.on('keydown-A', handler.movePrevious, this);
            this.input.keyboard.on('keydown-ENTER', handler.onEnter, this);
            this.input.keyboard.on('keydown-ESC', exit, this);
        }

        setInput.bind(this)();
    }

    /**
     * Sets the prize the player wants to obtain
     * @param prize the prize
     * @param tokens the cost in tokens
     */
    setPrize(prize, tokens) {
        this.prize = prize;
        this.cost = tokens;
    }
}