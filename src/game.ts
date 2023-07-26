import * as Phaser from 'phaser';
import Cell from './cell';
import Chunk from './chunk';
import * as Config from './config';

export default class InfiniteSweeper extends Phaser.Scene {
    private NUMBER_OF_CHUNKS = 3;

    private firstClear = true;
    private chunksCleared = 0;
    private score = 0;

    flagMode = false;
    chunkList: Chunk[] = [];

    firstClick = true;

    /**
    * Constructor for the main Scene
    *
    * @returns a Scene
    */
    constructor () {
        super('Infinite Minesweeper');
    }

    /**
    * Preloads any assets needed for the scene. Runs before the create() method.
    *
    * @returns void
    */
    preload () {
        // this.load.image('revealparticle', 'assets/revealParticle.png');
    }

    /**
    * Runs once when scene is created. Spawns the necessary chunks for the game.
    *
    * @returns void
    */
    create () {
        const centerOffset = (Config.GAME_WIDTH/2) - (Cell.TILE_SIZE * Chunk.WIDTH / 2)

        for (let i = 0; i < this.NUMBER_OF_CHUNKS; i++) {
            // 32 + 384
            const chunk = new Chunk(this, centerOffset, 416-(i*Cell.TILE_SIZE*Chunk.HEIGHT)+64, i);
            this.chunkList.push(chunk);
            if (i != 0) {
                chunk.prevChunk = this.chunkList[i-1];
                this.chunkList[i-1].nextChunk = chunk;
            }
        }

        this.events.addListener('tile-pressed', (coords: {x: number, y: number, chunkId: number}) => this.onTilePressed(coords));
        this.events.addListener('chunk-cleared', () => this.chunkCleared());
        this.events.addListener('gameover', () => this.onGameover());
        this.game.events.addListener('mode-switch', () => this.flagMode = !this.flagMode);
        this.game.events.addListener('add-score', (score: number) => this.score += score);
    }

    /**
    * This method is called once per game step while the scene is running.
    *
    * @returns void
    */
    update(time: number, delta: number) {
        // sdk
    }

    /**
    * Receiver for the "tile-pressed" event. Sends the event to the corresponding chunk
    *
    * @returns void
    */
    private onTilePressed(coords: {x: number, y: number, chunkId: number}) {
        const chunkIndex = coords.chunkId - this.chunksCleared;
        if (!this.flagMode) {
            if (this.firstClick) {
                this.chunkList.forEach((chunk, i) => {
                    i === coords.chunkId - this.chunksCleared
                        ? chunk.spawnMines(coords.x, coords.y)
                        : chunk.spawnMines(-2, -2);
                })
                this.firstClick = false;
            }
            this.chunkList[chunkIndex].revealTile(coords.x, coords.y);
            this.chunkList[chunkIndex].checkIfComplete();
        } else {
            this.chunkList[chunkIndex].flagTile(coords.x, coords.y);
        }
    }

    /**
    * Receiver for the "chunk-cleared" event. Shifts all chunks down
    *
    * @returns void
    */
    private chunkCleared() {
        if (this.firstClear ? this.chunkList[0].isCleared : this.chunkList[1].isCleared) {
            if (!this.firstClear) {
                // Spawn in a new chunk
                const centerOffset = (Config.GAME_WIDTH/2) - (Cell.TILE_SIZE * Chunk.WIDTH / 2)
                const chunk = new Chunk(this,
                    centerOffset,
                    (Cell.TILE_SIZE/2)-(Cell.TILE_SIZE*Chunk.HEIGHT),
                    this.chunksCleared+this.NUMBER_OF_CHUNKS);
                chunk.prevChunk = this.chunkList[this.chunkList.length - 1];
                this.chunkList[this.chunkList.length - 1].nextChunk = chunk;
                chunk.spawnMines(-2, -2);
                chunk.updateBottomRowCells();
                this.chunkList.push(chunk);
                this.chunksCleared++;
            }

            // Scroll chunks down
            this.scrollAllChunksDown();
        }
    }

    /**
    * Shifts all chunks down
    *
    * @returns void
    */
    private scrollAllChunksDown() {
        if (this.firstClear) {
            this.firstClear = false;
            const dy = (Cell.TILE_SIZE*Chunk.HEIGHT)-Cell.TILE_SIZE;
            this.chunkList.forEach((chunk, i) => {
                if (i === 0) {
                    chunk.scrollChunkDown(dy, () => this.events.emit('chunk-cleared'))
                } else {
                    chunk.scrollChunkDown(dy)
                }
            });
            return;
        }
        const dy = (Cell.TILE_SIZE*Chunk.HEIGHT);
        this.chunkList.forEach((chunk, i) => {
            if (i === 0) {
                chunk.scrollChunkDown(dy, () => this.chunkList.shift().destroy());
            } else {
                chunk.scrollChunkDown(dy);
            }
        });
    }

    /**
    * Receiver for the "gameover" event. Ends the game by spawning the gameover layer
    *
    * @returns void
    */
    private onGameover() {
        this.scene.pause();
        this.scene.run('Gameover', {score: this.score, highscore: 0, maxDistance: (this.chunksCleared+this.NUMBER_OF_CHUNKS)*100});
    }
}
