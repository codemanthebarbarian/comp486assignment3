
class StoryScene extends Phaser.Scene {

    constructor(cfg) {
        super(cfg);
    }

    preload() {
        let data = this.scene.settings.data;
        this.load.json('story', './assets/stories/' + data.story + '.json');
    }

    create() {
        this.graphics = this.add.graphics();
        this.story = this.cache.json.get('story');
        this.loadStage();
        this.add.text(game.canvas.clientWidth / 2, game.canvas.clientHeight - 50,
            'Use arrow keys to select a response and press Enter to submit.').setOrigin(0.5);
        this.setInputHandler();
    }

    setInputHandler(){
        let exit = function() {
            this.scene.stop();
            this.scene.wake('carnival', { exit: this.stage });
        }
        let selectPrevious = function() { //select the next response
            if(!this.storyLine.responses) return;
            --this.currentResponse;
            if(this.currentResponse < 0) this.currentResponse = this.storyLine.responses.length - 1;
            this.highlight();
        };
        let selectNext = function() { //select the previous response
            if(!this.storyLine.responses) return;
            ++this.currentResponse;
            if(this.currentResponse >= this.storyLine.responses.length) this.currentResponse = 0;
            this.highlight();
        };
        this.input.keyboard.on('keydown-ESC', exit,this);
        this.input.keyboard.on('keydown-DOWN', selectNext, this);
        this.input.keyboard.on('keydown-UP', selectPrevious, this);
        this.input.keyboard.on('keydown-ENTER', this.submitResponse, this);
        this.input.on('pointerdown', this.submitResponse, this);
    }

    highlight(){
        this.graphics.clear();
        if(this.currentResponse < 0) return;
        this.graphics.lineStyle(1, 0xff0000, 1);
        this.graphics.strokeRectShape(this.responses[this.currentResponse].getBounds());
    }

    submitResponse() { // commit the currently selected response
        this.graphics.clear();
        if(!this.storyLine.responses) this.exit();
        if(this.currentResponse < 0) return;
        this.loadLine(this.storyLine.responses[this.currentResponse].next);
    }

    exit(){
        this.registry.set(this.story.trigger,
            { stage: this.storyLine.endState ? this.storyLine.endState : this.stage.endState } );
        this.scene.stop();
        this.scene.wake('carnival', { exit: this.stage });
    }

    update() {
        if(this.input.pointer1.isDown) this.exit();
    }

    loadStage() {
        this.responses = [];
        let item = this.registry.get(this.story.trigger);
        if(!item){
            this.stage = this.story.stages[0]; //get first stage by default
            this.registry.set(this.story.trigger, { stage: this.stage.name } );
        } else {
            this.stage = this.story.stages.find(s => s.name === item.stage);
            if(!this.stage) this.stage = this.story.stages[0];
        }
        this.add.text(game.canvas.clientWidth / 2, 50, this.story.title).setOrigin(0.5);
        this.character = this.make.text({
            x: 360,
            y: 100,
            text: null,
            style: {
                font: 'bold 25px Arial',
                fill: 'green',
                wordWrap: { width: 560, useAdvancedWrap: true }
            }
        });
        this.loadLine(0);
    }

    loadLine(idx) {
        this.storyLine = this.stage.script[idx];
        this.character.text = this.storyLine.isRandom ?
            this.storyLine.lines[Phaser.Math.Between(1, this.storyLine.lines.length) - 1].line
            : this.storyLine.line;
        this.loadResponses();
    }

    loadResponses(){
        this.currentResponse = -1;
        let clear = function(txt){
            txt.text = null;
        }
        let onMoun
        let onMouseOver = function(event, txt){
            if(! txt[0].text) return;
            this.currentResponse = txt[0].name;
            this.highlight();
        };
        let addResponse = function(idx, resp){
            let n = idx + 1;
            if(this.responses[idx]) return this.responses[idx].text = n + ': ' + resp;
            let y = ( game.canvas.clientHeight / 2 ) + ( 50 * idx );
            let txt = this.make.text({
                x: 50,
                y: y,
                text: n + ': ' + resp,
                style: {
                    font: 'bold 25px Arial',
                    fill: 'green',
                    wordWrap: { width: 560, useAdvancedWrap: true }
                }
            }).setName(idx).setInteractive();
            this.responses.push(txt);
            this.input.on('pointerover', onMouseOver, this);
        };
        this.responses.forEach(clear);
        if(this.storyLine.responses && this.storyLine.responses.length > 0){
            for(let i = 0 ; i < this.storyLine.responses.length ; ++i){
                addResponse.bind(this)(i, this.storyLine.responses[i].response);
            }
        }
    }


}