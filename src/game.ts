import * as Phaser from 'phaser';
import * as WebFontLoader from 'webfontloader';
import Cell from './cell';
import Chunk from './chunk';

export default class InfiniteSweeper extends Phaser.Scene {
    private modeSwitchButton: Phaser.GameObjects.Rectangle;

    flagMode = false;
    chunkList: Chunk[] = [];

    firstClick = true;

    constructor () {
        super('Infinite Minesweeper');
    }

    preload () {
        // this.load.image('tilemap', 'assets/minetiles.png');
        // WebFontLoader.load({ google: { families: ['Press Start 2P'] } });
    }

    create () {
        const centerOffset = (config.width / 2) - (Cell.TILE_SIZE * Chunk.WIDTH / 2)
        const chunk = new Chunk(this, centerOffset, Cell.TILE_SIZE / 2);
        this.chunkList.push(chunk);

        this.modeSwitchButton = this.add.rectangle((config.width / 2) - (Cell.TILE_SIZE / 2), config.height - 128, 64, 64, 0x00ff00)
            .setOrigin(0, 0)
            .setInteractive()
            .on('pointerup', () => { this.switchMode() });

        this.events.addListener('tile-pressed', (coords: {x: number, y: number}) => {this.on_tile_pressed(coords)});
    }

    update() {
        // sdk
    }

    private switchMode() {
        this.flagMode = !this.flagMode;
        if (this.flagMode) {
            this.modeSwitchButton.fillColor = 0xff00ff;
        } else {
            this.modeSwitchButton.fillColor = 0x00ff00;
        }
    }

    private on_tile_pressed(coords: {x: number, y: number}) {
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
