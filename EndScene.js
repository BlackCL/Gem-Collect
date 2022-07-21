class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndScene' });
  }

  preload() {
    this.load.image('endScreen', 'assets/endscreen.png');
  }

  create() {
    // Reset the board
    board = Array(12).fill(Array(12).fill('x'));
    // Show endscreen
    this.add.image(0, 0, 'endScreen').setOrigin(0).setScale(0.50);

    if (score > highscore){
      highscore = score;
    }
    else{}

    // Display the total score
    const scoreText = this.add.text(250, 550, `Score: ${score}`, {
      fontSize: '30px',
      fontStyle: 'bold',
      fill: '#ffffff'
    });
    //score text on top of the background
    scoreText.setDepth(1);

    const highscoreText = this.add.text(10, 515, `Highest Record: ${highscore}`, {
      fontSize: '22px',
      fontStyle: 'bold',
      fill: '#fffd80'
    });
    //score text on top of the background
    highscoreText.setDepth(1);

    // Clicks to restart
    this.input.on('pointerup', () => {
      this.scene.stop('EndScene');
      this.scene.start('GameScene');
    });
  }
}
