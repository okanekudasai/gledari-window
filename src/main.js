// 빌드 시 컨피그 파일을 생성하는 조건에서 true를 삭제하기!


const { app, BrowserWindow, nativeImage, Tray, Menu, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('fs');
const notifier = require('node-notifier');

// const express = require('express');

// const expressApp = express();
// const port = 7745; 

if (require('electron-squirrel-startup')) {
    app.quit();
}

// // path.join으로 파일 경로 생성
// const filePath = './icon.png'

// // 방법 1: fs.existsSync 사용
// if (fs.existsSync(filePath)) {
//     console.log('there is ');
// } else {
//     console.log('none');
// }


const configFilePath = path.join(app.getPath('userData'), 'config.json')
const trayIconPath = './gledari.png'
// const trayIconPath = nativeImage.createFromPath('gledari.png')
// const trayIconPath = path.join(__dirname, 'gledari.png')
console.log("------", trayIconPath);

const defaultData = {
    note: 'on',
    tray_icon: 'on',
    background_color: '#FFFAF6',
    encoding_type: 'utf-8',
    scrollbar: '#babd34'
};

let mainWindow;
let tray;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 450,
        height: 600,
        minWidth: 370,
        title: '글다리',
        frame: false,
        // icon: './icon.png',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        // expressApp.use('/', express.static(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}`)));
        // const server = expressApp.listen(port, () => {
        //     console.log(`Express server is running on http://localhost:${port}/index.html`);
        //     mainWindow.loadURL(`http://localhost:${port}/index.html`)
        // });
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }
};

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus()
        }
    })
    app.whenReady().then(() => {

        if (!fs.existsSync(configFilePath)) {
            fs.writeFileSync(configFilePath, JSON.stringify(defaultData));
        }

        createWindow();

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });

        const sys_tray = JSON.parse(fs.readFileSync(configFilePath)).tray_icon;

        if (sys_tray == "on") {
            tray = new Tray(trayIconPath);
            const contextMenu = Menu.buildFromTemplate([
                { label: '끝내기', click: () => { app.quit(); } },
            ]);

            tray.setToolTip('글다리');
            tray.setContextMenu(contextMenu);

            tray.on('click', () => {
                if (mainWindow?.isVisible()) {
                    mainWindow.hide();
                } else {
                    mainWindow?.show();
                }
            });
        }
    });
}
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


// 기본 설정을 저장하는 함수
function saveConfig(config) {
    fs.writeFileSync(configFilePath, JSON.stringify(config))
}

// 기본 설정을 불러오는 함수
function loadConfig() {
    if (fs.existsSync(configFilePath)) {
        return JSON.parse(fs.readFileSync(configFilePath))
    } else {
        return null
    }
}

// IPC 핸들러를 사용하여 렌더러 프로세스와 통신
ipcMain.handle('get-config', async () => {
    return loadConfig()
})

ipcMain.handle('set-config', async (event, config) => {
    saveConfig(config)
})

ipcMain.handle('minimize-window', () => {
    mainWindow.minimize();
});

ipcMain.handle('close-window', () => {
    const state = JSON.parse(fs.readFileSync(configFilePath)).tray_icon
    if (state == 'on') {
        mainWindow.hide();
    } else if (state == 'off') {
        mainWindow.close();
    }
});

ipcMain.handle('toggle-tray', (event, state) => {
    if (state == 'on') {
        tray = new Tray(trayIconPath);
        const contextMenu = Menu.buildFromTemplate([
            { label: '끝내기', click: () => { app.quit(); } },
        ]);

        tray.setToolTip('글다리');
        tray.setContextMenu(contextMenu);

        tray.on('click', () => {
            if (mainWindow?.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow?.show();
            }
        });
    } else if (state == 'off') {
        tray.destroy();
    }
})

ipcMain.handle('note-on', (event, data) => {
    if (mainWindow.isVisible) return;
    notifier.notify({
        appID: '글다리',
        title: data.message,
        message: String(new Date()).split(" ")[4],
        icon: './gledari.png', // 선택적: 알림 아이콘 설정
        sound: data.sound, // 선택적: 알림 사운드 설정
        wait: true // 선택적: 알림을 닫기 전까지 프로그램 실행을 일시 중지
    });
})

notifier.on('click', function (notifierObject, options, event) {
    mainWindow.show()
});
