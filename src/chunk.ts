import * as Phaser from 'phaser';
import Cell from './cell';

export default class Chunk {
    static WIDTH = 10;
    static HEIGHT = 10;
    static minesPerChunk = 20;

    private cellData: Cell[][] = [];

    constructor(scene: Phaser.Scene, xPos: number, yPos: number) {
        for (let y = 0; y < Chunk.WIDTH; y++) {
            this.cellData.push([]);
            for (let x = 0; x < Chunk.HEIGHT; x++) {
                let dx = xPos + (x*Cell.TILE_SIZE);
                let dy = yPos + (y*Cell.TILE_SIZE);
                const cell = new Cell(scene, dx, dy, x, y, this);
                this.cellData[y].push(cell);
            }
        }
    }

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

    revealTile(x: number, y: number) {
        if (this.cellData[y][x].isRevealed) {
            this.chordTile(x, y);
        } else {
            this.cellData[y][x].reveal();
        }
    }

    flagTile(x: number, y: number) {
        this.cellData[y][x].flag();
    }

    chordTile(x: number, y: number) {
        const neighbors = this.getNeighborTiles(x, y);
        let hazards = neighbors.filter((n) => { n.isFlagged }).length;
        console.log("hazards = " + hazards + "; minesNearby: " + this.cellData[y][x].minesNearby);
        if (hazards === this.cellData[y][x].minesNearby) {
            const n = this.getNeighborTiles(x, y).filter((n) => { !n.isFlagged });
            n.forEach((n) => { n.reveal() });
        }
    }

    getNeighborTiles(x: number, y: number) {
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
