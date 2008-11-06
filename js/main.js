/*
	PHZH Printing Widget
	futureLAB AG, Marc Liyanage <mliyanage@futurelab.ch>
*/


var PRINTSERVER = 'gutenberg.org.phzh.int';
var PRINTPPD = '/Library/Printers/PPDs/Contents/Resources/en.lproj/hp LaserJet 3015.gz';
var PRINTQUEUE = 'DS114232';

var DEBUG = 1;

var globalProgressIndicator;
var WIDGET_VERSION;
var PRINTER_PREFIX = 'phzhprint';
var CONFIGURED_USERNAME;


function load() {
	findWidgetVersion();
	globalProgressIndicator = new ProgressIndicator($('progressindicator'), "progressindicator/img/prog");
	updateUi();
	updateStatus();
	widget.onshow = window.onfocus = updateStatus;
}


function commitPrefs() {
//	widget.setPreferenceForKey($('printserver_host_manual').value || '', 'printserverSourceManual');
	showFront();
	clearErrorMessage();
}



function updateUi() {
	setElementVisibilityById('createPrinter', ($N('username').value && $N('password').value));
	clearErrorMessage();
	if (DEBUG) setErrorMessage('DEBUG MODE');
}


function updateStatus() {
//	alert('printing widget status update');
	var systemCall = widget.system("/usr/bin/lpstat -a", updateStatusCallback);
	if (!systemCall) setLocalizedErrorMessage("Unable to list printers");
}


function updateStatusCallback(systemCall) {
	if (systemCall.status) {
		setLocalizedErrorMessage("Unable to list printers: " + systemCall.errorString);
		return;
	}
	CONFIGURED_USERNAME = '';
	var output = systemCall.outputString;
	
	var re = new RegExp('^' + PRINTER_PREFIX + '-(\\S+)', 'mg');
	var match = re.exec(output);
	if (!match) {
		setLocalizedStatusMessage('No printer configured');
		$('deletePrinter').hide();
		return;
	}
	CONFIGURED_USERNAME = match[1];
	$('deletePrinter').show();
	setStatusMessage(getLocalizedString('Printer is configured for user') + CONFIGURED_USERNAME);
}



function checkCredentials() {
	var userDomain = $N('userdomain').value;
	var cmd = "/usr/bin/smbutil view '//" + userDomain + ";" + $N('username').value + ":" + $N('password').value + "@" + PRINTSERVER + "'";
	widget.system(cmd, checkCredentialsCallback);
}


function checkCredentialsCallback(systemCall) {
	if (!DEBUG && systemCall.status) {
		setLocalizedErrorMessage("Invalid username or password");
		alert('credentials invalid: ' + systemCall.errorString);
		return;
	}
	alert('credentials valid');
	deletePrinter();
	createPrinter();
}


function createPrinter() {
	var userDomain = $N('userdomain').value;
	var printerName = PRINTER_PREFIX + '-' + $N('username').value;
	var printerUri = "smb://" + $N('username').value + ":" + $N('password').value + "@" + userDomain + "/" + PRINTSERVER + ":139/" + PRINTQUEUE;
	var cmd = "lpadmin -p " + printerName + " -v " + printerUri + " -E -P '" + PRINTPPD + "'";
	widget.system(cmd, createPrinterCallback);
}


function createPrinterCallback(systemCall) {
	if (!DEBUG && systemCall.status) {
		setLocalizedErrorMessage("Cannot create printer");
		alert('Unable to create printer: ' + systemCall.errorString);
		return;
	}
	alert('Printer created');
	updateStatus();
	$N('username').value = $N('password').value = '';
}


function deletePrinter() {
	if (!CONFIGURED_USERNAME) return;
	var printerName = PRINTER_PREFIX + '-' + CONFIGURED_USERNAME;
	var cmd = '/usr/sbin/lpadmin -x ' + printerName;
	widget.system(cmd, deletePrinterCallback);
}


function deletePrinterCallback(systemCall) {
	if (systemCall.status) {
		setLocalizedErrorMessage("Unable to delete printer: " + systemCall.errorString);
		return;
	}
	updateStatus();
}



function findWidgetVersion() {
	var cmd = "echo \"<xsl:stylesheet version='1.0' xmlns:xsl='http://www.w3.org/1999/XSL/Transform'><xsl:output omit-xml-declaration='yes'/><xsl:template match='/*'><xsl:value-of select='//string[preceding-sibling::key[1] = &quot;CFBundleVersion&quot;]'/></xsl:template></xsl:stylesheet>\" | xsltproc - Info.plist";
	widget.system(cmd, findWidgetVersionCallback);
}


function findWidgetVersionCallback(systemCall) {
	if (systemCall.status) {
	    alert("widget.system() failed. " + systemCall.errorString);
	    return;
	}
	WIDGET_VERSION = systemCall.outputString;
	$('widget_version').update(WIDGET_VERSION);
}


// Utility DOM functions
function $N(name) {
	return $(document.getElementsByName(name).item(0));
}

// Utility functions
function setElementVisibilityById(id, state) {
	if (state) {
		showElementById(id);
	} else {
		hideElementById(id);
	}
}

function hideElementById(id) {
	$(id).style.visibility = 'hidden';
}

function showElementById(id) {
	$(id).style.visibility = 'inherit';
}

function setElementState(name, state) {
	if (state) {
		enableElement(name);
	} else {
		disableElement(name);
	}
}

function disableElement(name) {
	$N(name).setAttribute('disabled', 'disabled');
}

function enableElement(name) {
	$N(name).removeAttribute('disabled');
}


// Localization / message display functions
function setLocalizedErrorMessage(string) {
	insertLocalizedString(string, 'error');
}

function setLocalizedStatusMessage(string) {
	insertLocalizedString(string, 'status');
}

function setStatusMessage(string) {
	clearErrorMessage();
	insertString(string, 'status');
}

function clearStatusMessage(string) {
	$('status').update();
}

function setErrorMessage(string) {
	clearStatusMessage();
	$('error').innerText = string;
}

function clearErrorMessage() {
	$('error').update();
}

function insertLocalizedString(string, id) {
	insertString(getLocalizedString(string), id);
}

function insertString(string, id) {
	$(id).innerText = string;
}




// Begin Apple functions
function remove()
{
	// your widget has just been removed from the layer
	// remove any preferences as needed
	// widget.setPreferenceForKey(null, "your-key");
}

function hide()
{
	// your widget has just been hidden stop any timers to
	// prevent cpu usage
}

function show()
{
	// your widget has just been shown.  restart any timers
	// and adjust your interface as needed
}

function showBack(event)
{
	// your widget needs to show the back

	var front = document.getElementById("front");
	var back = document.getElementById("back");

	if (window.widget)
		widget.prepareForTransition("ToBack");

	front.style.display="none";
	back.style.display="block";
	
	if (window.widget)
		setTimeout('widget.performTransition();', 0);
}

function showFront(event)
{
	// your widget needs to show the front

	var front = document.getElementById("front");
	var back = document.getElementById("back");

	if (window.widget)
		widget.prepareForTransition("ToFront");

	front.style.display="block";
	back.style.display="none";
	
	if (window.widget)
		setTimeout('widget.performTransition();', 0);
}

if (window.widget)
{
	widget.onremove = remove;
	widget.onhide = hide;
	widget.onshow = show;
}

// End Apple functions