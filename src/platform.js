const STORAGE_KEY = 'douyin-mini-game-high-score';

function createPlatform() {
  if (typeof tt === 'undefined') {
    throw new Error('未检测到 tt 全局对象，请在抖音开发者工具中运行本项目。');
  }

  const systemInfo = typeof tt.getSystemInfoSync === 'function'
    ? tt.getSystemInfoSync()
    : {};

  return {
    createCanvas() {
      const canvas = tt.createCanvas();
      const width = systemInfo.windowWidth || canvas.width || 375;
      const height = systemInfo.windowHeight || canvas.height || 667;
      const pixelRatio = Math.min(systemInfo.pixelRatio || 1, 2);

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);

      canvas.__logicalWidth = width;
      canvas.__logicalHeight = height;
      canvas.__pixelRatio = pixelRatio;
      return canvas;
    },

    onTouchStart(handler) {
      tt.onTouchStart(handler);
    },

    getHighScore() {
      if (typeof tt.getStorageSync !== 'function') return 0;
      const value = Number(tt.getStorageSync(STORAGE_KEY));
      return Number.isFinite(value) ? value : 0;
    },

    saveHighScore(score) {
      if (typeof tt.setStorageSync === 'function') {
        tt.setStorageSync(STORAGE_KEY, String(score));
      }
    },

    vibrate() {
      if (typeof tt.vibrateShort === 'function') {
        tt.vibrateShort({ type: 'light' });
      }
    },
  };
}

module.exports = { createPlatform };
