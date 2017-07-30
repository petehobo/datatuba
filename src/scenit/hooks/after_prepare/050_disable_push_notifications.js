#!/usr/bin/env node

var GCC_PREPROCESSOR_DEFINITIONS = '"$(inherited) DISABLE_PUSH_NOTIFICATIONS=1"';

var fs = require("fs");
var path = require("path");
var xcode = require('xcode');
var rootdir = process.argv[2];
var all_properties = require(path.join(rootdir, 'config/properties.js')),
    properties = all_properties.properties;
var appName = properties['%%APP_NAME%%'];



function run(rootdir, appName) {
    var xcodeappName = appName + '.xcodeproj';
    var xcodeProjectPath = path.join(rootdir, 'platforms', 'ios', xcodeappName, 'project.pbxproj');
    var xcodeProject;

    if (!fs.existsSync(xcodeProjectPath)) {
        return;
    }

    xcodeProject = xcode.project(xcodeProjectPath);

    console.log('    Setting GCC Preprocessor Definitions for ' + appName + ' to: [' + GCC_PREPROCESSOR_DEFINITIONS + '] ...');
    xcodeProject.parse(function(error){
        if(error){
            console.log('    An error occured during parsing of [' + xcodeProjectPath + ']: ' + JSON.stringify(error));
        } else {
            var configurations = nonComments(xcodeProject.pbxXCBuildConfigurationSection());
            for (var config in configurations) {
                var buildSettings = configurations[config].buildSettings;
                buildSettings.GCC_PREPROCESSOR_DEFINITIONS = GCC_PREPROCESSOR_DEFINITIONS;
            }

            fs.writeFileSync(xcodeProjectPath, xcodeProject.writeSync(), 'utf-8');

            console.log('    [' + xcodeProjectPath + '] now has GCC Preprocessor Definitions set to:[' + GCC_PREPROCESSOR_DEFINITIONS + '] ...');
        }
    });
}

var COMMENT_KEY = /_comment$/;
function nonComments(obj) {
    var keys = Object.keys(obj),
        result = {},
        i = 0;

    for (i; i < keys.length; i++) {
        if (!COMMENT_KEY.test(keys[i])) {
            result[keys[i]] = obj[keys[i]];
        }
    }

    return result;
}

var currentBuildPlatforms = process.env.CORDOVA_PLATFORMS.split(",");
currentBuildPlatforms.forEach(function(val, index, array) {
	if (val !== 'ios') {
		return;
	}

	run(rootdir, appName);
});
