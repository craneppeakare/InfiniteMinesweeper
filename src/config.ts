import InfiniteSweeper from "./game";
import GameOver from "./gameover";
import MainMenu from "./mainMenu";
import Overlay from "./overlay";
import SettingScene from "./settings";

export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1080;

export const largeStyle = { fontFamily: 'Silkscreen', fontSize: '62px', color: '#ffffff', stroke: '#000000', strokeThickness: 5 };
export const defaultStyle = { fontFamily: 'Silkscreen', fontSize: '20px', color: '#ffffff', stroke: '#000000', strokeThickness: 0 };
export const smallStyle = { fontFamily: 'Silkscreen', fontSize: '16px', color: '#ffffff', stroke: '#000000', strokeThickness: 0 };

class Settings {
    playBGM = true;
    screenShake = true;
    soundEffectsOn = true;
};

export const GameSettings = new Settings();

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#c0c0c0',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    scene: [MainMenu, InfiniteSweeper, GameOver, Overlay, SettingScene],
    antialias: false,
};

const game = new Phaser.Game(config);

