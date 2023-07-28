import * as Phaser from 'phaser';
import * as Config from './config';

export default class Overlay extends Phaser.Scene {
    private score = 0;

    private gameObjects: Phaser.GameObjects.Shape[];
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
            this.add.rectangle(0, 864, Config.GAME_WIDTH, 8, 0xffffff)
                .setOrigin(0, 0),
            this.add.rectangle(0, 872, Config.GAME_WIDTH, 200, 0xc0c0c0)
                .setOrigin(0, 0),
            this.add.rectangle(0, 1072, Config.GAME_WIDTH, 8, 0x808080)
                .setOrigin(0, 0),

            // Drawing screen for score
            this.add.rectangle(20, 900, 270, 144, 0x404040)
                .setOrigin(0, 0),
            this.add.polygon(20, 900, "0 0 270 0 262 8 8 8 8 136 0 144", 0x808080)
                .setOrigin(0, 0),
            this.add.polygon(20, 900, "0 144 8 136 262 136 262 8 270 0 270 144", 0xffffff)
                .setOrigin(0, 0),
            ];

        const style = { fontFamily: 'Silkscreen', fontSize: '18px' };
        this.scoreLabel = this.add.text(35, 915, 'Score: ' + this.score, style)
            .setOrigin(0, 0);

        this.modeSwitchButton = this.add.rectangle(Config.GAME_WIDTH/2, 940, 86, 86, 0xc0c0c0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.modeSwitchButton.fillColor = 0xa0a0a0;
            })
            .on('pointerup', () => {
                this.game.events.emit('mode-switch')
                this.flagMode = !this.flagMode;
                this.modeSwitchButton.fillColor = 0xc0c0c0;
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

        const modeSwitchPos = this.modeSwitchButton.getTopLeft();
        this.gameObjects.push(
            this.add.polygon(modeSwitchPos.x, modeSwitchPos.y, "0 0 86 0 78 8 8 8 8 78 0 86", 0xffffff).setOrigin(0, 0)
        );
        this.gameObjects.push(
            this.add.polygon(modeSwitchPos.x, modeSwitchPos.y, "86 0 78 8 78 78 8 78 0 86 86 86", 0x808080).setOrigin(0, 0)
        );

        this.game.events.addListener('add-score', (score: number) => this.updateScore(score));
    }

    updateScore(scoreToAdd: number) {
        this.score += scoreToAdd;
        this.scoreLabel.setText('Score: ' + this.score);
    }
}
