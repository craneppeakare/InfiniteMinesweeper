import * as Phaser from 'phaser';
import Cell from './cell';

export default class Chunk {
    static WIDTH = 10;
    static HEIGHT = 6;  // Needs to be even because Cell coloring won't work properly

    private scene: Phaser.Scene;
    private cellData: Cell[][] = [];
    private totalMines: number;
    private minesToFlagLeft: number;
    private tilesRevealed = 0;
    private chunkId: number;

    minesLeftLabel: Phaser.GameObjects.Text;
    distancelabel: Phaser.GameObjects.Text;
    chunkDecorationRects: Phaser.GameObjects.Rectangle[] = [];
    chunkIndicatorRects: Phaser.GameObjects.Rectangle[] = []
    bombLabelImage: Phaser.GameObjects.Image;

    nextChunk: Chunk;
    prevChunk: Chunk;
    isCleared = false;

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
        const mineDensity = this.exponentialDiff(this.chunkId);
        this.totalMines = Math.floor((Chunk.HEIGHT*Chunk.WIDTH)*mineDensity);
        this.minesToFlagLeft = this.totalMines;
        
        // Create border indent on the sides
        this.chunkDecorationRects.push(this.scene.add.rectangle(xPos, yPos, 8, Cell.TILE_SIZE*Chunk.HEIGHT, 0xffffff)
            .setOrigin(1, 0));
        this.chunkDecorationRects.push(this.scene.add.rectangle(xPos+(Cell.TILE_SIZE*Chunk.WIDTH), yPos, 8, Cell.TILE_SIZE*Chunk.HEIGHT, 0x808080)
            .setOrigin(0, 0));

        // Create the text labels on the sides
        this.bombLabelImage = scene.add.image(xPos+(Cell.TILE_SIZE*Chunk.WIDTH)+10, yPos+10, 'mineImage')
            .setScale(0.25, 0.25)
            .setOrigin(0, 0);
        const style = { fontFamily: 'Silkscreen', fontSize: '20px' };
        this.minesLeftLabel = scene.add.text(xPos+(Cell.TILE_SIZE*Chunk.WIDTH)+32,
            yPos+15,
            this.minesToFlagLeft.toString(),
            {...style, stroke: '#ffffff', strokeThickness: 0})
                .setOrigin(0.5, 0.5)
                .setColor('#aa0000');
        this.distancelabel = scene.add.text(xPos-6, yPos, this.minesToFlagLeft.toString(), style)
            .setText((this.chunkId+1)*100 + "m ")
            .setAngle(270)
            .setOrigin(1, 1)
            .setColor('#aa0000');

        // Create the ruler markers
        const numberOfRulerMarkers = 8
        this.chunkDecorationRects.push(this.scene.add.rectangle(0, yPos, 20, 4, 0xaa0000)
            .setOrigin(0, 0));
        this.chunkDecorationRects.push(this.scene.add.rectangle(720, yPos, 20, 4, 0xaa0000)
            .setOrigin(1, 0));
        const dist = (Cell.TILE_SIZE*Chunk.HEIGHT)/numberOfRulerMarkers;
        for (let i = 1; i < numberOfRulerMarkers; i++) {
            const markerLength = i % 2 ? 10 : 14;
            this.chunkDecorationRects.push(
                this.scene.add.rectangle(0, yPos+(dist*i), markerLength, 2, 0xaa0000)
                    .setOrigin(0,0));
        }

        // Create all the necessary Cells
        for (let y = 0; y < Chunk.HEIGHT; y++) {
            this.cellData.push([]);
            for (let x = 0; x < Chunk.WIDTH; x++) {
                const pos = {x: xPos + (x*Cell.TILE_SIZE), y: yPos + (y*Cell.TILE_SIZE)}
                const id = {x, y, chunkId}
                const cell = new Cell(scene, pos, id, this);
                this.cellData[y].push(cell);
            }
        }

        // Create chunk outline indicator
        this.chunkIndicatorRects.push(
            this.scene.add.rectangle(xPos, yPos, Cell.TILE_SIZE*Chunk.WIDTH, 1, 0xaaaa00, 200).setOrigin(0, 0),
            this.scene.add.rectangle(xPos, yPos+(Cell.TILE_SIZE*Chunk.HEIGHT)-1, Cell.TILE_SIZE*Chunk.WIDTH, 1, 0xaaaa00, 100).setOrigin(0, 0),
        )
    }

    /**
    * Chooses tiles to become mines. Avoid placing mines around the specified coordinate.
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
        for (let i = 0; i < this.totalMines; i++) {
            // Choose random coords (mineX, mineY) to turn into a mine
            do {
                mineX = Math.floor(Math.random() * Chunk.WIDTH);
                mineY = Math.floor(Math.random() * Chunk.HEIGHT);
            } while (noMineCoords.some(c => c.x == mineX && c.y == mineY))
            this.cellData[mineY][mineX].isAMine = true;
            this.cellData[mineY][mineX].incrementMinesNearby();
            noMineCoords.push({x: mineX, y: mineY});

            // Update the tiles nearby to see this mine
            const neighbors = this.getNeighborTiles(mineX, mineY, true);
            neighbors.forEach(n => n.incrementMinesNearby());
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
        if (this.cellData[y][x].minesNearby === 0) {
            const neighbors = this.getNeighborTiles(x, y);
            neighbors.forEach(n => {
                const id = n.getId();
                n.chunk.revealTile(id.x, id.y)});
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
        if (!this.cellData[y][x].isRevealed) {
            this.cellData[y][x].flag();
            this.cellData[y][x].isFlagged
                ? this.minesToFlagLeft -= 1
                : this.minesToFlagLeft += 1;
            this.minesLeftLabel.setText(this.minesToFlagLeft.toString());
        } else {
            this.chordTile(x, y);
            this.checkIfComplete();
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
        if (this.cellData[y][x].minesNearby === 0) return;
        const neighbors = this.getNeighborTiles(x, y);
        const flagged = neighbors.filter(n => n.isFlagged);
        if (flagged.length === this.cellData[y][x].minesNearby) {
            neighbors
                .filter(n => !n.isFlagged)
                .forEach(n => n.chunk.revealTile(n.getId().x, n.getId().y));
        }
    }

    /**
    * Returns a list of the Cells surrounding the specified Cell
    *
    * @param x - The x coordinate of the center Cell
    * @param y - The y coordinate of the center Cell
    * @param includeRevealed - Will also return already revealed Cells if true
    *
    * @returns Cell[]
    */
    getNeighborTiles(x: number, y: number, includeRevealed = false) {
        let neighbors: Cell[] = [];
        for (let dy = y-1; dy <= y+1; dy++) {
            for (let dx = x-1; dx <= x+1; dx++) {
                if (dx < 0 || dx >= Chunk.WIDTH) continue;
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

                if (cell && (includeRevealed || !cell.isRevealed)) neighbors.push(cell);
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
    * Updates the bottom row of tiles by checking for nearby mines in the previous chunk
    *
    * @returns void
    */
    updateBottomRowCells() {
        this.cellData[this.cellData.length-1].forEach((cell, i) => {
            for (let di = i-1; di <= i+1; di++) {
                const otherCell = this.prevChunk.cellData[0][di];
                if (otherCell && otherCell.isAMine) {
                    cell.incrementMinesNearby();
                }
            }
        });
        this.cellData[this.cellData.length-1].forEach((cell, i) => {
            for (let di = i-1; di <= i+1; di++) {
                if (cell.isRevealed) continue;
                const otherCell = this.prevChunk.cellData[0][di];
                if (otherCell && otherCell.minesNearby === 0 && otherCell.isRevealed) {
                    const id = cell.getId();
                    this.revealTile(id.x, id.y);
                    continue;
                }
            }
        });
    }

    /**
    * Reveals all mines in the chunk.
    *
    * @returns void
    */
    revealAllMines() {
        this.cellData.forEach(row => {
            row.forEach(cell => {
                if (cell.isAMine) cell.reveal();
            })
        });
    }

    /**
    * Scrolls the entire chunk down; including all labels and markers.
    *
    * @param y - distance in units to move the Chunk by
    * @param callback - function to call after moving animation finishes
    *
    * @returns void
    */
    scrollChunkDown(dy: number, callback: Function = null) {
        const allCells = this.cellData.flat();
        allCells.forEach(cell => cell.scrollCellDown(dy));
        this.scene.tweens.add({
            targets: [this.minesLeftLabel,
                      this.distancelabel,
                      this.bombLabelImage,
                      this.chunkDecorationRects,
                      this.chunkIndicatorRects].flat(),
            y: '+=' + dy,
            ease: 'Linear',
            onComplete: () => {if (callback) callback()},
            duration: 1225,
        });
    }

    /**
    * Destroy all Phaser gameobjects and clears this chunk from memory. Also disconnects
    * the chunk allowing it to be garbage collected.
    *
    * @returns void
    */
    destroy() {
        this.minesLeftLabel.destroy();
        this.cellData.forEach(row => {
            row.forEach(cell => {
                cell.label.destroy();
                cell.destroy();
            });
        });
        if (this.prevChunk) this.prevChunk.nextChunk = null;
        if (this.nextChunk) this.nextChunk.prevChunk = null;
        this.prevChunk = null;
        this.nextChunk = null;

    }

    /**
     * Checks if the chunk has been fully cleared of mines and emits an event to the 
     * scene if it is.
     *
     * @returns void
     */
    checkIfComplete() {
        const tilesToReveal = (Chunk.WIDTH*Chunk.HEIGHT)-this.totalMines;
        if (this.tilesRevealed >= tilesToReveal) {
            this.isCleared = true;
            this.chunkIndicatorRects[0].setSize(Chunk.WIDTH*Cell.TILE_SIZE, Chunk.HEIGHT*Cell.TILE_SIZE-1);
            // TODO refactor to flagAllTiles method
            this.cellData.forEach((row) => {
                row.filter((cell) => {
                    if (cell.isAMine) {
                        if (!cell.isFlagged) {
                            const id = cell.getId();
                            this.flagTile(id.x, id.y);
                        }
                        cell.removeInteractive();
                    }
                });
            });
            this.scene.events.emit('chunk-cleared');
        }
    }

    /**
     * Modified sigmoid function that returns the difficulty rating of the chunk based on given number x.
     * The higher x is the more difficult, thus higher return value.
     *
     * @param x is a number
     *
     * @returns number from 0.1 to 0.5 representing mine density.
     */
    private exponentialDiff(x: number): number {
        x = x/60;  // 60 means it should hit max mine density after 60 chunks
        return Math.min(0.5, Math.pow(x, 2) + 0.1);
    }
}
