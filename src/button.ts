import * as Phaser from 'phaser';
import { defaultStyle } from './config';

export default class Button {

    private button: Phaser.GameObjects.Rectangle;
    private gameObjects: Phaser.GameObjects.Polygon[] = [];
    private buttonText: Phaser.GameObjects.Text;
    private onClickFn: Function;

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
        this.buttonText = scene.add.text(x, y, text, style)
            .setOrigin(0.5, 0.5);
        const width = this.buttonText.width + 64;
        const height = this.buttonText.height + 32;
        this.button = scene.add.rectangle(x, y, width, height, 0xc0c0c0);
        this.button.setInteractive()
            .on('pointerdown', () => this.button.fillColor = 0xa0a0a0)
            .on('pointerout', () => this.button.fillColor = 0xc0c0c0)
            .on('pointerup', () => {
                this.button.fillColor = 0xc0c0c0;
                if (this.onClickFn) this.onClickFn();
            });

        const centerCords = this.button.getCenter();
        this.gameObjects.push(
            scene.add.polygon(centerCords.x, centerCords.y,
                [[0, 0], [width, 0], [width-8, 8], [8, 8], [8, height-8], [0, height]],
                0xffffff),
        );
        this.gameObjects.push(
            scene.add.polygon(centerCords.x, centerCords.y,
                [[0, height], [8, height-8], [width-8, height-8], [width-8, 8], [width, 0], [width, height]],
                0x808080),
        );
        this.buttonText.setDepth(1);
    }

    /**
     * Sets the function to run when the button is clicked
     *
     * @returns void
     */
    onClick(fn: () => void) {
        this.onClickFn = fn;
    }
}
