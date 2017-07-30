var properties = {
	// These values are (mainly) used in the config.xml
	'%%APP_NAME%%'             : 'scenit',
	'%%APP_DESC%%'             : 'Seen it?',
	'%%APP_AUTH_EMAIL%%'       : 'development@datatuba.com',
	'%%APP_AUTH_SITE%%'        : 'http://www.datatuba.com',
	'%%APP_AUTH_NAME%%'        : 'scenit',
	'%%APP_PACKAGE%%'          : 'com.datatuba.scenit',

	// These values are used in the javascript
	'%%LOCALSTORAGE_PREFIX%%'  : 'scenit',
	'%%ALERT_TITLE%%'          : 'scenit',
	'%%DIRECTORY_NAME%%'       : 'com.datatuba.scenit',
	'%%USE_DEV_SPLASH%%'       : 'false',
	'%%PROMPT_BEFORE_UPDATE%%' : 'true'
};

// Overwrite properties above for individual platforms
var platform_properties = {
	'windows' : {
		'%%PROMPT_BEFORE_UPDATE%%' : 'true'
	},
	'browser' : {
		'%%PROMPT_BEFORE_UPDATE%%' : 'true'
	}
};

module.exports = {
    properties: properties,
    platform_properties: platform_properties
};
