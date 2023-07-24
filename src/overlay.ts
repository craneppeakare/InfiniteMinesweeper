import * as Phaser from 'phaser';
import * as Config from './config';

export default class Overlay extends Phaser.Scene {
    
    gameObjects: Phaser.GameObjects.Rectangle[];
    modeSwitchButton: Phaser.GameObjects.Rectangle;

    /**
    * Constructor for the main Scene
    *
    * @returns a Scene
    */
    constructor () {
        super({key: 'Overlay', active: true});
    }

    /**
    * Preloads any assets needed for the scene. Runs before the create() method.
    *
    * @returns void
    */
    preload () {
        // this.load.image('revealparticle', 'assets/revealParticle.png');
    }

    /**
    * Runs once when scene is created. Spawns the necessary chunks for the game.
    *
    * @returns void
    */
    create () {
        console.log("hello world");
        this.gameObjects = [
            // Top bar
            this.add.rectangle(0, 0, Config.GAME_WIDTH, 32, 0xffffff)
                .setOrigin(0, 0),
            this.add.rectangle(0, 8, Config.GAME_WIDTH, 16, 0xc0c0c0)
                .setOrigin(0, 0),
            this.add.rectangle(0, 24, Config.GAME_WIDTH, 8, 0x808080)
                .setOrigin(0, 0),

            // Bottom bar
            this.add.rectangle(0, 800, Config.GAME_WIDTH, 10, 0xffffff)
                .setOrigin(0, 0),
            // this.add.rectangle(0, 810, Config.GAME_WIDTH, 260, 0xc0c0c0)
            //     .setOrigin(0, 0),
            this.add.rectangle(0, 1070, Config.GAME_WIDTH, 10, 0x808080)
                .setOrigin(0, 0),
            ];


        this.modeSwitchButton = this.add.rectangle(Config.GAME_WIDTH/2, 940, 96, 96, 0x00ff00)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerup', () => {
                this.game.events.emit('mode-switch')
                if (this.modeSwitchButton.fillColor === 0xff00ff) {
                    this.modeSwitchButton.fillColor = 0x00ff00;
                } else {
                    this.modeSwitchButton.fillColor = 0xff00ff;
                }
            });

    }
}
