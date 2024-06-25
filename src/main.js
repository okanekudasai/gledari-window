// 빌드 시 컨피그 파일을 생성하는 조건에서 true를 삭제하기!


const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('fs');

const express = require('express');

const expressApp = express();
const port = 7745; 

if (require('electron-squirrel-startup')) {
    app.quit();
}

console.log(__dirname)

const configFilePath = path.join(app.getPath('userData'), 'config.json')

const defaultData = {
    background_color: '#FFFAF6',
    encoding_type: 'utf-8',
    scrollbar: '#babd34'
};

let mainWindow;

const createWindow = () => {
    console.log("-----"+__dirname)
    mainWindow = new BrowserWindow({
        width: 450,
        height: 600,
        title: '글다리',
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, 
            enableRemoteModule: false, 
        },
    });

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        expressApp.use('/', express.static(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}`)));
        const server = expressApp.listen(port, () => {
            console.log(`Express server is running on http://localhost:${port}/index.html`);
            mainWindow.loadURL(`http://localhost:${port}/index.html`)
        });
       
    }
};

app.whenReady().then(() => {

    if (!fs.existsSync(configFilePath) || true) {
        fs.writeFileSync(configFilePath, JSON.stringify(defaultData));
    }

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

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
    mainWindow.close();
});