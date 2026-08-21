const COLORS = {
  backgroundTop: '#161224',
  backgroundBottom: '#09070f',
  card: '#231b38',
  cardBorder: '#3c3158',
  primary: '#fe2c55',
  secondary: '#25f4ee',
  text: '#ffffff',
  muted: '#b7afc8',
};

class ClickGame {
  constructor({ canvas, context, platform }) {
    this.canvas = canvas;
    this.context = context;
    this.platform = platform;
    this.width = canvas.__logicalWidth;
    this.height = canvas.__logicalHeight;
    this.pixelRatio = canvas.__pixelRatio;
    this.score = 0;
    this.highScore = platform.getHighScore();
    this.started = false;
    this.button = { x: 0, y: 0, width: 0, height: 0 };
  }

  start() {
    this.context.scale(this.pixelRatio, this.pixelRatio);
    this.platform.onTouchStart((event) => this.handleTouch(event));
    this.render();
  }

  handleTouch(event) {
    const touch = event.touches && event.touches[0];
    if (!touch) return;

    const x = touch.clientX;
    const y = touch.clientY;
    const inside = x >= this.button.x
      && x <= this.button.x + this.button.width
      && y >= this.button.y
      && y <= this.button.y + this.button.height;

    if (!inside) return;

    if (!this.started) {
      this.started = true;
      this.score = 0;
    } else {
      this.score += 1;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.platform.saveHighScore(this.highScore);
      }
    }

    this.platform.vibrate();
    this.render(true);
  }

  render(pressed = false) {
    this.drawBackground();
    this.drawBrand();
    this.drawScoreCard();
    this.drawActionButton(pressed);
    this.drawFooter();
  }

  drawBackground() {
    const gradient = this.context.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, COLORS.backgroundTop);
    gradient.addColorStop(1, COLORS.backgroundBottom);
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, this.width, this.height);

    this.context.globalAlpha = 0.13;
    this.context.fillStyle = COLORS.secondary;
    this.context.beginPath();
    this.context.arc(this.width - 30, 80, 110, 0, Math.PI * 2);
    this.context.fill();
    this.context.fillStyle = COLORS.primary;
    this.context.beginPath();
    this.context.arc(10, this.height - 90, 120, 0, Math.PI * 2);
    this.context.fill();
    this.context.globalAlpha = 1;
  }

  drawBrand() {
    this.context.textAlign = 'center';
    this.context.fillStyle = COLORS.secondary;
    this.context.font = '700 14px sans-serif';
    this.context.fillText('DOUYIN MINI GAME', this.width / 2, 76);

    this.context.fillStyle = COLORS.text;
    this.context.font = '800 32px sans-serif';
    this.context.fillText('抖音小游戏', this.width / 2, 120);

    this.context.fillStyle = COLORS.muted;
    this.context.font = '16px sans-serif';
    this.context.fillText('原生 JavaScript 基础模板', this.width / 2, 150);
  }

  drawScoreCard() {
    const cardWidth = Math.min(this.width - 48, 360);
    const cardHeight = 170;
    const x = (this.width - cardWidth) / 2;
    const y = Math.max(190, this.height * 0.3);

    this.roundRect(x, y, cardWidth, cardHeight, 24, COLORS.card);
    this.context.strokeStyle = COLORS.cardBorder;
    this.context.lineWidth = 1;
    this.context.stroke();

    this.context.textAlign = 'center';
    this.context.fillStyle = COLORS.muted;
    this.context.font = '15px sans-serif';
    this.context.fillText(this.started ? '当前点击次数' : '准备开始', this.width / 2, y + 42);

    this.context.fillStyle = COLORS.text;
    this.context.font = '800 64px sans-serif';
    this.context.fillText(String(this.score), this.width / 2, y + 112);

    this.context.fillStyle = COLORS.muted;
    this.context.font = '14px sans-serif';
    this.context.fillText(`最高记录 ${this.highScore}`, this.width / 2, y + 145);
  }

  drawActionButton(pressed) {
    const width = Math.min(this.width - 72, 310);
    const height = 64;
    const x = (this.width - width) / 2;
    const y = Math.min(this.height - 150, Math.max(390, this.height * 0.62));
    this.button = { x, y, width, height };

    const offset = pressed ? 2 : 0;
    this.roundRect(x, y + offset, width, height, 18, COLORS.primary);

    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillStyle = COLORS.text;
    this.context.font = '700 20px sans-serif';
    this.context.fillText(this.started ? '点击 +1' : '开始游戏', this.width / 2, y + height / 2 + offset);
    this.context.textBaseline = 'alphabetic';
  }

  drawFooter() {
    this.context.textAlign = 'center';
    this.context.fillStyle = COLORS.muted;
    this.context.font = '13px sans-serif';
    this.context.fillText('修改 src/game.js 开始制作你的游戏', this.width / 2, this.height - 46);
  }

  roundRect(x, y, width, height, radius, fillStyle) {
    const r = Math.min(radius, width / 2, height / 2);
    this.context.beginPath();
    this.context.moveTo(x + r, y);
    this.context.arcTo(x + width, y, x + width, y + height, r);
    this.context.arcTo(x + width, y + height, x, y + height, r);
    this.context.arcTo(x, y + height, x, y, r);
    this.context.arcTo(x, y, x + width, y, r);
    this.context.closePath();
    this.context.fillStyle = fillStyle;
    this.context.fill();
  }
}

module.exports = { ClickGame };
