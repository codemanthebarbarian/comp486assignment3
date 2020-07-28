/**
 * A class for storing the player's settings.
 */
class SettingsRepo extends Phaser.Plugins.BasePlugin {

    /**
     * The constructor for the plugin
     * @param pluginManager the phaser plugin manager
     */
    constructor(pluginManager){
        super(pluginManager);
        let json = localStorage.getItem('settings');
        if(json) this.vals = JSON.parse(json);
        else this.vals = { audio: {
                background: {
                    enabled: true
                }
            }
        };
        localStorage.setItem('settings', JSON.stringify(this.vals));
    }

    /**
     * Gets if the player has enabled background music.
     * @returns {boolean} true if enabled false disabled.
     */
    isBackgroundMusicEnabled(){
        return this.vals.audio.background.enabled;
    }

    /**
     * Sets the player's preferences for the background music.
     * @param val true for enabled otherwise disabled
     * @returns {boolean} the current value background music
     */
    setBackgroundMusicEnabled(val){
        this.vals.audio.background.enabled = val;
        this.save();
        return this.vals.audio.background.enabled;
    }

    /**
     * Toggles the background music and returns if the current state after toggle.
     * @returns {boolean} true if the background music is enabled or false if disabled.
     */
    toggleBackgroundMusicEnabled() {
        return this.setBackgroundMusicEnabled(! this.vals.audio.background.enabled);
    }

    /**
     * Save the players current settings. Currently if the
     * background music is to be enabled or not.
     */
    save() {
        localStorage.setItem('settings', JSON.stringify(this.vals))
    }

}