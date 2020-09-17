/**
 * A scene to display help text.
 * 
 * NEW FOR ASSIGNMENT 3
 */
class Help extends Phaser.Scene {

    constructor() {
        super('help');
    }

    /**
     * load the assets used in the help files
     */
    preload() {
        let data = this.scene.settings.data;
        let help = this.cache.json.get('help');
        if(!help || help.name !== data.help) {
            this.cache.json.remove('help');
            this.load.json('help', './assets/help/' + data.help + '.json');
        }
        this.load.image('help/carnival.jpg', './assets/help/carnival.jpg');
        this.load.image('help/carnivalAction.jpg', './assets/help/carnivalAction.jpg');
        this.load.image('help/story.jpg', './assets/help/story.jpg');
        this.load.image('help/bumpercars.jpg', './assets/help/bumpercars.jpg');
        this.load.image('help/shootinggallery.jpg', './assets/help/shootinggallery.jpg');
        this.load.image('help/cave.jpg', './assets/help/cave.jpg');
    }

    /**
     * initialize the help
     */
    create(){

        let help = this.cache.json.get('help');
        let container = this.add.container(100, 100);
        let graphics = this.make.graphics();
        graphics.fillRect(100, 100, 760, 440);
        let mask = new Phaser.Display.Masks.GeometryMask(this, graphics);

        //Set the scrolling area for the help file
        let buildContainer = function() {

            let y = 0;

            let addText = function(content) {
                let txt = this.add.text(0, y, content,
                    { fontFamily: 'Arial', color: '#00ff00', wordWrap: { width: 760 } });
                container.add(txt);
                y += txt.height + 10;
            }

            let addImage = function(path) {
                let img = this.add.image(380, y, 'help/' + path);
                img.setY((img.height / 2) + y);
                container.add(img);
                y += img.height + 10;
            }

            help.contents.forEach( i => {
                if(i.type === 'text') addText.bind(this)(i.item);
                else if (i.type === 'image') addImage.bind(this)(i.item);
            }, this)
        }

        // load scroll arrows
        let arrowUp = this.add.image(885, 125, 'icons', 'arrowUp.png').setTint(0x00ff00).setInteractive();
        let arrowDown = this.add.image(885, 515, 'icons', 'arrowDown.png').setTint(0x00ff00).setInteractive();

        // container.add( this.add.text(0, 0, content,
        //     { fontFamily: 'Arial', color: '#00ff00', wordWrap: { width: 760 } }));
        //     //.setOrigin(0);
        buildContainer.bind(this)();

        // calculate the scrolling bounds
        let bounds = container.getBounds();
        let yMin = 100 - (bounds.height - 440);
        if (yMin > 100) yMin = 100;
        let yMax = 100;

        container.setMask(mask);

        //  The rectangle they can 'drag' within
        let zone = this.add.zone(100, 100, 760, 440).setOrigin(0).setInteractive();

        let exit = function(){
            this.scene.stop();
            this.scene.wake(this.scene.settings.data.caller);
        };

        // help scrolling functions
        let scrollUp = function() {
            container.y = Phaser.Math.Clamp((container.y += 25), yMin, yMax);
        };

        let scrollDown = function() {
            container.y = Phaser.Math.Clamp((container.y -= 25), yMin, yMax);
        };

        // User input
        this.input.keyboard.addCapture('UP,DOWN');
        this.input.keyboard.on('keydown-ESC', exit, this);
        this.input.keyboard.on('keydown-DOWN', scrollDown, this);
        this.input.keyboard.on('keydown-UP', scrollUp, this);
        this.input.keyboard.on('keydown-H', exit, this);
        this.input.keyboard.on('keydown-S', scrollDown, this);
        this.input.keyboard.on('keydown-w', scrollUp, this);
        arrowUp.on('pointerdown', scrollUp, this);
        arrowDown.on('pointerdown', scrollDown, this);

        // drag scrolling
        zone.on('pointermove', function (pointer) {

            if (pointer.isDown)
            {
                container.y += (pointer.velocity.y / 10);
                container.y = Phaser.Math.Clamp(container.y, yMin, yMax);
                //text.y = Phaser.Math.Clamp(text.y, -400, 300);
            }

        });
    }
}