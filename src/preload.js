const { contextBridge, ipcRenderer } = require("electron");
// const path = require("path");

contextBridge.exposeInMainWorld("electron", {
  getLatestInstanceId: () => {
    ipcRenderer.send("getLatestInstanceId");
  },
  dragOutListener: (params) => {
    ipcRenderer.send("ondragstart", params);
  },
  minimise: () => {
    ipcRenderer.send("minimise");
  },
  debugPrint: (message) => {
    ipcRenderer.send("debugPrint", message);
  },
  fetchConfig: () => {
    ipcRenderer.send("fetchConfig");
  },
  onConfigReceived: (callback) => {
    ipcRenderer.on("configObj", callback)
  },
  applySettingsInConfig: (newConfig) => {
    ipcRenderer.send("applySettings", newConfig)
  },
  // 主题相关方法
  getCurrentTheme: (callback) => {
    ipcRenderer.send("get-current-theme");
    ipcRenderer.once("current-theme", (event, theme) => {
      callback(theme);
    });
  },
  onThemeChanged: (callback) => {
    ipcRenderer.on("theme-changed", (event, theme) => {
      callback(theme);
    });
  },
  onThemeSettingChanged: (callback) => {
    ipcRenderer.on("theme-setting-changed", (event, themeSetting) => {
      callback(themeSetting);
    });
  },
});

// For settings renderer
let configObj;
const updateConfigObj = (config) => {
  configObj = config;
  console.log(configObj);
};

ipcRenderer.on("configObj", (event, config) => {
  configObj = JSON.parse(config);
  const configFileContents = require(configObj.config.path);
  console.log(configFileContents);
  ipcRenderer.sendToHost(config);
  return configFileContents;
});

ipcRenderer.on("close-signal", (event) => {
  window.close();
});
ipcRenderer.on("history-instance", (event, filelist) => { });

console.log("preload");
