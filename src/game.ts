import * as Phaser from 'phaser';
import Cell from './cell';
import Chunk from './chunk';
import * as Config from './config';

export default class InfiniteSweeper extends Phaser.Scene {
    private NUMBER_OF_CHUNKS = 3;

    private firstClear: boolean;
    private chunksCleared: number;
    private score: number;
    private combo: number;

    flagMode: boolean;
    chunkList: Chunk[];
    firstClick: boolean;

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
        this.load.image('mineImage', 'assets/mine.png');
        this.load.image('flagImage', 'assets/flag.png');
        this.load.image('shovelImage', 'assets/shovel.png');

        this.load.image('digParticle', 'assets/revealParticle.png');
        this.load.image('goldParticle', 'assets/goldParticle.png');

        this.load.audio('dig', 'assets/sounds/clearline.wav');
        this.load.audio('chunkClear', 'assets/sounds/btb_3.wav');

        this.load.audio('bigClear1', 'assets/sounds/allclear.wav');
        this.load.audio('bigClear2', 'assets/sounds/clearquad.wav');
        this.load.audio('bigClear3', 'assets/sounds/clearbtb.wav');

        this.load.audio('explosion', 'assets/sounds/explosion.wav');
        this.load.audio('gameover', 'assets/sounds/failure.wav');
        this.load.audio('shaking', 'assets/sounds/shaking.wav');
    }

    /**
    * Runs once when scene is created. Spawns the necessary chunks for the game.
    *
    * @returns void
    */
    create () {
        // Set variables
        this.firstClear = true;
        this.chunksCleared = 0;
        this.combo = 0;
        this.score = 0;
        this.flagMode = false;
        this.chunkList = [];
        this.firstClick = true;

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

        // Setup event listeners
        this.events.removeListener("tile-pressed");
        this.events.removeListener("chunk-cleared");
        this.events.removeListener("mode-switch");
        this.events.removeListener("gameover");
        this.events.removeListener("restart");
        this.events.addListener('tile-pressed', (coords: {x: number, y: number, chunkId: number}) => this.onTilePressed(coords));
        this.events.addListener('chunk-cleared', () => this.chunkCleared());
        this.events.addListener('mode-switch', () => this.flagMode = !this.flagMode);
        this.events.once('gameover', () => this.onGameover());
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
        let points = 0;
        if (!this.flagMode) {
            if (this.firstClick) {
                this.chunkList.forEach((chunk, i) => {
                    i === coords.chunkId - this.chunksCleared
                        ? chunk.spawnMines(coords.x, coords.y)
                        : chunk.spawnMines(-2, -2);
                })
                this.firstClick = false;
            }
            points += this.chunkList[chunkIndex].revealTile(coords.x, coords.y);
            this.chunkList[chunkIndex].checkIfComplete();
        } else {
            points += this.chunkList[chunkIndex].flagTile(coords.x, coords.y);
        }
        if (points) {
            this.score += points;
            this.combo += 1;
            this.sound.play('dig');
            this.scene.get("Overlay").events.emit('add-score', points);
            this.popupPoints(points);
            if (points > 1500) {
                this.sound.play('bigClear3');
                this.cameras.main.shake(200, 0.01);
            } else if (points > 1000) {
                this.sound.play('bigClear2');
                this.cameras.main.shake(150, 0.005);
            } else if (points > 500) {
                this.sound.play('bigClear1');
                this.cameras.main.shake(120, 0.002);
            } else {
            }
        } else {
            this.combo = 0;
        }
    }

    /**
    * Spawns a temporary + points on screen
    *
    * @returns void
    */
    private popupPoints(points: number) {
        const mouse = this.game.input.mousePointer;
        const text = this.add.text(mouse.x, mouse.y, `+${points}`, Config.defaultStyle)
            .setColor("#ffffff")
            .setOrigin(0, 0);
        this.tweens.add({
            targets: text,
            y: '-=20',
            alpha: '+255',
            ease: 'Linear',
            onComplete: () => text.destroy(),
            duration: 700
        });
    }

    /**
    * Receiver for the "chunk-cleared" event. Shifts all chunks down
    *
    * @returns void
    */
    private chunkCleared() {
        if (this.firstClear ? this.chunkList[0].isCleared : this.chunkList[1].isCleared) {
            this.sound.play('chunkClear');
            if (!this.firstClear) {
                // Spawn in a new chunk
                const centerOffset = (Config.GAME_WIDTH/2) - (Cell.TILE_SIZE * Chunk.WIDTH / 2)
                const chunk = new Chunk(this,
                    centerOffset,
                    (Cell.TILE_SIZE/2)-(Cell.TILE_SIZE*Chunk.HEIGHT)-Cell.TILE_SIZE,
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
        this.cameras.main.shake(1225, 0.0015);
        this.sound.play('shaking', { volume: 0.5, duration: 1225 });
        if (this.firstClear) {
            this.firstClear = false;
            const dy = (Cell.TILE_SIZE*Chunk.HEIGHT)-(2*Cell.TILE_SIZE);
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
        this.chunkList.forEach(cl => cl.revealAllMines());
        this.sound.play('explosion', { volume: 0.5 });
        this.sound.play('gameover');
        this.scene.run('Gameover', {score: this.score, highscore: 0, maxDistance: (this.chunksCleared+this.NUMBER_OF_CHUNKS)*100});
    }
}
