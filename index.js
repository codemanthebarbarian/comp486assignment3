

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
    scene: [ SplashScene, CarnivalScene, ShootingGallery, BumperCars ]
};

let game = new Phaser.Game(config);
