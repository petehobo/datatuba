var app_prefix = '%%LOCALSTORAGE_PREFIX%%', // %% values are replaced in the build (by 020_set_version_number.js and 030_set_app_properties.js)
    alert_title = "%%ALERT_TITLE%%",
    local_directory_name = '%%DIRECTORY_NAME%%',
    app_name = '%%APP_NAME%%',
    app_version = '%%VERSION%%', // replaced with the version from config.xml in the build (by 020_set_version_number.js)
    disable_submit = false,
    skip_download = false,
    platform = '%%PLATFORM%%';

var translations = {
	"route_start" : "Current location",
	"route_dest"  : "Where do you want to go?",

	"mode_walk"   : "Wanna walk?",
	"mode_cycle"  : "Nah, I'll cycle",
	"mode_access" : "Accessibility track",

	"walking_options_header" : "Walking options",
	"walking_options_fast" : "Get me there quickly!",
	"walking_options_mood" : "Mood walks",
	"walking_options_access" : "Accessible tracks",
	"walking_options_undercover" : "Spy walk",

	"cycling_options_header" : "Cycling options",
	"cycling_options_fast" : "Get me there quickly!",
	"cycling_options_scenic" : "Scenic route",
	"cycling_options_path" : "Cycle path only",

	"fastest_walking_route" : "Fastest walking route",
	"scenic_walking_route" : "Scenic walking route",

	"not_implemented" : "Sorry, this functionality hasn't been implemented"
};

function initialise_app() {
	screen_height = $('body').height();

	$('body').addClass('platform-' + platform);

	window.addEventListener('native.keyboardhide', keyboard_hide_handler);
	window.addEventListener('native.keyboardshow', keyboard_show_handler);

	$.mobile.changePage("#loading");
	override_alerts();

	initialise_connection_handling();

	window.setTimeout(function() {
		$.mobile.changePage("#route_selection");
	}, 1500);

	if (!connection_active) {
		alert("Please connect to the internet");
	}
}

function initialise_connection_handling() {
	connection_active = is_connection_active();

	document.addEventListener("offline", function() {
		$('body').removeClass('connected');
		connection_active = false;
	}, false);

	document.addEventListener("online", function() {
		$('body').addClass('connected');
		connection_active = is_connection_active();
	}, false);
}

function keyboard_hide_handler(e) {
	// Use timer to stop background jump when user moves from one input to another
	keyboard_timer = window.setTimeout(function() {
		$('body').removeClass("keyboard-visible");
	}, 50);
}

function keyboard_show_handler(e) {
	if (keyboard_timer) {
		// Keyboard is being shown immediately after being hidden
		window.clearTimeout(keyboard_timer);
		keyboard_timer = null;
	}

	var $css = $('#keyboard-css');
	if ($css.length === 0) {
		// Move the background up in line with the screen resize (no resize event is triggered, as the keyboard overlays the page)
		var adjustment = ( screen_height - e.keyboardHeight ) / 2;
		$('<style>.keyboard-visible .app.background-splash { background-position: 0 -' + adjustment + 'px }</style>').appendTo('head').attr({
			media: 'all',
			id: 'keyboard-css',
			type: 'text/css'
		});
	}

	$('body').addClass("keyboard-visible");

	// Stop the iPad registering a submit when keyboard is shown (caused by positions of name field when keyboard hidden and submit button when it's shown)
	disable_submit = true;
	setTimeout(function() {
	    disable_submit = false;
	}, 100);
}

function is_connection_active() {
	try {
		var connectionType = navigator.connection.type;

		switch(connectionType) {
			case Connection.ETHERNET :
			case Connection.WIFI :
				$('body').addClass('connected');
				return true;

			case Connection.CELL_2G :
			case Connection.CELL_3G :
			case Connection.CELL_4G :
			case Connection.CELL :
				$('body').removeClass('connected');
				return false; // Don't chew up the user's data plan

			default :
				// Fall through to the browser check
		}
	}
	catch (e) {
		// Might be in a browser; fall through
	}

	// If we're in a desktop browser, assume we have a connection
	var result = !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);
	if (result) {
		$('body').addClass('connected');
	}
	else {
		$('body').removeClass('connected');
	}
	return result;
}

// ------------------------------------------------------------------------------------------------------ //
// Initialisation
// ------------------------------------------------------------------------------------------------------ //
function on_ready() {
	extend_jsrender();
}

function extend_jsrender() {
	if (typeof $.views !== 'undefined') {
		$.views.tags({
			// Halve a number (used to calcualte pixel width of a retina image)
			halve: function(value) {
				return Math.ceil(value / 2);
			}
		});

		$.views.helpers({
			isEmptyObject: $.isEmptyObject,
			getElement : function( object, property ) {
				return object[property];
			}
		});
	}
}



function override_alerts() {
	if (navigator.notification && platform !== 'browser') { // Override default HTML alert with native dialog
		window.alert = function (message) {
			navigator.notification.alert(
				message,    // message
				null,       // callback
				alert_title,   // title
				'OK'        // buttonName
			);
		};
	}
}

function show_confirm(message, on_ok, on_cancel) {
	if (navigator.notification && platform !== 'browser') {
		navigator.notification.confirm(
			message,
			function(button_index) {
				if (button_index === 1) {
					on_ok();
				}
				else {
					on_cancel();
				}
			},
			alert_title,
			[translations.button_labels.yes, translations.button_labels.no]
		);
	}
	else if (window.confirm) {
		if (confirm(message)) {
			on_ok();
		}
		else {
			on_cancel();
		}
	}
	else {
		on_ok();
	}
}

// ------------------------------------------------------------------------------------------------------ //
// Screen setup
// ------------------------------------------------------------------------------------------------------ //
function pagecreate_transport_mode(event, ui) {
	var template = $.templates('#template_transport_mode');
	$('.transport-mode-wrapper').each(function(n) {
		var content = template.render({
				labels : translations
			});

		$(this).replaceWith(content);
	});

	$('button#mode_walk').click(function(e) {
		e.preventDefault();
		$.mobile.changePage("#transport_mode_walking");
	});

	$('button#mode_cycle').click(function(e) {
		e.preventDefault();
		$.mobile.changePage("#transport_mode_cycling");
	});

	$('button#mode_access').click(function(e) {
		e.preventDefault();
		// TODO
		alert(translations.not_implemented);
	});

}

function pagecreate_route_selection(event, ui) {
	var template = $.templates('#template_route_selection');
	$('.route-selection-wrapper').each(function(n) {
		var content = template.render({
				labels : translations
			});

		$(this).replaceWith(content);
	});

	$('.route-selection-form').submit(function(e) {
		e.preventDefault();
		$.mobile.changePage("#transport_mode");
	});
}

function pagecreate_transport_mode_walking(event, ui) {
	var template = $.templates('#template_transport_mode_walking');
	$('.transport-mode-walking-wrapper').each(function(n) {
		var content = template.render({
				labels : translations
			});

		$(this).replaceWith(content);
	});

	$('a#walking_options_fast').click(function(e) {
		e.preventDefault();
		$.mobile.changePage("#route_walk_fast");
	});

	$('a#walking_options_mood').click(function(e) {
		e.preventDefault();
		$.mobile.changePage("#route_walk_scenic");
	});

	$('a#walking_options_access').click(function(e) {
		e.preventDefault();
		// TODO
		alert(translations.not_implemented);
	});

	$('a#walking_options_undercover').click(function(e) {
		e.preventDefault();
		// TODO
		alert(translations.not_implemented);
	});
}

function pagecreate_transport_mode_cycling(event, ui) {
	var template = $.templates('#template_transport_mode_cycling');
	$('.transport-mode-cycling-wrapper').each(function(n) {
		var content = template.render({
				labels : translations
			});

		$(this).replaceWith(content);
	});

	$('a#cycling_options_fast').click(function(e) {
		e.preventDefault();
		// TODO
		alert(translations.not_implemented);
	});

	$('a#cycling_options_scenic').click(function(e) {
		e.preventDefault();
		// TODO
		alert(translations.not_implemented);
	});

	$('a#cycling_options_path').click(function(e) {
		e.preventDefault();
		// TODO
		alert(translations.not_implemented);
	});
}



function pagecreate_route_walk_fast(event, ui) {
	var template = $.templates('#template_route_walk_fast');
	$('.route-walk-fast-wrapper').each(function(n) {
		var content = template.render({
				labels : translations
			});

		$(this).replaceWith(content);
	});
}

function pagecreate_route_walk_scenic(event, ui) {
	var template = $.templates('#template_route_walk_scenic');
	$('.route-walk-scenic-wrapper').each(function(n) {
		var content = template.render({
				labels : translations
			});

		$(this).replaceWith(content);
	});
}

