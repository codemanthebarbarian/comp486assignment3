/**
 * Gets if the game is in debug mode.
 * @return {boolean|any} true if the game is in debug mode otherwise false
 */
let getDebug = function(){
    let json = localStorage.getItem('settings');
    if(!json) return false;
    let settings = JSON.parse(json);
    return settings && settings.debug;
};

/**
 * A constant used to see if we are currently in debug mode
 * @type {boolean|*} true if debugging
 */
const isDebugging = getDebug();

let config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 960,
    height: 640,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: isDebugging
        }
    },
    plugins: {
        global: [
            { key: 'InventoryRepo', plugin: InventoryRepo, start: false, mapping: 'inventory' },
            { key: 'QuestRepo', plugin: QuestRepo, start: false, mapping: 'quests' },
            { key: 'SettingsRepo', plugin: SettingsRepo, start: false, mapping: 'settings' }
        ]
    },
    scene: [ SplashScene, CarnivalScene, ShootingGallery, BumperCars, Inventory, PrizesScene, PrizeClaimScene, SettingsScene ]
};

let game = new Phaser.Game(config);
