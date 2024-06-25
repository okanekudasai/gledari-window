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
const trayIconPath = path.join(app.getPath('userData'), 'gledari.png')
const base64String = "iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAACXBIWXMAABcSAAAXEgFnn9JSAAAF7GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDI0LTA2LTI2VDAyOjE2OjEyKzA5OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNC0wNi0yNlQwMzoyMDo1NCswOTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNC0wNi0yNlQwMzoyMDo1NCswOTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDplMzI3NGZmYS0yNDA5LTM3NGMtODAwNS0wYWYxMGQzYWM4YzEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzMyNmZjOWEtYjQwOS0wMTQ4LTgyOGItYzg4ZjBkNjY4ODNhIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MzMyNmZjOWEtYjQwOS0wMTQ4LTgyOGItYzg4ZjBkNjY4ODNhIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozMzI2ZmM5YS1iNDA5LTAxNDgtODI4Yi1jODhmMGQ2Njg4M2EiIHN0RXZ0OndoZW49IjIwMjQtMDYtMjZUMDI6MTY6MTIrMDk6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZTMyNzRmZmEtMjQwOS0zNzRjLTgwMDUtMGFmMTBkM2FjOGMxIiBzdEV2dDp3aGVuPSIyMDI0LTA2LTI2VDAzOjIwOjU0KzA5OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Y3x5WwAAAs9JREFUKM9NUl1IU3EU/927O93d7txXW2a0NFLL/FglCZYtsB5lUlsGGqyXKLCHSOpR0D0UWZCPIRZ+oVQPQY89WAxWBsYKwRVtjNwN3Zdz0133dfvfi4p/OPzP+f/P75zzO+dQdrv9CEVRrwCcI1KiabpEboiiiP1nx6Z3ZIHYtxiizBKlnYBkp1AohFwuB4VCIYv0ToLDYDBAp9Mhn89Lbp0SjiHANskSBEGOPjg4CI1Gg3g8jlQqhWg0KuvJZBI8z0OlUu0W08qUSqUMUXTFYhFEh9lsRnNzsxyA47i97ENDQ/D5fKirq9ulkJbAMkelUimH6+/vlwEsyyKRSMDtdsPj8cDr9cJoNEJKstsGplAoyJwYhkEkEsHGxobsIEWXdJvNhnA4LIObmpr2/qTD7JYrcRseHobVakUwGJR5BgIBOJ1OTE/PQK1WQyR+xX1ToKXMkkgB/H4/stksLBYzWlpaMDAwgCj/B709XYjFYqjQ6+XqCsUSCqTrzE7roTeYMDIyAv/iApw3bmKND2F2bhWhhAr1DadRYyoitZ5EuZJGZm0ZFF0mgQlnmkJm5QcqWBqNtlacON+HS1UqqDM8CqpKdFywYyXgRZUOYLU6aGuvwmRzU/R2No3k3wDKLGdhcbzHlTvPYGV5vBkfx+bWJqoPAOWbSygj1WmPXUbN9Q843jOF7XQcVAWD9aMX7+pqu0bBr6ZwKDmJyccuTEzNQaRZLC8tYub1GA62P0SD4wlEMqmfUy6sfX8bZ2odz7nqjnsQ81sIv7uGhd+f8EgZRHe3A5yKQWP9YUQNTvxj2pBPr+LbWDdiwS/gjHotOu9/9vW+FMXqMy5pBqKKZeVbEp1GKboezIqOp1uiwxMRq05elt85LSeSDfQpGAU+JiLLtsD8qIkiK07GmFUoaIGMTlBWtguaU7cFjqWFX/MvhODXiZyCpsiACj6yWH3/AYT3VPpCUW8TAAAAAElFTkSuQmCC";
const buffer = Buffer.from(base64String, 'base64');
fs.writeFile(trayIconPath, buffer, (err) => {
    if (err) {
        console.error('파일 저장 중 오류 발생:', err);
    } else {
        console.log('파일이 성공적으로 저장되었습니다:', trayIconPath);
    }
});
// const trayIconPath = './gledari.png'
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