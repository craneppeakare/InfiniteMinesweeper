import * as Phaser from 'phaser';
import * as Config from './config';
import Button from './button';

export default class MainMenu extends Phaser.Scene {

    private soundOnButton: Phaser.GameObjects.Image;
    private soundOffButton: Phaser.GameObjects.Image;
    private bgm: Phaser.GameObjects.Shape;

    /**
    * Constructor for the main Scene
    *
    * @returns a Scene
    */
    constructor () {
        super('MainMenu');
    }

    /**
    * Preloads any assets needed for the scene. Runs before the create() method.
    *
    * @returns void
    */
    preload () {
        this.load.image('soundOn', 'assets/icons/speaker.png');
        this.load.image('soundOff', 'assets/icons/speakerCrossed.png');
        this.load.image('mainMenuBg', 'assets/mainMenuBg.png');
        this.load.image('titleImage', 'assets/titleImage.png');

        this.load.audio('bg', 'assets/sounds/bg-music.wav');
    }

    /**
    * Runs once when scene is created. Spawns the necessary chunks for the game.
    *
    * @returns void
    */
    create () {
        const bg1 = this.add.image(Config.GAME_WIDTH/2, Config.GAME_HEIGHT/2, "mainMenuBg")
            .setScale(1.25);
        const bg2 = this.add.image(Config.GAME_WIDTH/2, bg1.getCenter().y-bg1.displayHeight, "mainMenuBg")
            .setScale(1.25);

        this.tweens.add({
            targets: [bg1, bg2],
            y: `+=${bg1.displayHeight}`,
            ease: 'linear',
            loop: -1,
            duration: 15000,
        });

        this.game.sound.setVolume(0.1); // TODO remove
        this.sound.play('bg', { loop: true });
        this.soundOnButton = this.add.image(Config.GAME_WIDTH-48, 48, "soundOn")
            .setInteractive()
            .on("pointerup", () => {
                this.sound.get('bg').pause();
                this.soundOnButton.disableInteractive().setVisible(false);
                this.soundOffButton.setInteractive().setVisible(true);
                this.shake(this.soundOffButton);
            });
        this.soundOffButton = this.add.image(Config.GAME_WIDTH-48, 48, "soundOff")
            .setInteractive()
            .disableInteractive()
            .setVisible(false)
            .on("pointerup", () => {
                this.sound.get('bg').play();
                this.soundOffButton.disableInteractive().setVisible(false);
                this.soundOnButton.setInteractive().setVisible(true);
                this.shake(this.soundOnButton);
            });

        const title = this.add.image(Config.GAME_WIDTH/2, 200, "titleImage")
            .setOrigin(0.5, 0.5);

        this.tweens.add({
            targets: title,
            scaleX: '+=0.2',
            scaleY: '+=0.2',
            ease: Phaser.Math.Easing.Quadratic.InOut,
            yoyo: true,
            loop: -1,
        });

        new Button(this, Config.GAME_WIDTH/2, 500,"Start Game")
            .onClick(() => {
                this.scene.start("Infinite Minesweeper");
                this.scene.start("Overlay");
            });
        new Button(this, Config.GAME_WIDTH/2, 600,"Continue");
        new Button(this, Config.GAME_WIDTH/2, 700,"Options");
        new Button(this, Config.GAME_WIDTH/2, 800,"Exit Game");

    }

    /**
    * Function to tween an object to make it shake in place
    *
    * @returns void
    */
    private shake(obj: Phaser.GameObjects.GameObject) {
        this.tweens.add({
            targets: obj,
            ease: Phaser.Math.Easing.Elastic.Out,
            angle: '+=10',
            yoyo: true,
            duration: 200
        });
    }
}
