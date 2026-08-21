const { createPlatform } = require('./platform');
const { ClickGame } = require('./game');

const platform = createPlatform();
const canvas = platform.createCanvas();
const context = canvas.getContext('2d');

const game = new ClickGame({
  canvas,
  context,
  platform,
});

game.start();
