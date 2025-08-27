const defaultAppConfig = {
  spawnOnLaunch: true,
  alwaysOnTop: true,
  openAtCursorPosition: false,
  shortcutAction: "toggle",
  autoStart: false,
  debug: false,
  darkMode: "system",
};
const appConfigSchema = {
  spawnOnLaunch: {
    type: "boolean",
    title: "Open a new instance on launch"
  },
  alwaysOnTop: {
    type: "boolean",
    title: "Always on top",
  },
  openAtCursorPosition: {
    type: "boolean",
    title: "Open at cursor position",
  },
  shortcutAction: {
    enum: ["toggle", "spawn"],
    type: "string",
    title: "Shortcut behaviour",
  },
  autoStart: {
    type: "boolean",
    title: "Start with system",
  },
  debug: {
    type: "boolean",
    title: "Enable debug mode",
  },
  darkMode: {
    enum: ["light", "dark", "system"],
    type: "string",
    title: "Theme mode",
  },
};
module.exports = {
  defaults: defaultAppConfig,
  schema: appConfigSchema,
};
