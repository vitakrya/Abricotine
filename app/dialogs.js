/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var BrowserWindow = require("browser-window"),
    constants = require("./constants.js"),
    dialog = require("dialog"),
    app = require("app"),
    Localizer = require("./localize.js"),
    NativeImage = require("native-image"),
    parsePath = require("parse-filepath");

// Returns the most "logical" window object (it is quite useless actually)
function getWindow (win) {
    if (typeof win === "number") {
        return BrowserWindow.fromId(win);
    } else if (win instanceof BrowserWindow) {
        return win;
    } else if (win && typeof win.browserWindow !== "undefined") {
        return win.browserWindow;
    } else {
        return BrowserWindow.getFocusedWindow();
    }
}

var appDialogs = {

    localizer: new Localizer(app.getLocale()),

    about: function (win) {
        win = getWindow(win);
        var image = NativeImage.createFromPath(constants.path.icon),
            options = {
                title: appDialogs.localizer.get("about-title", "About"),
                message: appDialogs.localizer.get("about-message", "ABRICOTINE - MARKDOWN EDITOR (v. %0)\n\nCopyright (c) 2015 Thomas Brouard\n\nThis program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.\n\nThis program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.\n\nYou should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.", [constants.appVersion]),
                buttons: ["OK"],
                icon: image
            };
        if (win) {
            dialog.showMessageBox(win, options);
        } else {
            dialog.showMessageBox(options);
        }
    },

    askClose: function (path, saveFunc, closeFunc, win) {
        if (!path) {
            path = appDialogs.localizer.get('new-document', 'New document');
        }
        win = getWindow(win);
        var filename = parsePath(path).basename || path,
            userChoice = dialog.showMessageBox(win, {
                title: appDialogs.localizer.get('confirm-close-title', 'Unsaved document'),
                message: appDialogs.localizer.get('confirm-close-message', "Do you really want to close '%0' without saving?", [filename]),
                buttons: ['Cancel', appDialogs.localizer.get('confirm-save-and-close', 'Save & close'), appDialogs.localizer.get('confirm-close-without-saving', 'Close without saving')]
            });
        switch (userChoice) {
            case 1:
                saveFunc(closeFunc);
                break;
            case 2:
                closeFunc();
                break;
        }
        return false;
    },

    askOpenPath: function (title, win) {
        win = getWindow(win);
        var path = dialog.showOpenDialog(win, {
            title: title || appDialogs.localizer.get('dialog-open', 'Open document'),
            properties: ['openFile'],
            defaultPath: process.cwd()
        });
        if (path) {
            return path[0];
        }
        return false;
    },

    askSavePath: function (title, win) {
        win = getWindow(win);
        var path = dialog.showSaveDialog(win, {
            title: title || appDialogs.localizer.get('dialog-save', 'Save document'),
            defaultPath: process.cwd()
        });
        if (path) {
            return path;
        }
        return false;
    },

    askOpenImage: function (title, win) {
        //TODO i18n
        win = getWindow(win);
        var path = dialog.showOpenDialog(win, {
            title: title || 'Insert image',
            properties: ['openFile'],
            filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg'] }],
            defaultPath: process.cwd()
        });
        if (path) {
            return path[0];
        }
        return false;
    },

    askNeedSave: function (abrDoc, callback, win) {
        //TODO i18n
        win = getWindow(win);
        var userChoice = dialog.showMessageBox(win, {
                title: 'Save document',
                message: 'The current document needs to be saved before performing this operation.',
                buttons: ['Cancel', 'Save document']
            });
        if (userChoice === 1) {
            abrDoc.save(null, callback);
        }
        return false;
    },

    fileAccessDenied: function (path, callback, win) {
        //TODO i18n
        win = getWindow(win);
        var userChoice = dialog.showMessageBox(win, {
            title: "Permission denied",
            message: "The file '" + path + "' could not be written: permission denied. Please choose another path.",
            buttons: ['Cancel', 'OK']
        });
        if (userChoice === 1) {
            callback();
        }
        return false;
    },

    importImagesDone: function (path, win) {
        //TODO i18n
        win = getWindow(win);
        dialog.showMessageBox(win, {
            title: "Images copied",
            message: "Document images have been copied in the '" + path + "' directory.",
            buttons: ['OK']
        });
    }
};

module.exports = appDialogs;
