

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
            { key: 'InventoryRepo', plugin: InventoryRepo, start: false, mapping: 'inventory' }
        ]
    },
    scene: [ SplashScene, CarnivalScene, ShootingGallery, BumperCars ]
};

let game = new Phaser.Game(config);
