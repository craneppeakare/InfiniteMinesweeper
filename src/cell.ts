import * as Phaser from 'phaser';
import Chunk from './chunk';

export default class Cell extends Phaser.GameObjects.Rectangle {
    static TILE_SIZE = 64;
    private static COVER_EVEN_COLOR = 0x37aa56;
    private static COVER_ODD_COLOR = 0x268d41;
    private static REVEALED_EVEN_COLOR = 0xcfbb93;
    private static REVEALED_ODD_COLOR = 0xba9872;
    private static LABEL_COLORS = ['#0000ff',
                                  '#008000',
                                  '#ff0000',
                                  '#000080',
                                  '#800000',
                                  '#008080',
                                  '#808080'];

    private id: {x: number, y: number, chunkId: number};
    private chunk: Chunk;
    private labelStyle = { fontFamily: 'Silkscreen', fontSize: '28px' };

    isAMine = false;
    isRevealed = false;
    isFlagged = false;
    minesNearby = 0;
    label;

    /**
    * Constructor for a Cell
    * 
    * @param scene - The scene which this Cell belongs to
    * @param pos - The position of the Cell on the screen
    * @param id - The id of the Cell
    * @param chunk - The chunk which this cell belongs to
    *
    * @returns a Cell
    */
    constructor(scene: Phaser.Scene, pos: { x: number, y: number }, id: { x: number, y: number, chunkId: number}, chunk: Chunk) {
        super(scene, pos.x, pos.y, 64, 64, 0xffffff);
        this.setOrigin(0, 0)
            .setInteractive()
            .on('pointerup', this.on_pointerup);

        this.id = id;
        this.chunk = chunk;
        scene.add.existing(this);
        this.label = this.scene.add.text(this.getCenter().x, this.getCenter().y, '', this.labelStyle)
            .setOrigin(0.5, 0.5);
        this.updateColor();
    }

    /**
    * Reveals the tile
    *
    * @returns void
    */
    reveal() {
        if (this.isFlagged || this.isRevealed) return;
        this.isRevealed = true;
        if (this.isAMine) {
            this.fillColor = 0xff0000;
            this.scene.events.emit('gameover');
        } else {
            this.updateColor();
            if (this.minesNearby) {
                this.label.setText(this.minesNearby.toString());
                this.label.setColor(Cell.LABEL_COLORS[this.minesNearby - 1])
            }
        }
    }

    /**
    * Places a flag on top of the tile and prevents revealing
    *
    * @returns void
    */
    flag() {
        this.isFlagged = !this.isFlagged;
        if (this.isFlagged) {
            this.fillColor = 0xff00ff;
        } else {
            this.updateColor();
        }
    }

    /**
    * @returns the id of this Cell
    */
    getId(): {x: number, y: number, chunkId: number} {
        return Object.create(this.id);
    }

    /**
    * Emits an event to communicate to the top level scene that this cell has been clicked on
    *
    * @returns void
    */
    private on_pointerup() {
        this.scene.events.emit('tile-pressed', this.id);
    }

    /**
     * Updates the color that the tile should be in depending on if it's revealed or not.
     *
     * @returns void
     */
    private updateColor() {
        if (this.isRevealed) {
            this.fillColor = (this.id.x+this.id.y)%2 ? Cell.REVEALED_EVEN_COLOR : Cell.REVEALED_ODD_COLOR;
        } else {
            this.fillColor = (this.id.x+this.id.y)%2 ? Cell.COVER_EVEN_COLOR : Cell.COVER_ODD_COLOR;
        }
    }
}
