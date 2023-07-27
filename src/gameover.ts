import * as Phaser from 'phaser';
import * as Config from './config';

export default class GameOver extends Phaser.Scene {
    private score: number;
    private highscore: number;
    private maxDistance: number;

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
        this.highscore = data.highscore;
        this.maxDistance = data.maxDistance;
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
        // const gameoverString = `GAME OVER\n\nDISTANCE: ${this.maxDistance}m\nSCORE: ${this.score}\nHIGHSCORE: ${this.highscore}`;
        const gameoverString = `I LOVE YOU CJ\n\nDISTANCE: ${this.maxDistance}m\nSCORE: ${this.score}\nHIGHSCORE: ${this.highscore}`;
        this.add.text(Config.GAME_WIDTH/2, Config.GAME_HEIGHT/2, gameoverString)
            .setStyle({ fontFamily: 'Silkscreen', fontSize: '64px', align: 'center', stroke: '#000000', strokeThickness: 5 })
            .setOrigin(0.5, 0.5);
        this.scene.pause();
    }
}
