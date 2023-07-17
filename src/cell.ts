import * as Phaser from 'phaser';
import Chunk from './chunk';

export default class Cell extends Phaser.GameObjects.Rectangle {
    static TILE_SIZE = 64;
    private static COVER_EVEN_COLOR = 0x37aa56;
    private static COVER_ODD_COLOR = 0x268d41;
    private static REVEALED_EVEN_COLOR = 0xcfbb93;
    private static REVEALED_ODD_COLOR = 0xba9872;

    private id: {x: number, y: number};
    private chunk: Chunk;
    private labelStyle = { fontFamily: 'Silkscreen', fontSize: '28px' };

    isAMine = false;
    isRevealed = false;
    isFlagged = false;
    minesNearby = 0;

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
    constructor(scene: Phaser.Scene, pos: { x: number, y: number }, id: { x: number, y: number}, chunk: Chunk) {
        super(scene, pos.x, pos.y, 64, 64, (id.x+id.y)%2 ? Cell.COVER_EVEN_COLOR : Cell.COVER_ODD_COLOR);
        this.setOrigin(0, 0)
            .setInteractive()
            .on('pointerup', this.on_pointerup);

        this.id = id;
        this.chunk = chunk;
        scene.add.existing(this);
    }

    /**
    * Reveals the tile
    *
    * @returns void
    */
    reveal() {
        if (this.isFlagged) return;
        this.isRevealed = true;
        if (this.isAMine) {
            this.fillColor = 0xff0000;
        } else {
            this.fillColor = (this.id.x+this.id.y)%2 ? Cell.REVEALED_EVEN_COLOR : Cell.REVEALED_ODD_COLOR;
            let neighbors = this.chunk.getUnrevealedNeighborTiles(this.id.x, this.id.y);
            this.minesNearby = neighbors.filter((n) => n.isAMine).length
            if (this.minesNearby) {
                let pos = this.getCenter();
                const label = this.scene.add.text(pos.x, pos.y, this.minesNearby.toString(), this.labelStyle)
                    .setOrigin(0.5,0.5);
                switch (this.minesNearby) {
                    case 1: label.setColor('#0000ff'); break;
                    case 2: label.setColor('#008000'); break;
                    case 3: label.setColor('#ff0000'); break;
                    case 4: label.setColor('#000080'); break;
                    case 5: label.setColor('#800000'); break;
                    case 6: label.setColor('#008080'); break;
                    case 7: label.setColor('#808080'); break;
                    default: break;
                }
            } else {
                neighbors.forEach((n) => {n.reveal()});
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
            this.fillColor = (this.id.x+this.id.y)%2 ? Cell.COVER_EVEN_COLOR : Cell.COVER_ODD_COLOR;
        }
    }

    /**
    * Emits an event to communicate to the top level scene that this cell has been clicked on
    *
    * @returns void
    */
    private on_pointerup() {
        this.scene.events.emit('tile-pressed', {x: this.id.x, y: this.id.y});
    }

}
