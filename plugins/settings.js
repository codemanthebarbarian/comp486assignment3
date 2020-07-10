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

    toggleBackgroundMusicEnabled() {
        return this.setBackgroundMusicEnabled(! this.vals.audio.background.enabled);
    }

    save() {
        localStorage.setItem('settings', JSON.stringify(this.vals))
    }

}