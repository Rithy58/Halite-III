import { spawn } from 'child_process';
import { remote as electronRemote, shell } from 'electron';
import fs from 'fs';
import readline from 'readline';

import { pythonPath, pythonHomePath, pythonPackagePath, embeddedResourcesPath } from './assets';
import * as logger from './logger';

const DONE_READING = Symbol();

export const WEBSITE_URL = 'http://35.241.33.112';
export const API_SERVER_URL = 'http://35.190.92.101/v1';

export async function* call(args) {
    const fullArgs = ['-m', 'hlt_client', '--json'].concat(args);
    const subprocess = spawn(pythonPath(), fullArgs, {
        env: {
            'PYTHONPATH': pythonPackagePath([ embeddedResourcesPath() ]),
            'PYTHONHOME': pythonHomePath(),
        },
    });
    const rl = readline.createInterface({
        input: subprocess.stdout,
        crlfDelay: Infinity,
    });

    let iterating = true;
    let currentResolve = null;
    let currentReject = null;
    const makePromise = () => new Promise((resolve, reject) => {
        currentResolve = resolve;
        currentReject = reject;
    });
    let currentPromise = makePromise();

    const buffer = [];

    subprocess.stderr.on('data', (a) => logger.warn(`stderr output from hlt_client:`, new TextDecoder("utf-8").decode(a)));

    rl.on('line', (line) => {
        const result = JSON.parse(line);
        buffer.push(result);
        const resolve = currentResolve;
        currentPromise = makePromise();
        resolve();
    });
    rl.on('close', () => {
        iterating = false;
        currentReject(DONE_READING);
    });

    while (iterating) {
        try {
            while (buffer.length > 0) {
                yield buffer.shift();
            }
            await currentPromise;
        }
        catch (e) {
            if (e !== DONE_READING) {
                console.error(e);
                logger.error(e);
            }
            return;
        }
    }
}

export async function collectCall(args) {
    const result = [];
    for await (const value of call(args)) {
        result.push(value);
    }
    return result;
}

export function openBrowserTab(url) {
    shell.openExternal(url);
}

export function fetchApi(apiKey, endpoint, options) {
    if (!options) {
        options = {};
    }
    // Don't mutate options given to us
    options = Object.assign({}, options);
    if (!options.headers) {
        options.headers = {};
    }
    options.headers = Object.assign({}, options.headers, {
        'X-Api-Key': apiKey,
    });
    return window.fetch(`${API_SERVER_URL}/${endpoint}`, options);
}

export function download(asset) {
    return window.fetch(`${WEBSITE_URL}/${asset}`);
}

export function writeFile(path, contents) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, contents, (err) => {
            if (err) {
                console.error(err);
                logger.error(err);
                reject(err);
                return;
            }
            resolve();
        });
    });
}

export function watchReplay(path) {
    let win = new electronRemote.BrowserWindow({ width: 640, height: 680 });
    win.loadFile('visualizer.html');
    win.on('closed', () => {
        win = null;
    });

    win.webContents.on('did-finish-load', () => {
        win.webContents.send('watch', path);
    });
}
