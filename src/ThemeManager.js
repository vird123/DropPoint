const { nativeTheme, ipcMain } = require("electron");
const Store = require("electron-store");
const configOptions = require("./configOptions");

class ThemeManager {
  constructor() {
    this.config = new Store(configOptions);
    this.currentTheme = this.getCurrentTheme();
    this.setupThemeListeners();
  }

  /**
   * 获取当前应该使用的主题
   * @returns {string} 'light' 或 'dark'
   */
  getCurrentTheme() {
    const darkModeSetting = this.config.get("darkMode", "system");
    
    switch (darkModeSetting) {
      case "light":
        return "light";
      case "dark":
        return "dark";
      case "system":
      default:
        return nativeTheme.shouldUseDarkColors ? "dark" : "light";
    }
  }

  /**
   * 设置主题模式
   * @param {string} mode - 'light', 'dark', 或 'system'
   */
  setThemeMode(mode) {
    this.config.set("darkMode", mode);
    this.currentTheme = this.getCurrentTheme();
    this.notifyThemeChange();
  }

  /**
   * 设置主题监听器
   */
  setupThemeListeners() {
    // 监听系统主题变化
    nativeTheme.on("updated", () => {
      const newTheme = this.getCurrentTheme();
      if (newTheme !== this.currentTheme) {
        this.currentTheme = newTheme;
        this.notifyThemeChange();
      }
    });

    // 监听来自渲染进程的主题请求
    ipcMain.on("get-current-theme", (event) => {
      event.reply("current-theme", this.currentTheme);
    });

    ipcMain.on("set-theme-mode", (event, mode) => {
      this.setThemeMode(mode);
    });

    // 监听主题设置变化
    ipcMain.on("theme-setting-changed", (event, themeSetting) => {
      this.setThemeMode(themeSetting);
    });
  }

  /**
   * 通知所有窗口主题已更改
   */
  notifyThemeChange() {
    const { BrowserWindow } = require("electron");
    const allWindows = BrowserWindow.getAllWindows();
    
    allWindows.forEach(window => {
      if (window && !window.isDestroyed()) {
        window.webContents.send("theme-changed", this.currentTheme);
      }
    });
  }

  /**
   * 获取主题相关的CSS类名
   * @returns {string} CSS类名
   */
  getThemeClass() {
    return this.currentTheme === "dark" ? "dark" : "light";
  }
}

module.exports = {
  ThemeManager
};