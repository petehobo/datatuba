#!/usr/bin/env node

// This plugin replaces text in a file with values defined in the properties object

console.log("Setting app properties");

var wwwFileToReplace = "js/main.js";

var fs = require('fs');
var path = require('path');

var rootdir = process.argv[2];

var all_properties = require(path.join(rootdir, 'config/properties.js')),
    properties = all_properties.properties,
    platform_properties = all_properties.platform_properties;

function replace_string_in_file(filename, to_replace, replace_with) {
	var data = fs.readFileSync(filename, 'utf8');

	var result = data.replace(new RegExp(to_replace, "g"), replace_with);
	fs.writeFileSync(filename, result, 'utf8');
}

var currentBuildPlatforms = process.env.CORDOVA_PLATFORMS.split(",");

if (rootdir) {
	currentBuildPlatforms.forEach(function(val, index, array) {
		var wwwPath = "";
		switch(val) {
			case "ios":
				wwwPath = "platforms/ios/www/";
				break;
			case "android":
				wwwPath = "platforms/android/assets/www/";
				break;
			case "browser":
				wwwPath = "platforms/browser/www/";
				break;
            case "windows":
            case "windows8":
                wwwPath = "platforms/windows/www/";
                break;
			default:
				console.log("    Unknown build platform: " + val);
		}
		var fullfilename = path.join(rootdir, wwwPath + wwwFileToReplace);
		if (fs.existsSync(fullfilename)) {
			if (typeof platform_properties[val] !== 'undefined') {
				Object.keys(platform_properties[val]).forEach(function(key) {
					replace_string_in_file(fullfilename, key, platform_properties[val][key]);
				});
			}
			Object.keys(properties).forEach(function(key) {
				replace_string_in_file(fullfilename, key, properties[key]);
			});
			replace_string_in_file(fullfilename, '%%PLATFORM%%', val);
			console.log("    Replaced properties in file: " + fullfilename);
		}
		else {
			console.log("    " + fullfilename + " not found");
		}
	});
}