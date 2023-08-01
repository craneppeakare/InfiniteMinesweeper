import * as Phaser from 'phaser';
import * as Config from './config';
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
    private events: Phaser.Events.EventEmitter;
    private goldParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

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
        this.events = new Phaser.Events.EventEmitter();
        
        // Create border indent on the sides
        this.chunkDecorationRects.push(this.scene.add.rectangle(xPos, yPos, 8, Cell.TILE_SIZE*Chunk.HEIGHT, 0xffffff)
            .setOrigin(1, 0));
        this.chunkDecorationRects.push(this.scene.add.rectangle(xPos+(Cell.TILE_SIZE*Chunk.WIDTH), yPos, 8, Cell.TILE_SIZE*Chunk.HEIGHT, 0x808080)
            .setOrigin(0, 0));

        // Create the text labels on the sides
        this.bombLabelImage = scene.add.image(xPos+(Cell.TILE_SIZE*Chunk.WIDTH)+10, yPos+10, 'mineImage')
            .setScale(0.25, 0.25)
            .setOrigin(0, 0);
        this.minesLeftLabel = scene.add.text(xPos+(Cell.TILE_SIZE*Chunk.WIDTH)+32,
            yPos+15,
            this.minesToFlagLeft.toString(),
            Config.defaultStyle)
                .setOrigin(0.5, 0.5)
                .setColor('#aa0000');
        this.distancelabel = scene.add.text(xPos-6, yPos, this.minesToFlagLeft.toString(), Config.defaultStyle)
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
            this.scene.add.rectangle(xPos, yPos, Cell.TILE_SIZE*Chunk.WIDTH, 0, 0xaaaa00, 200).setOrigin(0, 0),
            this.scene.add.rectangle(xPos, yPos+(Cell.TILE_SIZE*Chunk.HEIGHT)-1, Cell.TILE_SIZE*Chunk.WIDTH, 3, 0xaaaa00).setOrigin(0, 0),
        )

        const geom = new Phaser.Geom.Rectangle(0, 0, Chunk.WIDTH*Cell.TILE_SIZE, Chunk.HEIGHT*Cell.TILE_SIZE);
        this.goldParticleEmitter = this.scene.add.particles(0, 0, 'goldParticle', {
            emitZone: new Phaser.GameObjects.Particles.Zones.RandomZone(geom),
            alpha: { start: 1, end: 0 },
            rotate: { min: 0, max: 360 },
            quantity: { min: 64, max: 96 },
            gravityY: 1300,
            scale: 0.3,
            speed: { min: 100, max: 250 },
            lifespan: 1225,
            emitting: false,
        });
        this.goldParticleEmitter.depth = 1;
        this.goldParticleEmitter.once('chunk-cleared', () => 
            this.goldParticleEmitter.emitParticleAt(this.cellData[0][0].x, this.cellData[0][0].y))
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
    * @returns number for how many points earned
    */
    revealTile(x: number, y: number): number {
        if (this.cellData[y][x].isRevealed) {
            if (this.cellData[y][x].minesNearby > 0)
                return this.chordTile(x, y);
            return 0;
        } else {
            let points = this.cellData[y][x].reveal();
            this.tilesRevealed += 1;
            if (this.cellData[y][x].minesNearby === 0) {
                const neighbors = this.getNeighborTiles(x, y);
                points += neighbors.reduce((acc: number, n: Cell) => {
                    const id = n.getId();
                    const p = n.chunk.revealTile(id.x, id.y);
                    return acc + p;
                }, 0);
            }
            return points;
        }
    }

    /**
    * Flags the mine located at the specified coordinates
    *
    * @param x - The x coordinate of the Cell to be flagged
    * @param y - The y coordinate of the Cell to be flagged
    *
    * @returns number for how many points earned
    */
    flagTile(x: number, y: number): number {
        if (!this.cellData[y][x].isRevealed) {
            this.cellData[y][x].flag();
            this.cellData[y][x].isFlagged
                ? this.minesToFlagLeft -= 1
                : this.minesToFlagLeft += 1;
            this.minesLeftLabel.setText(this.minesToFlagLeft.toString());
            return 0;
        } else {
            const points = this.chordTile(x, y);
            this.checkIfComplete();
            return points;
        }
    }

    /**
    * Reveals the mine located at the specified coordinates and all the unflagged
    * tiles around it
    *
    * @param x - The x coordinate of the center Cell to be revealed
    * @param y - The y coordinate of the center Cell to be revealed
    *
    * @returns number for how many points earned
    */
    chordTile(x: number, y: number): number {
        if (this.cellData[y][x].minesNearby === 0) return;
        const neighbors = this.getNeighborTiles(x, y);
        const flagged = neighbors.filter(n => n.isFlagged);
        if (flagged.length === this.cellData[y][x].minesNearby) {
            return neighbors.reduce((acc: number, cell: Cell) => {
                return !cell.isFlagged
                    ? acc + cell.chunk.revealTile(cell.getId().x, cell.getId().y)
                    : acc
            }, 0);
        }
        return 0;
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
        this.distancelabel.destroy()
        this.chunkDecorationRects.forEach(rect => rect.destroy());
        this.chunkIndicatorRects.forEach(rect => rect.destroy());
        this.bombLabelImage.destroy()
        this.cellData.forEach(row => {
            row.forEach(cell => {
                cell.destroyAll();
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
            this.chunkIndicatorRects[0].setSize(Chunk.WIDTH*Cell.TILE_SIZE, Chunk.HEIGHT*Cell.TILE_SIZE);
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
            this.goldParticleEmitter.emit('chunk-cleared');
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
        return Math.min(x/3 + 6, 30)/(Chunk.WIDTH*Chunk.HEIGHT);
        // x = x/60;  // 60 means it should hit max mine density after 60 chunks
        // return Math.min(0.5, Math.pow(x, 2) + 0.1);
    }
}
