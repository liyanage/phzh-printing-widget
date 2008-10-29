
/*

HTML:
    <img id='progressindicator' src="progressindicator/img/prog1.png" />

global JS:
    var globalProgressIndicator;
    
load() JS method:
    globalProgressIndicator = new ProgressIndicator($('progressindicator'), "progressindicator/img/prog");

start/stop:
    globalProgressIndicator.start();
    globalProgressIndicator.stop();

CSS:
	#progressindicator {
		vertical-align: text-bottom;
	}


*/

/******** Progress Indicator *********/
/* taken with permission from Wikipedia widget */

function ProgressIndicator(element, imageBaseURL) {
    this.count = 0;
    this.timer = null;
    this.element = element;
    this.element.style.display = "none";
    this.imageBaseURL = imageBaseURL;
}

ProgressIndicator.prototype = {
    start : function () {
        this.element.style.display = "inline";
        if (this.timer) clearInterval(this.timer);
        this.tick();
        var localThis = this;
        this.timer = setInterval (function() { localThis.tick() }, 60);
    },

    stop : function () {
        clearInterval(this.timer);
        this.element.style.display = "none";
//        document.getElementById("cancelButton").style.display="none";
    },

    tick : function () {
        var imageURL = this.imageBaseURL + (this.count + 1) + ".png";
        this.element.src = imageURL;
        this.count = (this.count + 1) % 12;
    }
}

