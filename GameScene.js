
const gemSize = 38;
let board;
let score = 0;
let highscore = 0;

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Load assets
    this.load.spritesheet('blocks', 'assets/blocks.png', {
      frameWidth: gemSize,
      frameHeight: gemSize
    });
    this.load.image('grid', 'assets/grid.png');
  }

  create() {
    // Add background
    this.add.image(0, 0, 'grid').setOrigin(0).setScale(0.50);
    // Boundaries of the game
    this.physics.world.setBounds(0, 0, 480, 600);
    // 12 x 12 board
    board = this.makeBoard(12);
    // Display score
    score = 0;
    let scoreText = this.add.text(15, 610, `Score: ${score}`, {
      fontSize: '25px',
      fontStyle: 'bold',
      fill: '#557cd9'
    });
    // Start a timer (in seconds）
    this.initialTime = 30;
    let timerText = this.add.text(
      250,
      610,
      `Time: ${formatTime(this.initialTime)}`,
      { fontSize: '25px', fill: '#557cd9'}
    );
    // Phaser timer event
    this.time.addEvent({
      delay: 1000, // = 1 second
      callback: onTimedEvent,
      callbackScope: this,
      loop: true
    });
    // format time: 00:00
    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      //remainder
      seconds %= 60;
      const secondsString = seconds.toString().padStart(2, '0');
      //padStart() :so we can maintain the 00:00 format with no gaps

      return `${minutes}:${secondsString}`;
    }

    // counts down or ends game
    function onTimedEvent() {
      if (this.initialTime === 0) {
        this.endGame();
      } else {
        this.initialTime--;
        timerText.setText(`Time: ${formatTime(this.initialTime)}`);
      }
    }

    // Clicks on gems
    this.input.on('gameobjectdown', function(pointer, gem, event) {
      const neighborgems = getNeighbors(gem);
      // Remove matching gems from game if there's at least 2 of them
      if (neighborgems.length > 0) {
        // Update score
        score += neighborgems.length;
        scoreText.setText(`Score: ${score}`);
        // Update each gem in neighborgems here
        neighborgems.forEach(neighbor => {
          neighbor.destroy();
          rendergems(neighbor);
        })
        removeCols();
      }

      //moves gem sprites down
      function rendergems(gem) {
        for (let row = 0; row < gem.row; row++) {
          // Move gem sprite down by 30px
          board[gem.col][row].y += gemSize;
          // Update the row of gem
          board[gem.col][row].row += 1;
        }
        // Update board array
        let removed = board[gem.col].splice(gem.row, 1);
        board[gem.col] = removed.concat(board[gem.col]);
      }
    });
  }

  update() {
    // end game if no more solutions
    if (remainingMoves() === false) {
      this.endGame();
    }
  }

  makeBoard(size) {
    // A nested array, inner arrays represent empty columns
    const board = Array(size).fill(Array(size).fill('x'));

    // Add code to fill board array with gem sprites and return it
    return board.map((col, i) => {
      return col.map((row, j) => this.makegem(i, j));
    });
  }

  makegem(colIndex, rowIndex) {
    const sideMargin = 31;
    const topMargin = 60;
    // Create a Phaser sprite
    const gem = this.physics.add.sprite(
      colIndex * gemSize + sideMargin,
      rowIndex * gemSize + topMargin,
      'blocks'
    );
    // Choose color randomly
    const max = 3;
    const min = 0;
    const color = Math.floor(Math.random() * (max - min + 1)) + min;
    // Don't let gem move beyond edges of board
    gem.setCollideWorldBounds(true);
    gem.body.collideWorldBounds = true;
    // Set the gem to a specific color
    gem.setFrame(color);
    // Make the gem clickable
    gem.setInteractive();
    // Add some information to make it easier to find a gem
    gem.col = colIndex;
    gem.row = rowIndex;
    gem.removed = false;

    return gem;
  }


  endGame() {
    // Stop sprites moving
    this.physics.pause();
    // Transition to end scene w/fade
    this.cameras.main.fade(800, 0, 0, 0, false, function(camera, progress) {
      if (progress > 0.5) {
        this.scene.stop('GameScene');
        this.scene.start('EndScene');
      }
    });
  }
}

// only checks the immediate neighbors of a gem
const checkClosest = (gem) => {
  const results = [];
  // 4 directions: left, right, up, down
  const directions = [
    { row: 0, col: -1 },
    { row: 0, col: 1 },
    { row: -1, col: 0 },
    { row: 1, col: 0 }
  ];
  const myCol = gem.col;
  const myRow = gem.row;
  const color = gem.frame.name;
  // Look for matching gem in 4 directions
  directions.forEach(direction => {
    // Coordinates of neighbor gem to check
    const newCol = myCol + direction.col;
    const newRow = myRow + direction.row;
    // Exit if the new col or row doesn't exist or will be removed
    if (
      !board[newCol] ||
      !board[newCol][newRow] ||
      board[newCol][newRow].removed
    ) {
      return;
    }
    // Check color of neighboring gem
    if (color === board[newCol][newRow].frame.name) {
      results.push(board[newCol][newRow]);
    }
  });

  // Return an array of neighboring gems with the same color
  return results;
}



// get neighborgems of a gem
const getNeighbors = (gem) => {

  let start = gem;
  let gemsToCheck = [start];
  let validNeighborgems = [];
  // Check gems in gemsToCheck for valid neighborgems
  while (gemsToCheck.length > 0) {
    let my = gemsToCheck.shift();
    // Only collect gems we haven't already removed as a valid neighbor
    if (my.removed === false) {
      validNeighborgems.push(my);
      my.removed = true;
    }
    // Add code to get matching gems, below
    const matches = checkClosest(my);
    matches.forEach(match => {
      match.removed = true;
      //returns an array of cubes of the same color connected to the gem
      validNeighborgems.push(match);
      gemsToCheck.push(match);
    });
  }
  // If not enough matching gems, clear and reset the clicked gem
  if (validNeighborgems.length === 1) {
    validNeighborgems[0].removed = false;
    validNeighborgems = [];
  }

  return validNeighborgems;
}

// Helper function shifts removes empty columns
const removeCols = () => {
  // Declare a emptyCols here:
  const emptyCols = board.map((col, i) => {
    const isEmpty = col.every(gem => gem.removed);
    return isEmpty ? i : false;
  }).filter(value => value !== false);
  // For each empty column, shift all remaining columns to the left
  emptyCols.forEach(emptyCol => {
    const columnsToMove = board.slice(emptyCol + 1);
    // Update the properties of gems of moved column
    columnsToMove.forEach(col => {
      col.forEach(gem => {
        gem.x -= gemSize;
        gem.col--;
      });
    });
  });
  // Remove all empty columns from the board array
  board.splice(emptyCols[0], emptyCols.length);
}

// Helper function to check remaining moves
const remainingMoves = () => {
  // Add code to return true or false at least 1 remaining move in board
  return board.some(col => doesColumnContainValidMoves(col));
}

const doesColumnContainValidMoves = (column) => {
  return column.find(gem => !gem.removed && checkClosest(gem).length > 0) !== undefined;
}
