/**
 * A scene to display help text.
 */
class Help extends Phaser.Scene {

    constructor() {
        super('help');
    }

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
    }

    create(){

        let help = this.cache.json.get('help');
        let container = this.add.container(100, 100);
        let graphics = this.make.graphics();
        graphics.fillRect(100, 100, 760, 440);
        let mask = new Phaser.Display.Masks.GeometryMask(this, graphics);

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

        let arrowUp = this.add.image(885, 125, 'icons', 'arrowUp.png').setTint(0x00ff00).setInteractive();
        let arrowDown = this.add.image(885, 515, 'icons', 'arrowDown.png').setTint(0x00ff00).setInteractive();

        // container.add( this.add.text(0, 0, content,
        //     { fontFamily: 'Arial', color: '#00ff00', wordWrap: { width: 760 } }));
        //     //.setOrigin(0);
        buildContainer.bind(this)();

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

        let scrollUp = function() {
            container.y = Phaser.Math.Clamp((container.y += 25), yMin, yMax);
        };

        let scrollDown = function() {
            container.y = Phaser.Math.Clamp((container.y -= 25), yMin, yMax);
        };

        this.input.keyboard.addCapture('UP,DOWN');
        this.input.keyboard.on('keydown-ESC', exit, this);
        this.input.keyboard.on('keydown-DOWN', scrollDown, this);
        this.input.keyboard.on('keydown-UP', scrollUp, this);


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