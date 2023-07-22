import InfiniteSweeper from "./game";
import GameOver from "./gameover";

export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1080;

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#5498c4',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    scene: [InfiniteSweeper, GameOver]
};

const game = new Phaser.Game(config);

