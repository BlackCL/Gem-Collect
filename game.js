const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 640,
  backgroundColor: 0x39414d,

  scene: [StartScene, GameScene, EndScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: 100,
      enableBody: true
    }
  }
};

const game = new Phaser.Game(config);
