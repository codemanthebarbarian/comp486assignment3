
class StoryScene extends Phaser.Scene {

    constructor(cfg) {
        super(cfg);
    }

    preload() {
        let data = this.scene.settings.data;
        this.load.json('story', './assets/stories/' + data.story + '.json');
    }

    create() {
        this.responses = [];
        this.storyStage = 0;
        this.storyLine = 0;
        this.graphics = this.add.graphics();
        this.story = this.cache.json.get('story');
        if(!this.registry.get(this.story.trigger)) this.registry.set(this.story.trigger, { stage: null} );
        this.stage = this.registry.get(this.story.trigger).stage;
        this.add.text(game.canvas.clientWidth / 2, 50, this.story.title).setOrigin(0.5);
        this.character = this.make.text({
            x: 360,
            y: 100,
            text: this.story.stages[this.storyStage].script[this.storyLine].line,
            style: {
                font: 'bold 25px Arial',
                fill: 'green',
                wordWrap: { width: 560, useAdvancedWrap: true }
            }
        });
        this.loadResponses();
        this.add.text(game.canvas.clientWidth / 2, game.canvas.clientHeight - 50,
            'Use arrow keys to select a response and press Enter to submit.').setOrigin(0.5);
        this.setInputHandler();
        // this.esc = this.input.keyboard.on('keydown_ESC', (event) => {
        //     this.scene.stop();
        //     this.scene.wake('carnival', { exit: this.stage });
        // }, this);
    }

    setInputHandler(){
        let exit = function() {
            this.scene.stop();
            this.scene.wake('carnival', { exit: this.stage });
        }
        let submitResponse = function() { // commit the currently selected response

        };
        // allow the player to exit the story when ready and there are no responses
        if(!this.storyLine.responses) {
            
        }
        let highlight = function(){
            if(this.currentResponse < 0) return;
            this.graphics.clear();
            this.graphics.lineStyle(1, 0xff0000, 1);
            this.graphics.strokeRectShape(this.responses[this.currentResponse].getBounds());
        };
        let selectPrevious = function() { //select the next response
            --this.currentResponse;
            if(this.currentResponse < 0) this.currentResponse = this.storyLine.responses.length - 1;
            highlight.bind(this)();
        };
        let selectNext = function() { //select the previous response
            ++this.currentResponse;
            if(this.currentResponse >= this.storyLine.responses.length) this.currentResponse = 0;
            highlight.bind(this)();
        };
        this.input.keyboard.on('keydown-ESC', exit,this);
        this.input.keyboard.on('keydown-DOWN', selectNext, this);
        this.input.keyboard.on('keydown-UP', selectPrevious, this);
        this.input.keyboard.on('keydown-ENTER', submitResponse, this);
    }

    update() {
        if(this.input.pointer1.isDown){
            this.scene.stop();
            this.scene.wake('carnival', { exit: this.stage });
        }
    }

    loadResponses(){
        this.currentResponse = -1;
        let addResponse = function(idx, resp){
            let n = idx + 1;
            let y = ( game.canvas.clientHeight / 2 ) + ( 50 * idx );
            this.responses.push(
                this.make.text({
                    x: 50,
                    y: y,
                    text: n + ': ' + resp,
                    style: {
                        font: 'bold 25px Arial',
                        fill: 'green',
                        wordWrap: { width: 560, useAdvancedWrap: true }
                    }
                })
            );
        };
        this.storyLine = this.story.stages[this.storyStage].script[this.storyLine];
        if(this.storyLine.responses && this.storyLine.responses.length > 0){
            for(let i = 0 ; i < this.storyLine.responses.length ; ++i){
                addResponse.bind(this)(i, this.storyLine.responses[i].response);
            }
        }
    }


}