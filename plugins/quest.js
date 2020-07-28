/**
 * A class for interacting with player quests. This is a repository pattern
 * that will initialize itself from the browser's local storage. It will
 * also save itself to localstorage. It extends from Phaser's BasePlugin
 * and will be loaded and available for all scenes of the game.
 */
class QuestRepo extends Phaser.Plugins.BasePlugin {

    /**
     * The constructor for the plugin
     * @param pluginManager the pahser plugin manager
     */
    constructor(pluginManager){
        super(pluginManager);
        let d = {};
        this.default = JSON.stringify(d);
        let json = localStorage.getItem('quests');
        if(json) this.quests = JSON.parse(json);
        else this.reset();
    }

    /**
     * Sets the state for the quest
     * @param quest the quest to set the state for
     * @param state the state
     */
    setState(quest, state){
        this.quests[quest] = state;
    }

    /**
     * Gets the state for the quest
     * @param quest the quest to get the state for
     * @returns {*} the state (as string) is it exists
     */
    getState(quest){
        return this.quests[quest];
    }

    /**
     * Resets the player's quests.
     */
    reset(){
        this.quests = JSON.parse(this.default);
        this.save();
    }

    /**
     * Checks if the quests are currently in the default state
     * @returns {boolean} true if the quests are in the default state
     */
    isReset(){
        return JSON.stringify(this.quests) === this.default;
    }

    /**
     * Save the current inventory to the browser's local storage.
     */
    save() {
        localStorage.setItem('quests', JSON.stringify(this.quests));
    }

}