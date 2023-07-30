import * as Phaser from 'phaser';
import * as Config from './config';
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
    private static TILE_POINTS = [0,
                                 10,
                                 80,
                                 270,
                                 640,
                                 1250,
                                 2160,
                                 3430,
                                 5120]

    private id: {x: number, y: number, chunkId: number};
    private labelStyle = { fontFamily: 'Silkscreen', fontSize: '28px', stroke: '#000000', strokeThickness: 0 };
    private flagImage: Phaser.GameObjects.Image;
    private mineImage: Phaser.GameObjects.Image;
    private clickHighlight: Phaser.GameObjects.Rectangle;
    private bevelPolygons: Phaser.GameObjects.Polygon[];

    chunk: Chunk;
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
        this.label = this.scene.add.text(this.getCenter().x, this.getCenter().y, '', Config.defaultStyle)
            .setFontSize(28)
            .setOrigin(0.5, 0.5);
        this.clickHighlight = this.scene.add.rectangle(pos.x, pos.y, 64, 64, 0xffffff, 150)
            .setOrigin(0, 0)
            .setVisible(false);
        this.flagImage = this.scene.add.image(this.getCenter().x, this.getCenter().y, 'flagImage')
            .setVisible(false);
        this.updateColor();

        this.on('pointerdown', () => {
            this.clickHighlight.setVisible(true);
            if (this.isRevealed && this.minesNearby) {
                chunk.getNeighborTiles(id.x, id.y).forEach(cell => {
                    cell.clickHighlight.setVisible(true);
                });
            }
        });
        const disableHighlight = () => {
            this.clickHighlight.setVisible(false);
            if (this.isRevealed && this.minesNearby) {
                chunk.getNeighborTiles(id.x, id.y).forEach(cell => {
                    cell.clickHighlight.setVisible(false);
                });
            }
        }
        this.on('pointerout', disableHighlight);
        this.on('pointerup', disableHighlight);
    }

    /**
    * Reveals the tile
    *
    * @returns number for amount of points
    */
    reveal(): number {
        if (this.isFlagged || this.isRevealed) return 0;
        this.isRevealed = true;
        this.clickHighlight.setVisible(false);
        this.updateColor();
        if (this.isAMine) {
            this.mineImage = this.scene.add.image(this.getCenter().x, this.getCenter().y, 'mineImage');
            this.scene.events.emit('gameover');
            return 0;
        } else {
            if (this.minesNearby) {
                this.label.setText(this.minesNearby.toString());
                this.label.setColor(Cell.LABEL_COLORS[this.minesNearby - 1]);
            }
            return Cell.TILE_POINTS[this.minesNearby];
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
            this.flagImage.setVisible(true);
        } else {
            this.flagImage.setVisible(false);
        }
    }

    /**
    * @returns the id of this Cell
    */
    getId(): {x: number, y: number, chunkId: number} {
        return Object.create(this.id);
    }


    /**
    * Increments this.minesNearby and updates the label
    *
    * @returns void
    */
    incrementMinesNearby() {
        this.minesNearby += 1;
        if (this.isRevealed) {
            this.label.setText(this.minesNearby.toString());
            this.label.setColor(Cell.LABEL_COLORS[this.minesNearby - 1]);
        }
    }

    /**
    * Scrolls the cell down the screen
    *
    * @param by - distance in units to move the Cell by
    *
    * @returns void
    */
    scrollCellDown(dy: number) {
        this.scene.tweens.add({
            targets: [this, this.label, this.flagImage, this.bevelPolygons, this.clickHighlight].flat(),
            y: '+=' + dy,
            ease: 'Linear',
            onStart: () => this.disableInteractive(),
            onComplete: () => this.setInteractive(),
            duration: 1225,
        });
    }

    /**
    * Destroy all game elements of the Cell allowing it to be garbage collected
    *
    * @returns void
    */
    destroyAll() {
        this.flagImage.destroy();
        if (this.mineImage) this.mineImage.destroy();
        this.clickHighlight.destroy();
        this.bevelPolygons.forEach(p => p.destroy());
        this.label.destroy();
        this.destroy();
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
        const isEvenCell = (this.id.x+this.id.y) % 2;
        if (this.isRevealed) {
            this.bevelPolygons.forEach(p => p.destroy());
            this.bevelPolygons = [];
            if (this.isAMine)
                this.fillColor = isEvenCell ? 0xaa0000 : 0x880000;
            else
                this.fillColor = isEvenCell ? Cell.REVEALED_EVEN_COLOR : Cell.REVEALED_ODD_COLOR;
        } else {
            this.fillColor = isEvenCell ? Cell.COVER_EVEN_COLOR : Cell.COVER_ODD_COLOR;
            const x = this.getTopLeft().x;
            const y = this.getTopLeft().y;
            isEvenCell
                ? this.bevelPolygons = [
                    this.scene.add.polygon(x, y, "0 0 64 0 60 4 4 4 4 60 0 64", 0x4ec16d).setOrigin(0, 0),
                    this.scene.add.polygon(x, y, "0 64 4 60 60 60 60 4 64 0 64 64", 0x3a814d).setOrigin(0, 0),
                    ]
                : this.bevelPolygons = [
                    this.scene.add.polygon(x, y, "0 0 64 0 60 4 4 4 4 60 0 64", 0x41b65b).setOrigin(0, 0),
                    this.scene.add.polygon(x, y, "0 64 4 60 60 60 60 4 64 0 64 64", 0x2a7a3f).setOrigin(0, 0),
                    ];
        }
    }
}
