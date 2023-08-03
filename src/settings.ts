import * as Phaser from 'phaser';
import * as Config from './config';
import Button from './button';
import SoundToggleButton from './soundToggleButton';
import CheckBoxToggleButton from './checkboxToggleButton';

export default class SettingScene extends Phaser.Scene {

    /**
    * Constructor for the main Scene
    *
    * @returns a Scene
    */
    constructor () {
        super('Settings');
    }

    /**
    * Preloads any assets needed for the scene. Runs before the create() method.
    *
    * @returns void
    */
    preload () {
        this.load.image('soundOn', 'assets/icons/speaker.png');
        this.load.image('soundOff', 'assets/icons/speakerCrossed.png');

        this.load.image('checkedbox', 'assets/icons/checkedbox.png');
        this.load.image('uncheckedbox', 'assets/icons/uncheckedbox.png');
    }

    /**
    * Runs once when scene is created. Spawns the necessary chunks for the game.
    *
    * @returns void
    */
    create () {
        this.add.text(Config.GAME_WIDTH/2, 100, "Settings", Config.largeStyle)
            .setOrigin(0.5, 0.5);

        const bgmSetting = new SoundToggleButton(this, 64, 200,"Toggle BGM", Config.GameSettings.playBGM)
            .setOnToggle(() => {
                Config.GameSettings.playBGM = true;
                this.sound.stopByKey('bg');
                this.sound.play('bg', { loop: true });
            })
            .setOffToggle(() => {
                Config.GameSettings.playBGM = false;
                this.sound.stopByKey('bg');
            });

        const sfxSetting = new SoundToggleButton(this, 64, 300, "Toggle SFX", Config.GameSettings.soundEffectsOn)
            .setOnToggle(() => {
                Config.GameSettings.soundEffectsOn = true;
            })
            .setOffToggle(() => {
                Config.GameSettings.soundEffectsOn = false;
            });

        const toggleScreenShake = new CheckBoxToggleButton(this, 64, 400, "Enable Screen Shake", Config.GameSettings.screenShake)
            .setOnToggle(() => {
                Config.GameSettings.screenShake = true;
            })
            .setOffToggle(() => {
                Config.GameSettings.screenShake = false;
            });

        const backToMenuButton = new Button(this, Config.GAME_WIDTH/2, 900, "Back To Menu");
        backToMenuButton.onClick(() => {
            this.game.scene.stop("SettingScene");
            this.scene.start("MainMenu");
        });
    }
}
