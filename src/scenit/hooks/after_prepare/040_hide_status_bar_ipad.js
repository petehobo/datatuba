#!/usr/bin/env node

/**
 * This hook copies configuration custom to plist
 */

var currentBuildPlatforms = process.env.CORDOVA_PLATFORMS.split(",");

var fs = require('fs');
var path = require('path');
var plist = require('plist');

var settings = {
	plist: {
		'UIViewControllerBasedStatusBarAppearance': false,
		'UIStatusBarHidden': true
	}
};

var rootdir = process.argv[2];
var all_properties = require(path.join(rootdir, 'config/properties.js')),
    properties = all_properties.properties;
var appName = properties['%%APP_NAME%%'];


currentBuildPlatforms.forEach(function(val, index, array) {
	if (val !== 'ios') {
		return;
	}
	var plistFile = rootdir+"/platforms/"+val+"/"+appName+"/"+appName+"-Info.plist";
	var obj = plist.parse(fs.readFileSync(plistFile, "utf8"));
	var i;
	
	for(i in settings.plist) {
		obj[i] = settings.plist[i];
	}

	fs.writeFile(plistFile, plist.build(obj), function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("   The plist file has been updated for " + appName + ' [' + val + ']');
		}
	});
});
