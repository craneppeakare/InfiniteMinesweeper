import * as Phaser from 'phaser';
import { defaultStyle } from './config';

export default class SoundToggleButton {

    private scene: Phaser.Scene;
    private buttonText: Phaser.GameObjects.Text;
    private OnToggleButton: Phaser.GameObjects.Image;
    private OffToggleButton: Phaser.GameObjects.Image;
    private onToggle: Function;
    private offToggle: Function;

    /**
    * Constructor for a button
    * 
    * @param scene - The scene which this Cell belongs to
    * @param x - The x position of the Button on the screen
    * @param y - The y position of the Button on the screen
    * @param text - The text that is displayed on the button
    *
    * @returns a Cell
    */
    constructor(scene: Phaser.Scene, x: number, y: number, text: string, startValue=true, style=defaultStyle) {
        this.scene = scene;

        this.OnToggleButton = scene.add.image(x, y, "soundOn")
            .setOrigin(0, 0)
            .setSize(64, 64)
            .setScale(0.6)
            .on("pointerup", () => {
                this.OnToggleButton.disableInteractive().setVisible(false);
                this.OffToggleButton.setInteractive().setVisible(true);
                this.shake(this.OffToggleButton);
                this.offToggle();
            });
        this.OffToggleButton = scene.add.image(x, y, "soundOff")
            .setOrigin(0, 0)
            .setSize(64, 64)
            .setScale(0.6)
            .on("pointerup", () => {
                this.OffToggleButton.disableInteractive().setVisible(false);
                this.OnToggleButton.setInteractive().setVisible(true);
                this.shake(this.OnToggleButton);
                this.onToggle();
            });

        if (startValue) {
            this.OnToggleButton.setInteractive();
            this.OffToggleButton.disableInteractive();
            this.OffToggleButton.setVisible(false);
        } else {
            this.OnToggleButton.disableInteractive();
            this.OnToggleButton.setVisible(false);
            this.OffToggleButton.setInteractive();
        }

        const width = this.OnToggleButton.width
        this.buttonText = scene.add.text(x + width + 15, y, text, style)
            .setOrigin(0, 0);
    }

    /**
    * Function to set the offToggle function
    *
    * @returns this
    */
    setOffToggle(fn: Function): SoundToggleButton {
        this.offToggle = fn;
        return this;
    }

    /**
    * Function to set the onToggle function
    *
    * @returns this
    */
    setOnToggle(fn: Function): SoundToggleButton {
        this.onToggle = fn;
        return this;
    }


    /**
    * Function to tween an object to make it shake in place
    *
    * @returns void
    */
    private shake(obj: Phaser.GameObjects.GameObject) {
        this.scene.tweens.add({
            targets: obj,
            ease: Phaser.Math.Easing.Elastic.Out,
            angle: '+=10',
            yoyo: true,
            duration: 200
        });
    }
}
