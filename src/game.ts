import * as Phaser from 'phaser';
import Cell from './cell';
import Chunk from './chunk';
import * as Config from './config';

export default class InfiniteSweeper extends Phaser.Scene {
    private NUMBER_OF_CHUNKS = 2;

    private modeSwitchButton: Phaser.GameObjects.Rectangle;
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
            const chunk = new Chunk(this, centerOffset, (Cell.TILE_SIZE/2)+(i*Cell.TILE_SIZE*Chunk.HEIGHT) , i);
            this.chunkList.push(chunk);
            if (i != 0) {
                chunk.nextChunk = this.chunkList[i-1];
                this.chunkList[i-1].prevChunk = chunk;
            }
        }

        this.modeSwitchButton = this.add.rectangle((Config.GAME_WIDTH/2) - (Cell.TILE_SIZE / 2), Config.GAME_HEIGHT - 128, 64, 64, 0x00ff00)
            .setOrigin(0, 0)
            .setInteractive()
            .on('pointerup', () => { this.switchMode() });

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
    * Private function that toggles from reveal mode to flag mode
    *
    * @returns void
    */
    private switchMode() {
        this.flagMode = !this.flagMode;
        if (this.flagMode) {
            this.modeSwitchButton.fillColor = 0xff00ff;
        } else {
            this.modeSwitchButton.fillColor = 0x00ff00;
        }
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
        // const chunkIndex = chunkId - this.chunksCleared;
        const chunk = this.chunkList.pop()
        const cells = chunk.getAllCells();
        this.tweens.add({
            targets: cells,
            y: '+=' + Chunk.HEIGHT*Cell.TILE_SIZE,
            ease: 'Linear',
            duration: 1000,
        });
        this.tweens.add({
            targets: cells.map(c => c.label),
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
