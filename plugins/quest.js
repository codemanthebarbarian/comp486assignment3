/**
 * A class for interactin with player quests. This is a repository pattern
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
        let json = localStorage.getItem('quests');
        if(json) this.quests = JSON.parse(json);
        else this.quests = {};
        localStorage.setItem('quests', JSON.stringify(this.quests));
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
     * Save the current inventory to the browser's local storage.
     */
    save() {
        localStorage.setItem('quests', JSON.stringify(this.quests));
    }

}