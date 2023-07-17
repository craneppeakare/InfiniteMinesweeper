import * as Phaser from 'phaser';
import Cell from './cell';

export default class Chunk {
    static WIDTH = 10;
    static HEIGHT = 10;
    static minesPerChunk = 20;

    private cellData: Cell[][] = [];

    /**
    * Constructor for a Chunk
    *
    * @param scene - The scene which this Chunk belongs to
    * @param xPos - x position of the Chunk on the scene
    * @param yPos - y position of the Chunk on the scene
    *
    * @returns a Chunk
    */
    constructor(scene: Phaser.Scene, xPos: number, yPos: number) {
        for (let y = 0; y < Chunk.WIDTH; y++) {
            this.cellData.push([]);
            for (let x = 0; x < Chunk.HEIGHT; x++) {
                const pos = {x: xPos + (x*Cell.TILE_SIZE), y: yPos + (y*Cell.TILE_SIZE)}
                const id = {x, y}
                const cell = new Cell(scene, pos, id, this);
                this.cellData[y].push(cell);
            }
        }
    }

    /**
    * Chooses this.minesPerChunk number of tiles to become mines
    *
    * @param x - The x coordinate of the Cell not to turn into a mine
    * @param y - The y coordinate of the Cell not to turn into a mine
    *
    * @returns void
    */
    spawnMines(x: number, y: number) {
        let mineX, mineY;
        for (let i = 0; i < Chunk.minesPerChunk; i++) {
            do {
                mineX = Math.floor(Math.random() * Chunk.WIDTH);
                mineY = Math.floor(Math.random() * Chunk.HEIGHT);
            } while (this.cellData[mineY][mineX].isAMine || (mineX === x && mineY === y))
            this.cellData[mineY][mineX].isAMine = true;
        }
    }

    /**
    * Reveals the mine located at the specified coordinates
    *
    * @param x - The x coordinate of the Cell to be revealed
    * @param y - The y coordinate of the Cell to be revealed
    *
    * @returns void
    */
    revealTile(x: number, y: number) {
        if (this.cellData[y][x].isRevealed) {
            this.chordTile(x, y);
        } else {
            this.cellData[y][x].reveal();
        }
    }

    /**
    * Flags the mine located at the specified coordinates
    *
    * @param x - The x coordinate of the Cell to be flagged
    * @param y - The y coordinate of the Cell to be flagged
    *
    * @returns void
    */
    flagTile(x: number, y: number) {
        this.cellData[y][x].flag();
    }

    /**
    * Reveals the mine located at the specified coordinates and all the unflagged
    * tiles around it
    *
    * @param x - The x coordinate of the center Cell to be revealed
    * @param y - The y coordinate of the center Cell to be revealed
    *
    * @returns void
    */
    chordTile(x: number, y: number) {
        const neighbors = this.getUnrevealedNeighborTiles(x, y);
        let hazards = neighbors.filter((n) => { n.isFlagged }).length;
        console.log("hazards = " + hazards + "; minesNearby: " + this.cellData[y][x].minesNearby);
        if (hazards === this.cellData[y][x].minesNearby) {
            const n = this.getUnrevealedNeighborTiles(x, y).filter((n) => { !n.isFlagged });
            n.forEach((n) => { n.reveal() });
        }
    }

    /**
    * Returns a list of the Cells surrounding the specified Cell
    *
    * @param x - The x coordinate of the center Cell
    * @param y - The y coordinate of the center Cell
    *
    * @returns Cell[]
    */
    getUnrevealedNeighborTiles(x: number, y: number) {
        let neighbors: Cell[] = [];
        for (let dy = y-1; dy <= y+1; dy++) {
            for (let dx = x-1; dx <= x+1; dx++) {
                if (dx >= 0 && dx < Chunk.WIDTH && dy >= 0 && dy < Chunk.HEIGHT)
                    if (!this.cellData[dy][dx].isRevealed)
                        neighbors.push(this.cellData[dy][dx]);
            }
        }
        return neighbors;
    }
}
