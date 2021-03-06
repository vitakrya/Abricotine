/*
 *   Abricotine - Markdown Editor
 *   Copyright (c) 2015 Thomas Brouard
 *   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
 */

var app = require("electron").app,
    constants = require("./constants.js"),
    deepExtend = require("deep-extend"),
    paths = require("path"),
    fs = require('fs');

function getTranslations(lang) {
    var langFiles = [
            paths.join(constants.path.defaultDir, "lang", "en.json"),
            paths.join(constants.path.defaultDir, "lang", lang + ".json"),
            paths.join(constants.path.userData, "lang", lang + ".json")
        ],
        translations = [];
    langFiles.forEach(function(file) {
        try {
            var fileContent = fs.readFileSync(file, 'utf8');
            translations.push(JSON.parse(fileContent));
        } catch (err) {
            console.warn("Error while loading localization data: " + err);
        }
    });
    return deepExtend.apply(this, translations);
}

function normalizeLang(lang) {
    // https://electron.atom.io/docs/api/locales/
    var regex = /^[a-z]*/,
        res = regex.exec(lang);
    return res ? res[0] : null;
}

function Localizer(lang) {
    this.translations = {};
    lang = lang || app.getLocale();
    lang = normalizeLang(lang);
    this.lang = lang;
    this.translations = getTranslations(lang);
}

Localizer.prototype = {

    getLang: function () {
        return this.lang;
    },

    get: function (key, argsArray) {
        var translation = this.translations[key];
        if (!translation) {
            console.warn("'" + key + "': translation not found");
            return key;
        }
        // insert message args
        if (translation && argsArray && argsArray.length) {
            for (var i = 0; i < argsArray.length; i++) {
                var regexp = new RegExp("%" + i, "g");
                translation = translation.replace(regexp, argsArray[i]);
            }
        }
        return translation;
    }
};

module.exports = Localizer;
