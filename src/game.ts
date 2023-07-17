import * as Phaser from 'phaser';
import Cell from './cell';
import Chunk from './chunk';

export default class InfiniteSweeper extends Phaser.Scene {
    private modeSwitchButton: Phaser.GameObjects.Rectangle;

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
    }

    /**
    * Runs once when scene is created. Spawns the necessary chunks for the game.
    *
    * @returns void
    */
    create () {
        const centerOffset = (config.width / 2) - (Cell.TILE_SIZE * Chunk.WIDTH / 2)
        const chunk = new Chunk(this, centerOffset, Cell.TILE_SIZE / 2);
        this.chunkList.push(chunk);

        this.modeSwitchButton = this.add.rectangle((config.width / 2) - (Cell.TILE_SIZE / 2), config.height - 128, 64, 64, 0x00ff00)
            .setOrigin(0, 0)
            .setInteractive()
            .on('pointerup', () => { this.switchMode() });

        this.events.addListener('tile-pressed', (coords: {x: number, y: number}) => {this.onTilePressed(coords)});
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
    private onTilePressed(coords: {x: number, y: number}) {
        if (!this.flagMode) {
            if (this.firstClick) {
                this.chunkList[0].spawnMines(coords.x, coords.y);
                this.firstClick = false;
            }
            this.chunkList[0].revealTile(coords.x, coords.y);
        } else {
            this.chunkList[0].flagTile(coords.x, coords.y);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#5498c4',
    width: 720,
    height: 1080,
    scene: InfiniteSweeper
};

const game = new Phaser.Game(config);
