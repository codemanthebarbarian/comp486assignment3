/**
 * A scene which displays the prizes the player can purchase with the token won.
 * Prizes will just be emojis.
 */
class PrizesScene extends Phaser.Scene {

    /**
     * The constructor for the scene. Inherited from Phaser 3 scene.
     */
    constructor(){
        let cfg = {
            key: 'prizes',
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
     * Preload any assets prior to running the scene (see Phaser 3 documentation).
     * This gets the json file storing the available prizes.
     */
    preload(){
        // the prizes.json file worked well on linux but a number of missing emojis
        // were found when testing on windows. An alternate method using image files
        // could be used in future versions.
        this.load.json('prizes', './assets/prizes_compatible.json');
    }

    /**
     * Creates and loads the scene.
     */
    create(){

        this.add.text(game.canvas.clientWidth / 2, 10,
            'Prize Booth',
            {
                font: 'bold 25px Arial',
                fill: 'yellow'
            }
            ).setOrigin(.5, 0);
        let tokensTxt = 'Tokens: %1';
        this.add.text(
            game.canvas.clientWidth - 50, game.canvas.clientHeight - 25,
            Phaser.Utils.String.Format(tokensTxt, [this.inventory.tokens()]),
            {
                font: '25px Arial',
                fill: 'yellow'
            }
        ).setOrigin(1,1);

        let graphics = this.add.graphics();
        graphics.lineStyle(1, 0xff0000, 1);
        let prizes = this.cache.json.get('prizes');
        let selected = -1;              // the currently selected prize
        let group = this.add.group();   // the prizes displayed

        /**
         * Phaser does support emoji's however html codes do not match what need
         * to be provided to Phaser. The html codes are well documented online so
         * that is what will be used in the JSON file. This will convert the code to
         * what is expected by Phaser. Phaser provides a link in their documentation
         * for a site with instructions on conversion:
         * http://crocodillon.com/blog/parsing-emoji-unicode-in-javascript
         * @param emoji the html code for the emoji
         * @returns {[string, string]} the string which can be interpreted by phaser
         */
        let findEmojiCode = function(emoji) {
            var offset = emoji - 0x10000,
                lead = 0xd800 + (offset >> 10),
                trail = 0xdc00 + (offset & 0x3ff);
            return [lead.toString(16), trail.toString(16)]
        }

        let getPrize = function(idx){
            let prize = prizes[idx];
            if(this.inventory.hasTokens(prize.tokens)){
                // get the prize

            } else {
                // display error
            }
        }

        /**
         * This creates the prizes and displays them to the user.
         */
        let createPrizes = function(){
            let i = 0;
            prizes.forEach(p => {
                let code = findEmojiCode(parseInt(p.emoji, 16));
                let container = this.add.container(0,0);
                let emoji = this.add.text(null, null,
                    String.fromCharCode(parseInt(code[0], 16)) +
                    String.fromCharCode(parseInt(code[1], 16)),
                    {
                        font: '75px',
                        align: 'center',
                        wordWrap: { width: 100, useAdvancedWrap: true }
                    }
                ).setOrigin(.5,1).setName(i).setInteractive();
                let price = this.add.text(null, null,
                    p.tokens + ' Tokens',
                    {
                        font: '25px Arial',
                        fill: 'yellow',
                        align: 'center',
                        wordWrap: { width: 100, useAdvancedWrap: true }
                    }
                ).setOrigin(.5, 0);
                container.add(emoji).add(price).setName(i++).setData('cost', p.tokens);
                group.add(container);
            }, this);
        };

        createPrizes.bind(this)();

        Phaser.Actions.GridAlign(group.getChildren(),
            { width: 4, cellWidth: 200, cellHeight: 170, x: 275, y: 250 });

        let setInput = function(){

            this.input.keyboard.addCapture('UP, DOWN');

            /**
             * The method to exit the prize booth.
             */
            let exit = function(){
                this.scene.stop();
                this.scene.run('prizebooth');
            };

            /**
             * Highlight the selected prize.
             */
            let highlight = function(){
                graphics.clear();
                if(selected < 0) return;
                graphics.strokeRectShape(group.getChildren()[selected].getData('bounds'));
            }

            /**
             * Selects the previous available response.
             */
            let movePrevious = function() { //select the next response
                --selected;
                if(selected < 0) selected = group.children.entries.length - 1;
                highlight();
            };

            /**
             * Selects the next available response.
             */
            let moveNext = function() {
                ++selected;
                if(selected >= group.children.entries.length) selected = 0;
                highlight();
            };

            let onMouseOver = function(event, txt){
                selected = Array.isArray(txt) ? txt[0].name : txt.name;
                highlight();
            };

            let onPointerDown = function(pointer){
                let coord = pointer.position;
                group.children.each(c => {
                    if(Phaser.Geom.Rectangle.ContainsPoint(c.getData('bounds'), coord)){
                        onEnter.bind(this)();
                    }
                }, this);
            };

            let onEnter = function() {
                //get the prize text game object
                let container = group.getChildren()[selected];
                if(!container) return;
                let prize = container.list[0];
                if(!prize) return;
                let scene = this.scene.get('prizeclaim');
                scene.setPrize(prize.text, container.getData('cost'));
                this.scene.sleep();
                this.scene.run(scene);
            };

            group.children.each(c => {
                let b = c.getBounds(); // getBounds on container is expensive so cache in data
                c.setData('bounds', b);
            }, this);

            this.input.on('pointerover', onMouseOver, this);
            this.input.on('pointerdown', onPointerDown, this);
            this.input.keyboard.on('keydown-DOWN', moveNext, this);
            this.input.keyboard.on('keydown-UP', movePrevious, this);
            this.input.keyboard.on('keydown-ENTER', onEnter, this);
            this.input.keyboard.on('keydown-ESC', exit, this);
        }

        setInput.bind(this)();

    }
}