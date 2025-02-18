import * as Phaser from "phaser";
import * as Config from "./config";
import Button from "./button";

export default class GameOver extends Phaser.Scene {
  private score: number;
  private highscore: number;
  private maxDistance: number;

  /**
   * Constructor for the main Scene
   *
   * @returns a Scene
   */
  constructor() {
    super("Gameover");
  }

  /**
   * Initialize method. Runs before preload() and create().
   *
   * @returns void
   */
  init(data: any) {
    this.score = data.score;
    this.highscore = data.highscore;
    this.maxDistance = data.maxDistance;
  }

  /**
   * Preloads any assets needed for the scene. Runs before the create() method.
   *
   * @returns void
   */
  preload() { }

  /**
   * Runs once when scene is created. Spawns the necessary chunks for the game.
   *
   * @returns void
   */
  create() {
    this.sound.stopByKey("bg");
    this.cameras.main.setBackgroundColor("rgba(0, 0, 0, 150)");

    const gameoverString = `GAME OVER\n\nDISTANCE: ${this.maxDistance}m\nSCORE: ${this.score}\nHIGHSCORE: ${this.highscore}`;
    this.add
      .text(Config.GAME_WIDTH / 2, Config.GAME_HEIGHT / 2, gameoverString)
      .setStyle({ ...Config.largeStyle, align: "center" })
      .setOrigin(0.5, 0.5);

    this.game.scene.pause("Infinite Minesweeper");
    this.game.scene.pause("Overlay");

    this.scene.moveUp();

    const restartButton = new Button(
      this,
      Config.GAME_WIDTH / 2,
      800,
      "Restart",
    );
    restartButton.onClick(() => {
      if (Config.GameSettings.playBGM) {
        this.sound.play("bg", { loop: true });
      }
      this.scene.start("Infinite Minesweeper");
      this.scene.start("Overlay");
    });

    const backToMenuButton = new Button(
      this,
      Config.GAME_WIDTH / 2,
      900,
      "Back To Menu",
    );
    backToMenuButton.onClick(() => {
      this.game.scene.stop("Infinite Minesweeper");
      this.game.scene.stop("Overlay");
      this.scene.start("MainMenu");
    });
  }
}
