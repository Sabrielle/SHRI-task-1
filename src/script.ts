function gestures() {

	const eventArray = new Array();
	const historyState = new Array();
	const historyArray = new Array();
	let prevDiff = -1;
	let currentGesture = '';
	let isMultitouch = false;
	const da = 5;
	const ds = 10;
	let currentScale = 1;
	let currentStyleX;
	let lastPositionX = 0;
	const zoom = document.getElementById('zoom');
	const brightness = document.getElementById('brightness');

	function pointerDownHandler(ev: PointerEvent) {
		eventArray.push(ev);
		historyArray.push(ev);
	}

	function pointerMoveHandler(ev: PointerEvent) {

		for (let i = 0; i < eventArray.length; i++) {
			if (ev.pointerId === eventArray[i].pointerId) {
				eventArray[i] = ev;
				break;
			}
		}

		if (eventArray.length === 2) {

			isMultitouch = true;

			const dx = Math.abs(eventArray[0].clientX - eventArray[1].clientX);
			const dy = Math.abs(eventArray[0].clientY - eventArray[1].clientY);
			const distance = Math.sqrt(dx * dx * 2 + dy * dy * 2);
			const angle = calcAngleDegrees(dx, dy);
			const object = {
				angle,
				distance,
			};
			historyState.push(object);

			const distanceChange = historyState[historyState.length - 1].distance - historyState[historyState.length - 2].distance;

			if (historyState.length >= 2 && !currentGesture.length) {
				if (Math.abs(historyState[historyState.length - 1].angle - historyState[0].angle) > da &&
					Math.abs(distanceChange) < ds) {
					currentGesture = 'rotate';
			} else
				if (Math.abs(distanceChange) > ds) {
						currentGesture = 'pinch';
					}
			}

			const target: HTMLElement | null = ev.target as HTMLElement;

			switch (currentGesture) {
				case 'pinch':
					const curDiff = dx;
					if (zoom && ev && target && prevDiff > 0) {
						target.style.transition = 'all 0.5s ease-out';
						if (curDiff > prevDiff) {
							target.style.webkitTransform = 'scale(' + curDiff / 100 + ')';
							target.style.transform = 'scale(' + curDiff / 100 + ')';
							zoom.innerText = 'Приближение: ' + Math.round(curDiff) + '%';
							currentScale = curDiff / 100;
						}
						if (curDiff < prevDiff) {
							target.style.webkitTransform = 'scale(1)';
							target.style.transform = 'scale(1)';
							zoom.innerText = 'Приближение: 100%';
							currentScale = 1;
						}
					}
					prevDiff = curDiff;
					break;
				case 'rotate':
					if (ev && ev.target && brightness) {
						target.style.transition = 'all 0.5s ease-out';
						const value = angle / 36;
						target.style.filter = 'brightness(' + value + ')';
						target.style.webkitFilter = 'brightness(' + value + ')';
						brightness.innerText = 'Яркость: ' + Math.round(value * 100) + '%';
					}
					break;
			}
		} else {
			if (ev && ev.target) {
				const target: HTMLElement | null = ev.target as HTMLElement;
				target.style.transition = 'all 1s ease-out';
				const dx = ev.clientX - historyArray[0].clientX;
				const currentStyle = target && target.style && target.style.transform && target.style.transform.match(/-?[\d+\.]*px+/g);
				if (currentStyle) {
					currentStyleX = currentStyle[0].split('px');
					if (typeof(currentStyleX) !== 'undefined' ) { lastPositionX = Number(currentStyleX[0]); }
				} else {
					lastPositionX = ev.clientX;
				}
				const indentX = Number(lastPositionX) + Number(dx);
				const offset = currentScale * ((target.offsetWidth * currentScale) - target.offsetWidth) / (currentScale * 2);
				if (Math.abs(indentX) > offset) {
					return;
				} else {
					target.style.transform = 'translateX(' + indentX + 'px) scale(' + currentScale + ')';
					target.style.webkitTransform = 'translateX(' + indentX + 'px) scale(' + currentScale + ')';
					lastPositionX = indentX;
				}
			}
		}
	}

	function pointerUpHandler(ev: PointerEvent) {
		removeEvent(ev);
		if (eventArray.length < 2) { prevDiff = -1; }
		if (isMultitouch) {
			isMultitouch = false;
			currentGesture = '';
			historyState.length = 0;
		} else {
			historyArray.length = 0;
			eventArray.length = 0;
		}
		eventArray.length = 0;
	}

	function removeEvent(ev: PointerEvent) {
		for (let i = 0; i < eventArray.length; i++) {
			if (eventArray[i].pointerId === ev.pointerId) {
				eventArray.splice(i, 1);
				break;
			}
		}
	}

	function calcAngleDegrees(x: number, y: number) {
		return Math.atan2(y, x) * 180 / Math.PI;
	}

	const d: HTMLElement | null = document.getElementById('image');
	if (d !== null) {
		d.addEventListener('pointerdown', pointerDownHandler);
		d.addEventListener('pointerup', pointerUpHandler);
		d.addEventListener('pointermove', pointerMoveHandler);
		d.addEventListener('pointercancel', pointerUpHandler);
	}

}

gestures();
