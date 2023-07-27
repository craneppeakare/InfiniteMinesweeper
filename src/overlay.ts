import * as Phaser from 'phaser';
import * as Config from './config';

export default class Overlay extends Phaser.Scene {
    private score = 0;

    private gameObjects: Phaser.GameObjects.Rectangle[];
    private modeSwitchButton: Phaser.GameObjects.Rectangle;
    private scoreLabel: Phaser.GameObjects.Text;
    private flagMode = false;

    private flagImage: Phaser.GameObjects.Image;
    private shovelImage: Phaser.GameObjects.Image;

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
        this.load.image('mineImage', 'assets/mine.png');
        this.load.image('flagImage', 'assets/flag.png');
        this.load.image('shovelImage', 'assets/shovel.png');
    }

    /**
    * Runs once when scene is created. Spawns the necessary chunks for the game.
    *
    * @returns void
    */
    create () {
        this.gameObjects = [
            // Top bar
            this.add.rectangle(0, 0, Config.GAME_WIDTH, 8, 0xffffff)
                .setOrigin(0, 0),
            this.add.rectangle(0, 8, Config.GAME_WIDTH, 16, 0xc0c0c0)
                .setOrigin(0, 0),
            this.add.rectangle(0, 24, Config.GAME_WIDTH, 8, 0x808080)
                .setOrigin(0, 0),

            // Bottom bar
            this.add.rectangle(0, 864, Config.GAME_WIDTH, 10, 0xffffff)
                .setOrigin(0, 0),
            this.add.rectangle(0, 874, Config.GAME_WIDTH, 196, 0xc0c0c0)
                .setOrigin(0, 0),
            this.add.rectangle(0, 1070, Config.GAME_WIDTH, 10, 0x808080)
                .setOrigin(0, 0),

            // Drawing screen for score
            this.add.rectangle(20, 900, 270, 144, 0x404040)
                .setOrigin(0, 0),
            ];

        const style = { fontFamily: 'Silkscreen', fontSize: '18px' };
        this.scoreLabel = this.add.text(35, 915, 'Score: ' + this.score, style)
            .setOrigin(0, 0);

        this.modeSwitchButton = this.add.rectangle(Config.GAME_WIDTH/2, 940, 86, 86, 0xffffff)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerup', () => {
                this.game.events.emit('mode-switch')
                this.flagMode = !this.flagMode;
                if (this.flagMode) {
                    this.flagImage.setVisible(true);
                    this.shovelImage.setVisible(false);
                } else {
                    this.flagImage.setVisible(false);
                    this.shovelImage.setVisible(true);
                }
            });
        this.flagImage = this.add.image(Config.GAME_WIDTH/2, 940, 'flagImage')
            .setVisible(false);
        this.shovelImage = this.add.image(Config.GAME_WIDTH/2, 940, 'shovelImage');

        this.game.events.addListener('add-score', (score: number) => this.updateScore(score));
    }

    updateScore(scoreToAdd: number) {
        this.score += scoreToAdd;
        this.scoreLabel.setText('Score: ' + this.score);
    }
}
