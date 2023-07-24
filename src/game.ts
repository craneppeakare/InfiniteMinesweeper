import * as Phaser from 'phaser';
import Cell from './cell';
import Chunk from './chunk';
import * as Config from './config';

export default class InfiniteSweeper extends Phaser.Scene {
    private NUMBER_OF_CHUNKS = 2;

    private chunksCleared = 0;
    private score: number;

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
            const chunk = new Chunk(this, centerOffset, 416-(i*Cell.TILE_SIZE*Chunk.HEIGHT), i);
            this.chunkList.push(chunk);
            if (i != 0) {
                chunk.prevChunk = this.chunkList[i-1];
                this.chunkList[i-1].nextChunk = chunk;
            }
        }

        this.game.events.addListener('mode-switch', () => {
            this.flagMode = !this.flagMode;
        });
        this.events.addListener('tile-pressed', (coords: {x: number, y: number, chunkId: number}) => this.onTilePressed(coords));
        this.events.addListener('chunk-cleared', (chunkId: number) => this.chunkCleared(chunkId));
        this.events.addListener('gameover', () => this.onGameover());
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
    private chunkCleared(chunkId: number) {
        console.log("chunkid: " + chunkId + ", chunkscleared: " + this.chunksCleared);
        if (this.chunkList[chunkId - this.chunksCleared].isCleared) {
            // Spawn in a new chunk
            const centerOffset = (Config.GAME_WIDTH/2) - (Cell.TILE_SIZE * Chunk.WIDTH / 2)
            const chunk = new Chunk(this,
                centerOffset,
                (Cell.TILE_SIZE/2)-(Cell.TILE_SIZE*Chunk.HEIGHT),
                this.chunksCleared+this.NUMBER_OF_CHUNKS);
            chunk.prevChunk = this.chunkList[this.chunkList.length - 1];
            this.chunkList[this.chunkList.length - 1].nextChunk = chunk;
            chunk.spawnMines(-2, -2);
            this.chunkList.push(chunk);

            // Scroll chunks down
            this.scrollAllChunksDown(chunkId);
            this.chunksCleared++;
        }
    }

    /**
    * Shifts all chunks down
    *
    * @returns void
    */
    private scrollAllChunksDown(chunkId: number) {
        const lastChunk = this.chunkList.shift();
        const lastChunkCells = lastChunk.getAllCells();
        this.tweens.add({
            targets: lastChunkCells.map(c => c.label),
            y: '+=' + Chunk.HEIGHT*Cell.TILE_SIZE,
            ease: 'Linear',
            duration: 1000,
        });
        this.tweens.add({
            targets: [lastChunk.minesLeftLabel],
            y: '+=' + Chunk.HEIGHT*Cell.TILE_SIZE,
            ease: 'Linear',
            onComplete: () => lastChunk.minesLeftLabel.destroy(),
            duration: 1000,
        });
        this.tweens.add({
            targets: lastChunkCells,
            y: '+=' + Chunk.HEIGHT*Cell.TILE_SIZE,
            ease: 'Linear',
            onStart: () => lastChunkCells.forEach(c => c.disableInteractive()),
            onComplete: () => {
                lastChunk.destroy();
                this.events.emit('chunk-cleared', chunkId+1);
            },
            duration: 1000,
        });
        this.chunkList.forEach(chunk => {
            const allCells = chunk.getAllCells();
            this.tweens.add({
                targets: allCells,
                y: '+=' + Chunk.HEIGHT*Cell.TILE_SIZE,
                ease: 'Linear',
                onStart: () => allCells.forEach(c => c.disableInteractive()),
                onComplete: () => allCells.forEach(c => c.setInteractive()),
                duration: 1000,
            });
            this.tweens.add({
                targets: allCells.map(c => c.label),
                y: '+=' + Chunk.HEIGHT*Cell.TILE_SIZE,
                ease: 'Linear',
                duration: 1000,
            });
            this.tweens.add({
                targets: [chunk.minesLeftLabel],
                y: '+=' + Chunk.HEIGHT*Cell.TILE_SIZE,
                ease: 'Linear',
                duration: 1000,
            });
        });
    }

    /**
    * Receiver for the "gameover" event. Ends the game by spawning the gameover layer
    *
    * @returns void
    */
    private onGameover() {
        this.scene.pause();
        this.scene.run('Gameover', {score: this.score});
    }
}
