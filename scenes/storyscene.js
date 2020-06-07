
class StoryScene extends Phaser.Scene {

    constructor() {
        let cfg = {
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

    preload() {
        //TODO: need to unload previous file prior to loading new one
        let data = this.scene.settings.data;
        let story = this.cache.json.get('story');
        if(!story || story.trigger !== data.story) {
            this.cache.json.remove('story');
            this.load.json('story', './assets/stories/' + data.story + '.json');
        }
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
        };
        let submitResponse = function() { // commit the currently selected response
            this.graphics.clear();
            if(!this.storyResponses) this.exit();
            if(this.currentResponse < 0) return;
            this.loadLine(this.storyResponses[this.currentResponse].next);
        };
        let onPointerDown = function(pointer) {
            let coord = pointer.position;
            this.currentResponse = -1;
            let txt = this.physics.overlapCirc(coord.x, coord.y, 2);
            if(txt && txt[0] && txt[0].gameObject.text) this.currentResponse = txt[0].gameObject.name;
            submitResponse.bind(this)();
        };
        let selectPrevious = function() { //select the next response
            if(!this.storyResponses) return;
            --this.currentResponse;
            if(this.currentResponse < 0) this.currentResponse = this.storyResponses.length - 1;
            this.highlight();
        };
        let selectNext = function() { //select the previous response
            if(!this.storyResponses) return;
            ++this.currentResponse;
            if(this.currentResponse >= this.storyResponses.length) this.currentResponse = 0;
            this.highlight();
        };
        this.input.keyboard.on('keydown-ESC', exit,this);
        this.input.keyboard.on('keydown-DOWN', selectNext, this);
        this.input.keyboard.on('keydown-UP', selectPrevious, this);
        this.input.keyboard.on('keydown-ENTER', submitResponse, this);
        this.input.on('pointerdown', onPointerDown, this);
    }

    getAward(){
        let award = this.storyLine.award;
        if(!award) return;
        if(award.items) this.inventory.addItem(award.items);
        if(award.cash) this.inventory.addCash(award.cash)
        if(award.tickets) this.inventory.addTickets(award.tickets)
    }

    highlight(){
        this.graphics.clear();
        if(this.currentResponse < 0) return;
        this.graphics.lineStyle(1, 0xff0000, 1);
        this.graphics.strokeRectShape(this.responses[this.currentResponse].getBounds());
    }

    exit(){
        this.inventory.save();
        this.registry.set(this.story.trigger,
            { stage: this.storyLine.endState ? this.storyLine.endState : this.stage.endState } );
        let nextScene = this.storyLine.scene || this.stage.scene;
        this.scene.stop();
        if(nextScene) this.scene.run(nextScene);
        else this.scene.wake('carnival', { exit: this.stage });
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
        this.getAward();
    }

    loadResponses(){

        let clear = function(txt){
            txt.text = null;
        };

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
            this.physics.add.existing(txt);
            this.input.on('pointerover', onMouseOver, this);
        };

        let getResponses = function(){
            let requires = this.storyLine.requires;
            if(!requires) {
                return this.storyLine.responses;
            }
            let yes = requires.cash ? this.inventory.getCash(requires.cash) > 0 : true;
            yes = yes && requires.tickets ? this.inventory.getTickets(requires.tickets) > 0 : yes;
            yes = yes && requires.items ? this.inventory.getItem(requires.items) != null : yes;
            if(!yes) {
                //return any cash and tickets taken (items would never be taken)
                if(requires.cash) this.inventory.addCash(requires.cash)
                if(requires.tickets) this.inventory.addTickets(requires.tickets)
                return this.storyLine.responses.no;
            }
            return this.storyLine.responses.yes;
        };

        this.currentResponse = -1;
        this.responses.forEach(clear);
        this.storyResponses = getResponses.bind(this)();
        if(this.storyResponses && this.storyResponses.length > 0){
            for(let i = 0 ; i < this.storyResponses.length ; ++i){
                addResponse.bind(this)(i, this.storyResponses[i].response);
            }
        }
    }


}