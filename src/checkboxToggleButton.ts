import * as Phaser from 'phaser';
import * as Config from './config';
import { defaultStyle } from './config';

export default class CheckBoxToggleButton {

    private scene: Phaser.Scene;
    private buttonText: Phaser.GameObjects.Text;
    private checkedBox: Phaser.GameObjects.Image;
    private uncheckedBox: Phaser.GameObjects.Image;
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
    constructor(scene: Phaser.Scene, x: number, y: number, text: string, style=defaultStyle) {
        this.scene = scene;

        this.checkedBox = scene.add.image(x, y, "checkedbox")
            .setOrigin(0, 0)
            .setSize(64, 64)
            .setScale(2.0)
            .setInteractive()
            .on("pointerup", () => {
                this.checkedBox.disableInteractive().setVisible(false);
                this.uncheckedBox.setInteractive().setVisible(true);
                this.shake(this.uncheckedBox);
                this.offToggle();
            });
        this.uncheckedBox = scene.add.image(x, y, "uncheckedbox")
            .setOrigin(0, 0)
            .setSize(64, 64)
            .setScale(2.0)
            .setInteractive()
            .disableInteractive()
            .setVisible(false)
            .on("pointerup", () => {
                this.uncheckedBox.disableInteractive().setVisible(false);
                this.checkedBox.setInteractive().setVisible(true);
                this.shake(this.checkedBox);
                this.onToggle();
            });

        const width = this.checkedBox.width;
        this.buttonText = scene.add.text(x + width + 15, y, text, style)
            .setOrigin(0, 0);
    }

    /**
    * Function to set the offToggle function
    *
    * @returns this
    */
    setOffToggle(fn: Function): CheckBoxToggleButton {
        this.offToggle = fn;
        return this;
    }

    /**
    * Function to set the onToggle function
    *
    * @returns this
    */
    setOnToggle(fn: Function): CheckBoxToggleButton {
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
