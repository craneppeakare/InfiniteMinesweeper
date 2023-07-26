import InfiniteSweeper from "./game";
import GameOver from "./gameover";
import Overlay from "./overlay";

export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1080;

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#c0c0c0',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    scene: [InfiniteSweeper, GameOver, Overlay]
};

const game = new Phaser.Game(config);

