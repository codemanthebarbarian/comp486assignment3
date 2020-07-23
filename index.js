

let config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 960,
    height: 640,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
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
