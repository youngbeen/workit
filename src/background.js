'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import fs from 'fs'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { dateUtil } from '@youngbeen/angle-util'
const isDevelopment = process.env.NODE_ENV !== 'production'

let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

// 侦听异步消息
ipcMain.on('asynchronous-message', (event, arg) => {
  // console.log(event, arg)
  if (arg && arg.type === 'sys_export_file') {
    // 下载数据
    const filters = [
      { name: 'workit_export_data', extensions: ['json'] }
    ]
    dialog.showSaveDialog({
      filters,
      title: 'Export',
      defaultPath: `workit_export_data_${dateUtil.formatDateTime('YYYYMMDD', new Date())}`,
      buttonLabel: 'Export'
    }).then(data => {
      if (data && data.filePath) {
        fs.writeFileSync(data.filePath, arg.content, 'utf8')
      }
    })
  } else if (arg && arg.type === 'sys_confirm_drop_maintask') {
    dialog.showMessageBox({
      type: 'question',
      buttons: ['Change Sequence', 'Become Sub Task'],
      defaultId: 0,
      message: 'What are you going to do?'
    }).then((data) => {
      switch (data.response) {
        case 0: // 调整顺序
          win.webContents.send('sys_changesequence', arg.content)
          break
        case 1: // 变为子任务
          win.webContents.send('sys_becomesubtask', arg.content)
      }
    })
  } else if (arg && arg.type === 'sys_confirm_add_duplicate') {
    dialog.showMessageBox({
      type: 'question',
      buttons: ['Add Anyway', 'Cancel'],
      // defaultId: 0,
      message: `It seems that you are adding a duplicate task\nCurrent: ${arg.content.info.content}\n🚧 Exists: ${arg.content.info.target}`
    }).then((data) => {
      if (data.response === 0) {
        win.webContents.send('sys_confirm_additem', Object.assign(arg.content.payload, { force: true }))
      }
    })
  }
  // else if (arg && arg.type === 'unlink_all_tasks') {
  //   // 重置所有当前项的分组
  //   dialog.showMessageBox({
  //     type: 'question',
  //     buttons: ['Proceed', 'Cancel'],
  //     // defaultId: 0,
  //     message: 'All tasks in current view will be unlinked, Are you sure to proceed?'
  //   }).then((data) => {
  //     switch (data.response) {
  //       case 0: // proceed
  //         win.webContents.send('sys_unlink_all')
  //         break
  //       case 1:
  //         // cancel, do nothing
  //     }
  //   })
  // }
  // event.reply('asynchronous-reply', 'got it')
})

// 导入数据功能
function importData () {
  dialog.showOpenDialog({
    filters: [{
      name: 'json file',
      extensions: ['json']
    }],
    properties: ['openFile'],
    buttonLabel: 'Import'
  }).then((data) => {
    if (data && data.filePaths && data.filePaths.length) {
      const content = fs.readFileSync(data.filePaths[0])
      // console.log(content.toString())
      dialog.showMessageBox({
        type: 'question',
        buttons: ['Merge', 'Replace', 'Cancel'],
        defaultId: 0,
        message: 'What will you do to deal with your saved data?'
      }).then((data) => {
        switch (data.response) {
          case 0: // merge
            win.webContents.send('sys_importdata', content.toString(), 'merge')
            break
          case 1: // replace
            win.webContents.send('sys_importdata', content.toString(), 'replace')
            break
          case 2:
            // cancel, do nothing
        }
      })
    }
  })
}

// 重置数据功能
function resetData () {
  dialog.showMessageBox({
    type: 'question',
    buttons: ['Proceed', 'Cancel'],
    // defaultId: 0,
    message: 'This will clear all data and tasks, are you sure to proceed?'
  }).then((data) => {
    switch (data.response) {
      case 0: // proceed
        win.webContents.send('sys_resetdata')
        break
      case 1:
        // cancel, do nothing
    }
  })
}

async function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    resizable: false,
    maximizable: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      // contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  const customMenu = Menu.buildFromTemplate([
    { role: 'appMenu' },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'cut' },
        { role: 'delete' },
        {
          label: 'Cancel',
          accelerator: 'Esc',
          click: () => {
            win.webContents.send('sys_cancel')
          }
        }
      ]
    },
    { role: 'windowMenu' },
    {
      label: 'Data',
      submenu: [
        {
          label: 'Add Task',
          accelerator: 'CommandOrControl+A',
          click: () => {
            win.webContents.send('sys_additem')
          }
        },
        {
          label: 'Add Task with Extra Config',
          accelerator: 'CommandOrControl+Shift+A',
          click: () => {
            win.webContents.send('sys_additem_full')
          }
        },
        {
          label: 'Copy All Content',
          click: () => {
            win.webContents.send('sys_copycontent')
          }
        },
        {
          label: 'Copy All Content with Labels',
          click: () => {
            win.webContents.send('sys_copycontent_withtag')
          }
        },
        {
          label: 'Export Data as File',
          click: () => {
            win.webContents.send('sys_export_trigger')
          }
        },
        {
          label: 'Import Data from File',
          click: () => {
            importData()
          }
        },
        {
          label: 'Reset Workit',
          click: () => {
            resetData()
          }
        }
      ]
    },
    {
      label: 'Navigation',
      submenu: [
        {
          label: 'Navigate Next',
          accelerator: 'CommandOrControl+Down',
          click: () => {
            win.webContents.send('sys_navdown')
          }
        },
        {
          label: 'Navigate Previous',
          accelerator: 'CommandOrControl+Up',
          click: () => {
            win.webContents.send('sys_navup')
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Guide',
          click: () => {
            win.webContents.send('sys_showguide')
          }
        }
      ]
    }
  ])
  Menu.setApplicationMenu(customMenu)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools
  //   try {
  //     await installExtension(VUEJS_DEVTOOLS)
  //   } catch (e) {
  //     console.error('Vue Devtools failed to install:', e.toString())
  //   }
  // }
  createWindow()
})

app.setAboutPanelOptions({
  applicationName: 'Workit',
  copyright: 'Released under ISC, all rights reversed by youngbeen 2019 - present',
  credits: 'created by youngbeen with ❤️'
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
