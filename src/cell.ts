import * as Phaser from 'phaser';
import Chunk from './chunk';

export default class Cell extends Phaser.GameObjects.Rectangle {
    static TILE_SIZE = 64;
    private static COVER_EVEN_COLOR = 0x37aa56;
    private static COVER_ODD_COLOR = 0x268d41;
    private static REVEALED_EVEN_COLOR = 0xcfbb93;
    private static REVEALED_ODD_COLOR = 0xba9872;

    private xId;
    private yId;
    private chunk: Chunk;
    private labelStyle = { fontFamily: 'Silkscreen', fontSize: '28px' };

    isAMine = false;
    isRevealed = false;
    isFlagged = false;
    minesNearby = 0;

    constructor(scene: Phaser.Scene, xPos: number, yPos: number, xId: number, yId: number, chunk: Chunk) {
        super(scene, xPos, yPos, 64, 64, (xId+yId)%2 ? Cell.COVER_EVEN_COLOR : Cell.COVER_ODD_COLOR);
        this.setOrigin(0, 0)
            .setInteractive()
            .on('pointerup', this.on_pointerup);

        this.xId = xId;
        this.yId = yId;
        this.chunk = chunk;
        scene.add.existing(this);
    }

    private on_pointerup() {
        this.scene.events.emit('tile-pressed', {x: this.xId, y: this.yId});
    }

    reveal() {
        if (this.isFlagged) return;
        this.isRevealed = true;
        if (this.isAMine) {
            this.fillColor = 0xff0000;
        } else {
            this.fillColor = (this.xId+this.yId)%2 ? Cell.REVEALED_EVEN_COLOR : Cell.REVEALED_ODD_COLOR;
            let neighbors = this.chunk.getNeighborTiles(this.xId, this.yId);
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

    chord() {
        // 
    }

    flag() {
        this.isFlagged = !this.isFlagged;
        if (this.isFlagged) {
            this.fillColor = 0xff00ff;
        } else {
            this.fillColor = (this.xId+this.yId)%2 ? Cell.COVER_EVEN_COLOR : Cell.COVER_ODD_COLOR;
        }
    }

}
