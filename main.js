const electron = require("electron");
const { app, Menu, MenuItem, ipcMain } = require("electron");
const BrowserWindow = electron.BrowserWindow;
const url = require("url");
var path = require("path");
var shell = require("electron").shell;
const shellExec = require("shell-exec");
let win;
let win2;

function createWindow() {
  // Create the browser window.
  // shellExec('pm2 describe fabdep')
  //   .then((data) => {
  //     console.log("datatat", data);
  //     if (data.stdout != '' && data.stdout != null && data.stdout != undefined) {
  //       shellExec('pm2 restart fabdep');
  //       console.log("if block");
  //     } else {
  //       shellExec('pm2 start /home/$USER/.fabdep/fabdep-2.0-v12.16.1/launcher.js --name fabdep');
  //       console.log("elseeeeeee block");
  //     }
  //   })
  //   .catch((err) => {
  //     console.log("catch", err);
  //   });

  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "/dist/assets/icons/png/64x64.png"),
    webPreferences: {
      nodeIntegration: true,
      backgroundThrottling: false,
      preload: path.join(__dirname, "script/reboot.js"),
    },
  });

  win.maximize();
  win.show();
  // and load the index.html of the app.
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/index.html`),
      protocol: "file:",
      slashes: true,
    })
  );

  // Open the DevTools.
  // win.webContents.openDevTools()

  var template = [];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  const menu = new Menu();
  menu.append(
    new MenuItem({
      label: "Select All",
      role: "selectAll",
      accelerator: "CmdOrCtrl+A",
    })
  );
  menu.append(
    new MenuItem({
      type: "separator",
    })
  );
  menu.append(
    new MenuItem({
      label: "Copy",
      role: "copy",
      accelerator: "CmdOrCtrl+C",
    })
  );
  menu.append(
    new MenuItem({
      type: "separator",
    })
  );
  menu.append(
    new MenuItem({
      label: "Cut",
      role: "cut",
      accelerator: "CmdOrCtrl+X",
    })
  );
  menu.append(
    new MenuItem({
      type: "separator",
    })
  );
  menu.append(
    new MenuItem({
      label: "Paste",
      role: "paste",
      accelerator: "CmdOrCtrl+V",
    })
  );
  menu.append(
    new MenuItem({
      type: "separator",
    })
  );
  menu.append(
    new MenuItem({
      label: "Undo",
      role: "undo",
      accelerator: "CmdOrCtrl+Z",
    })
  );
  menu.append(
    new MenuItem({
      type: "separator",
    })
  );
  menu.append(
    new MenuItem({
      label: "Redo",
      role: "redo",
      accelerator: "CmdOrCtrl+Y",
    })
  );

  win.webContents.on("context-menu", function (e, params) {
    menu.popup(win, params.x, params.y);
  });

  // Emitted when the window is closed.
  win.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

ipcMain.on("openUrlInElectron", async (event, args) => {
  shell.openExternal(args);
});
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});
