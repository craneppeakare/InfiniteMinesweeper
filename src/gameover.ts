import * as Phaser from 'phaser';
import * as Config from './config';

export default class GameOver extends Phaser.Scene {
    private score: number;

    /**
    * Constructor for the main Scene
    *
    * @returns a Scene
    */
    constructor () {
        super('Gameover');
    }

    /**
    * Initialize method. Runs before preload() and create().
    *
    * @returns void
    */
    init (data: any) {
        this.score = data.score;
        console.log("Your final score is: " + this.score);
    }

    /**
    * Preloads any assets needed for the scene. Runs before the create() method.
    *
    * @returns void
    */
    preload () {
    }

    /**
    * Runs once when scene is created. Spawns the necessary chunks for the game.
    *
    * @returns void
    */
    create () {
        this.add.text(Config.GAME_WIDTH/2, Config.GAME_HEIGHT/2, "GAME OVER\n\nSCORE: " + this.score)
            .setStyle({ fontFamily: 'Silkscreen', fontSize: '64px' })
            .setOrigin(0.5, 0.5);
        this.scene.pause();
    }
}
