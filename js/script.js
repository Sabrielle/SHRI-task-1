var eventArray = new Array();
var prevDiff = -1;
var zoom = document.getElementById('zoom');
var brightness = document.getElementById('brightness');

function pointerdownHandler(ev) {
	eventArray.push(ev);
}

function pointermoveHandler(ev) {
	for (var i = 0; i < eventArray.length; i++) {
		if (ev.pointerId == eventArray[i].pointerId) {
			eventArray[i] = ev;
			break;
		}
	}

	if (eventArray.length == 2) {
		var curDiff = Math.abs(eventArray[0].clientX - eventArray[1].clientX);
		if (prevDiff > 0) {
			ev.target.style.transition = "all 1s ease-out";
			if (curDiff > prevDiff) {
				ev.target.style.transform = "scale(2)";
				zoom.innerText = "Приближение: 200%";
			}
			if (curDiff < prevDiff) {
				ev.target.style.transform = "scale(1)";
				zoom.innerText = "Приближение: 100%";
			}
		}
		prevDiff = curDiff;
	}
}

function pointerupHandler(ev) {
	removeEvent(ev);
	if (eventArray.length < 2) prevDiff = -1;
}

function removeEvent(ev) {
	for (var i = 0; i < eventArray.length; i++) {
		if (eventArray[i].pointerId == ev.pointerId) {
			eventArray.splice(i, 1);
			break;
		}
	}
}

function calcAngleDegrees(x, y) {
	return Math.atan2(y, x) * 180 / Math.PI;
}

var d = document.getElementById('image')
d.addEventListener('pointerdown', pointerdownHandler);
d.addEventListener('pointerup', pointerupHandler);
d.addEventListener('pointermove', pointermoveHandler);
d.addEventListener('pointercancel', pointerupHandler);