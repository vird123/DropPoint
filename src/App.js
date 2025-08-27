const { app, BrowserWindow, nativeImage, globalShortcut } = require("electron");
const { autoUpdater } = require("electron-updater");
const Store = require("electron-store");
const configOptions = require("./configOptions");

const { Instance } = require("./Window");
const { setShortcut } = require("./Shortcut");
const { droppointDefaultIcon } = require("./Icons");
const { setTray } = require("./Tray");
const { ThemeManager } = require("./ThemeManager");

const config = new Store(configOptions);
let splashScreen;
let themeManager;

app
  .on("ready", () => {
    // Check if app was started with --hidden flag (auto-start)
    const isHiddenStart = process.argv.includes('--hidden');
    
    // Splash screen which also helps to run in background and keep app alive
    splashScreen = new BrowserWindow({
      width: 400,
      height: 200,
      frame: false,
      titleBarStyle: "hidden",
      fullscreenable: false,
      transparent: true,
      icon: nativeImage.createFromPath(droppointDefaultIcon),
      show: false,
    });
    // splashScreen.loadFile(path.join(__dirname, "../static/media/splash.jpeg"));
    // splashScreen.removeMenu();
    // setTimeout(() => {
    //   splashScreen.hide();
    // }, 3000);

    // 初始化主题管理器
    themeManager = new ThemeManager();
    
    setTray();
    setShortcut();

    // Only spawn window on launch if not hidden start and spawnOnLaunch is enabled
    if (BrowserWindow.getAllWindows.length === 0 && config.get("spawnOnLaunch") && !isHiddenStart) {
      const instance = new Instance();
      const instanceID = instance.createNewWindow();
      if (instanceID !== null) {
      }
    }
    
    // Initialize auto-start setting based on current config
    const autoStartEnabled = config.get("autoStart");
    if (autoStartEnabled) {
      app.setLoginItemSettings({
        openAtLogin: true,
        path: process.execPath,
        args: ['--hidden']
      });
    }
  })
  // .on("activate", () => {
  //   autoUpdater.checkForUpdatesAndNotify();
  //   if (BrowserWindow.getAllWindows.length === 0) {
  //     createMainWindow();
  //   }
  // })
  .on("before-quit", () => {
    splashScreen.close();
  })
  .on("will-quit", () => {
    globalShortcut.unregisterAll();
  });
module.exports = {
  whenReady: app.whenReady,
};
