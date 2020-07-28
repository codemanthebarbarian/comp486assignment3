/**
 * A scene to confirm the player prize selection
 */
class PrizeClaimScene extends Phaser.Scene {

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
                if (selected) graphics.strokeRectShape(selected);
            }

            let onMouseOver = function(event, txt){
                if(!text || !text.name) return;
                selected = txt;
                highlight();
            }

            let onPointerDown = function(pointer) {
                let coord = pointer.position;
                let txt = this.physics.overlapCirc(coord.x, coord.y, 2);
                if(txt.length > 0) handler.onEnter();
            }

            let claimPrize = function() {
                this.inventory.getTokens(this.cost);
                this.inventory.addItem(this.prize);
                this.inventory.save();
            }

            let hasTokensHandler = {
                init : function() {
                    inputClaim = this.add.text(center - 10, yCoord,
                    'Claim', {
                        font: '25px Arial',
                        fill: 'Yellow'
                    }).setOrigin(0, .5).setName('claim').setInteractive();
                    inputBack = this.add.text(center + 10, yCoord,
                    'Back', {
                        font: '25px Arial',
                        fill: 'Yellow'
                    }).setOrigin(0, .5).setName('back').setInteractive();
                },

                moveNext: function() {
                    if(selected && selected.name === 'claim') selected = inputBack;
                    else selected = inputClaim;
                },

                movePrevious: function(){
                    if(selected && selected.name === 'back') selected = inputClaim;
                    else selected = inputBack;
                },

                onEnter: function() {
                    if(!selected) return;
                    if(selected.name === 'claim') claimPrize.bind(this)();
                    else exit.bind(this)();
                }

            };

            let shortTokensHandler = {
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
                },

                moveNext: function() {
                    selected = inputBack;
                    highlight();
                },

                movePrevious: function(){
                    selected = inputBack;
                    highlight();
                },

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
            this.input.keyboard.on('keydown-UP', handler.movePrevious, this);
            this.input.keyboard.on('keydown-LEFT', handler.movePrevious, this);
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