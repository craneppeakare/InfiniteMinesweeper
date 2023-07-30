import * as Phaser from 'phaser';
import * as Config from './config';
import Button from './button';

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
        window.navigator.vibrate(200);

        // const gameoverString = `GAME OVER\n\nDISTANCE: ${this.maxDistance}m\nSCORE: ${this.score}\nHIGHSCORE: ${this.highscore}`;
        const gameoverString = `I LOVE YOU CJ\n\nDISTANCE: ${this.maxDistance}m\nSCORE: ${this.score}\nHIGHSCORE: ${this.highscore}`;
        this.add.text(Config.GAME_WIDTH/2, Config.GAME_HEIGHT/2, gameoverString)
            .setStyle({ ...Config.largeStyle, align: 'center' })
            .setOrigin(0.5, 0.5);

        this.game.scene.pause("Infinite Minesweeper");
        this.game.scene.pause("Overlay");

        this.scene.moveUp();

        const restartButton = new Button(this, Config.GAME_WIDTH/2, 800, "Restart");
        restartButton.onClick(() => {
            // this.scene.stop();
            this.scene.start("Infinite Minesweeper");
            this.scene.start("Overlay");
        });
    }
}
