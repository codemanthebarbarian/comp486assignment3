/**
 * Represents a story scene. A story scene is a dialog scene between the player and a
 * character. This will handle any requirements or awards with the scene. Each story
 * scene has an associated JSON file with handles the dialog, requirements, and awards
 * associated with the story.
 */
class StoryScene extends Phaser.Scene {

    /**
     * The constructor for the scene. Debugging has been turned off as it affects highlighting (make debugging worse).
     */
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

    /**
     * Preload any assets prior to running the scene (see Phaser 3 documentation).
     * This gets the story JSON for the scene. If this is a new scene, it will flush the cache and load the
     * new story's JSON.
     */
    preload() {
        let data = this.scene.settings.data;
        let story = this.cache.json.get('story');
        if(!story || story.trigger !== data.story) {
            this.cache.json.remove('story');
            this.load.json('story', './assets/stories/' + data.story + '.json');
        }
    }

    /**
     * Loads any story assets (see Phaser 3 documentation)
     */
    create() {
        this.graphics = this.add.graphics();
        this.story = this.cache.json.get('story');
        this.loadStage();
        this.add.text(game.canvas.clientWidth / 2, game.canvas.clientHeight - 50,
            'Use arrow keys to select a response and press Enter to submit.').setOrigin(0.5);
        this.setInputHandler();
    }

    /**
     * Sets the handlers for selecting a player response. Currently supports keyboard,
     * mouse and touch screen.
     */
    setInputHandler(){
        /**
         * Called when the the story is over.
         */
        let exit = function() {
            let setState = function(state){
                if(!state) return;
                if(state.constructor === Array)
                    state.forEach(i => {
                        this.quests.setState(i.story, i.state);
                    }, this)
                else this.quests.setState(this.story.trigger, state)
                this.quests.save();
            }

            this.inventory.save();
            setState.bind(this)(this.storyLine.endState || this.stage.endState);
            // this.registry.set(this.story.trigger,
            //     { stage: this.storyLine.endState ? this.storyLine.endState : this.stage.endState } );
            let nextScene = this.storyLine.scene || this.stage.scene;
            this.scene.stop();
            if(nextScene) {
                // we are not going back to carnival, so pause backgroud
                this.scene.get('carnival').music.pause();
                this.scene.run(nextScene);
            }
            else this.scene.wake('carnival', { exit: this.stage });
        };
        /**
         * Called when the user submits a response.
         */
        let submitResponse = function() { // commit the currently selected response
            this.graphics.clear();
            if(!this.storyResponses) exit.bind(this)();
            if(this.currentResponse < 0) return;
            this.loadLine(this.storyResponses[this.currentResponse].next);
        };
        /**
         * Called when the pointer is down (item selected).
         * @param pointer the Phaser 3 input pointer object.
         */
        let onPointerDown = function(pointer) {
            let coord = pointer.position;
            this.currentResponse = -1;
            let txt = this.physics.overlapCirc(coord.x, coord.y, 2);
            if(txt && txt[0] && txt[0].gameObject.text) this.currentResponse = txt[0].gameObject.name;
            submitResponse.bind(this)();
        };
        /**
         * Selects the previous available response.
         */
        let selectPrevious = function() { //select the next response
            if(!this.storyResponses) return;
            --this.currentResponse;
            if(this.currentResponse < 0) this.currentResponse = this.storyResponses.length - 1;
            this.highlight();
        };
        /**
         * Selects the next available response.
         */
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

    /**
     * Gets any awards associated with the current story line.
     */
    getAward(){
        let award = this.storyLine.award;
        if(!award) return;
        if(award.items) this.inventory.addItem(award.items);
        if(award.cash) this.inventory.addCash(award.cash)
        if(award.tickets) this.inventory.addTickets(award.tickets)
    }

    /**
     * Highlight the selected response.
     */
    highlight(){
        this.graphics.clear();
        if(this.currentResponse < 0) return;
        this.graphics.lineStyle(1, 0xff0000, 1);
        this.graphics.strokeRectShape(this.responses[this.currentResponse].getBounds());
    }

    /**
     * Loads the appropriate stage from the story's JSON file using the state currently
     * stored in the registry for the story.
     */
    loadStage() {
        this.responses = [];
        let questState = this.quests.getState(this.story.trigger);
        if(!questState){
            this.stage = this.story.stages[0]; //get first stage by default
            this.registry.set(this.story.trigger, { stage: this.stage.name } );
        } else {
            this.stage = this.story.stages.find(s => s.name === questState);
            if(!this.stage) this.stage = this.story.stages[0];
        }
        this.make.text({
            x: (game.canvas.clientWidth / 2),
            y: 25,
            text: this.story.title,
            style: {
                font: 'bold 25px Arial',
                fill: 'green'
            }
        }).setOrigin(.5, .5);
        this.characterName = this.make.text({
            x: 70,
            y: 50,
            text: null,
            style: {
                font: 'bold 25px Arial',
                fill: 'green'
            }
        });
        this.characterLine = this.make.text({
            x: 140,
            y: 100,
            text: null,
            style: {
                font: '25px Arial',
                fill: 'green',
                wordWrap: { width: 800, useAdvancedWrap: true }
            }
        });
        this.loadLine(0);
    }

    /**
     * Loads the next line from the story's JSON file. If lines are provided, will choose a random line
     * for the character. A line can be an array of strings, each line in the array will be on it's own line
     * break as per the Phaser 3 API for displaying lines.
     * @param idx the index of the line to load.
     */
    loadLine(idx) {
        this.storyLine = this.stage.script[idx];
        this.characterName.setText(this.storyLine.character + ':');
        this.characterLine.setText(this.storyLine.line ||
            this.storyLine.lines[Phaser.Math.Between(1, this.storyLine.lines.length) - 1].line);
        this.loadResponses();
        this.getAward();
    }

    /**
     * Loads any responses for the current line. Currently the game supports up to 4 player responses.
     */
    loadResponses(){

        /**
         * Clears any text from unused response lines.
         * @param txt
         */
        let clear = function(txt){
            txt.text = null;
        };

        /**
         * Highlights a response if the mouse is over the text.
         * @param event the mouse over event provided by Phaser
         * @param txt the text
         */
        let onMouseOver = function(event, txt){
            if(! txt[0].text) return;
            this.currentResponse = txt[0].name;
            this.highlight();
        };

        /**
         * Sets the response for the provided index. If the item exists for the index, it is replaced,
         * otherwise a new response is created.
         * @param idx the index of the response to add.
         * @param resp the response text
         * @returns {string} not used
         */
        let addResponse = function(idx, resp){
            let n = idx + 1;
            if(this.responses[idx]) return this.responses[idx].text = n + ': ' + resp;
            let y = ( game.canvas.clientHeight / 2 ) + ( 50 * idx );
            let txt = this.make.text({
                x: 20,
                y: y,
                text: n + ': ' + resp,
                style: {
                    font: '25px Arial',
                    fill: 'green',
                    wordWrap: { width: 800, useAdvancedWrap: true }
                }
            }).setName(idx).setInteractive();
            this.responses.push(txt);
            this.physics.add.existing(txt);
            this.input.on('pointerover', onMouseOver, this);
        };

        /**
         * Gets the responses for the current story line if they exist. If the line requires an object,
         * it will return the lines according to if the requirement was met.
         * @returns {[]|*} the lines or nothing if no lines exist
         */
        let getResponses = function(){
            let requires = this.storyLine.requires;
            if(!requires) {
                return this.storyLine.responses;
            }
            let yes = requires.cash ? this.inventory.hasCash(requires.cash) : true;
            yes = yes && requires.tickets ? this.inventory.hasTickets(requires.tickets) : yes;
            yes = yes && requires.items ? this.inventory.owns(requires.items) : yes;
            if(!yes) return this.storyLine.responses.no;
            // Has requirements
            if(requires.cash) this.inventory.getCash(requires.cash);
            if(requires.tickets) this.inventory.getTickets(requires.tickets);
            if(requires.items) this.inventory.getItem(requires.items);
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