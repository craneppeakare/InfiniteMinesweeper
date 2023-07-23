import * as Phaser from 'phaser';
import Cell from './cell';

export default class Chunk {
    static WIDTH = 10;
    static HEIGHT = 6;
    static minesPerChunk = 5;

    private scene: Phaser.Scene;
    private cellData: Cell[][] = [];
    private minesToFlagLeft = Chunk.minesPerChunk;
    private tilesRevealed = 0;
    private chunkId: number;

    nextChunk: Chunk;
    prevChunk: Chunk;
    minesLeftLabel: Phaser.GameObjects.Text;

    /**
    * Constructor for a Chunk
    *
    * @param scene - The scene which this Chunk belongs to
    * @param xPos - x position of the Chunk on the scene
    * @param yPos - y position of the Chunk on the scene
    *
    * @returns a Chunk
    */
    constructor(scene: Phaser.Scene, xPos: number, yPos: number, chunkId: number) {
        this.scene = scene;
        this.chunkId = chunkId;
        const style = { fontFamily: 'Silkscreen', fontSize: '24px' };
        this.minesLeftLabel = scene.add.text(xPos+(Cell.TILE_SIZE*Chunk.WIDTH), yPos, this.minesToFlagLeft.toString(), style)
            .setOrigin(0, 0)
            .setColor('#aa0000');
        for (let y = 0; y < Chunk.HEIGHT; y++) {
            this.cellData.push([]);
            for (let x = 0; x < Chunk.WIDTH; x++) {
                const pos = {x: xPos + (x*Cell.TILE_SIZE), y: yPos + (y*Cell.TILE_SIZE)}
                const id = {x, y, chunkId}
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
        let mineX: number, mineY: number;
        let noMineCoords = [];
        for (let dy = y-1; dy <= y+1; dy++){
            for (let dx = x-1; dx <= x+1; dx++) {
                noMineCoords.push({x: dx, y: dy});
            }
        }
        for (let i = 0; i < Chunk.minesPerChunk; i++) {
            // Choose random coords (mineX, mineY) to turn into a mine
            do {
                mineX = Math.floor(Math.random() * Chunk.WIDTH);
                mineY = Math.floor(Math.random() * Chunk.HEIGHT);
            } while (noMineCoords.some(c => c.x == mineX && c.y == mineY))
            this.cellData[mineY][mineX].isAMine = true;
            noMineCoords.push({x: mineX, y: mineY});

            // Update the tiles nearby to see this mine
            const neighbors = this.getUnrevealedNeighborTiles(mineX, mineY);
            neighbors.forEach(n => n.minesNearby += 1);
        }
    }

    /**
    * Reveals the mine located at the specified coordinates. And may recurse to nearby
    * mines if needed.
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
            this.tilesRevealed += 1;
        }
        if (!this.cellData[y][x].minesNearby) {
            const neighbors = this.getUnrevealedNeighborTiles(x, y);
            neighbors.forEach(n => {
                const id = n.getId();
                n.chunk.revealTile(id.x, id.y)});
        }
        this.checkIfComplete();
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
        if (!this.cellData[y][x].isRevealed) {
            this.cellData[y][x].flag();
            this.cellData[y][x].isFlagged
                ? this.minesToFlagLeft -= 1
                : this.minesToFlagLeft += 1;
            this.minesLeftLabel.setText(this.minesToFlagLeft.toString());
        }
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
        const flagged = neighbors.filter(n => n.isFlagged);
        if (flagged.length === this.cellData[y][x].minesNearby) {
            neighbors
                .filter(n => !n.isFlagged)
                .forEach(n => n.chunk.revealTile(n.getId().x, n.getId().y));
        }
        this.checkIfComplete();
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
                if (dx < 0 || dx >= Chunk.WIDTH ) continue;
                let cell: Cell;
                if (dy < 0) {
                    if (!this.nextChunk) continue;
                    cell = this.nextChunk.cellData[Chunk.HEIGHT-1][dx];
                } else if (dy >= Chunk.HEIGHT) {
                    if (!this.prevChunk) continue;
                    cell = this.prevChunk.cellData[0][dx]
                } else {
                    cell = this.cellData[dy][dx];
                }

                if (cell && !cell.isRevealed) neighbors.push(cell);
            }
        }
        return neighbors;
    }

    /**
    * Returns a list of all associated Cells in the chunk.
    *
    * @returns Cell[]
    */
    getAllCells() {
        return this.cellData.flat();
    }

    /**
     * Checks if the chunk has been fully cleared of mines and emits an event to the 
     * scene if it is.
     *
     * @returns void
     */
    private checkIfComplete() {
        const tilesToReveal = (Chunk.WIDTH*Chunk.HEIGHT)-Chunk.minesPerChunk;
        if (this.tilesRevealed >= tilesToReveal) {
            this.scene.events.emit('chunk-cleared', this.chunkId);
        }
    }
}
