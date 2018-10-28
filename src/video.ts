function initVideo(video: HTMLVideoElement | null, url: string) {
	if (video && url) {
		if (Hls.isSupported()) {
			const hls = new Hls();
			hls.loadSource(url);
			hls.attachMedia(video);
			hls.on(Hls.Events.MANIFEST_PARSED, () => {
				video.play();
			});
		} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
			video.src = 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8';
			video.addEventListener('loadedmetadata', () => {
				video.play();
			});
		}
	}
}

function init() {
	const video1: HTMLVideoElement | null = document.querySelector('#video-1');
	initVideo(
		video1,
		'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fsosed%2Fmaster.m3u8');
	const video2: HTMLVideoElement | null = document.querySelector('#video-2');
	initVideo(
		video2,
		'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fcat%2Fmaster.m3u8');
	const video3: HTMLVideoElement | null = document.querySelector('#video-3');
	initVideo(
		video3,
		'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fdog%2Fmaster.m3u8');
	const video4: HTMLVideoElement | null = document.querySelector('#video-4');
	initVideo(
		video4,
		'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fhall%2Fmaster.m3u8');

}

function videoService() {

	init();

	const modal = document.getElementById('myModal');
	const modalVideo = document.getElementById('modal-video');
	const close = document.getElementById('close-window');

	const video1 = document.getElementById('video-1');
	const video2 = document.getElementById('video-2');
	const video3 = document.getElementById('video-3');
	const video4 = document.getElementById('video-4');

	const brightness: HTMLInputElement | null = document.querySelector('#brightness');
	const contrast: HTMLInputElement | null = document.querySelector('#contrast');

	const canvas: HTMLCanvasElement | null = document.querySelector('#canvas');
	const canvasCtx = canvas && canvas.getContext('2d');

	const audioCtx: AudioContext = new AudioContext();
	const analyser = audioCtx.createAnalyser();

	const array = new Uint8Array(analyser.frequencyBinCount);
	const mediaElements = new WeakMap();

	if (video1) { video1.addEventListener('click', videoClickHandler); }
	if (video2) { video2.addEventListener('click', videoClickHandler); }
	if (video3) { video3.addEventListener('click', videoClickHandler); }
	if (video4) { video4.addEventListener('click', videoClickHandler); }

	function videoClickHandler(e: Event) {
		const target = e.target as HTMLMediaElement;
		if (modal && modal.style.display === 'block') { return; }
		const videoParent = target.parentElement;
		e.preventDefault();
		if (modalVideo) {
			modalVideo.appendChild(target);
		}
		target.play();
		target.muted = false;
		if (modal) { modal.style.display = 'block'; }

		audioCtx.resume();

		let source: MediaElementAudioSourceNode;
		if (mediaElements.has(target)) {
			source = mediaElements.get(target);
		} else {
			source = audioCtx.createMediaElementSource(target);
			mediaElements.set(target, source);
		}

		source.connect(analyser);
		analyser.connect(audioCtx.destination);

		redrawCanvas();

		if (target && target.style && target.style.filter) {
			const currentStyle = target.style.filter.match(/\w+-?[\d+\.]*/g);
			resetInputs(currentStyle, brightness, contrast);
		}

		if (brightness) {
				brightness.oninput = (ev: Event) => {
					let tg = ev.target as HTMLInputElement;
					filterVideo(tg.value, 'brightness', target);
				};
		}

		if (contrast) {
			contrast.oninput = (ev: Event) => {
				let tg = ev.target as HTMLInputElement;
				filterVideo(tg.value, 'contrast', target);
			};
		}

		if (close) {
				close.onclick = () => {
				if (modal) {
					modal.style.display = 'none';
				}
				source.disconnect();
				if (videoParent) {
					videoParent.appendChild(target);
				}
				target.muted = true;
				target.play();
			};
		}
	}

	function resetInputs(currentStyle: RegExpMatchArray | null, brightness: HTMLInputElement | null, contrast: HTMLInputElement | null) {
		if (currentStyle) {
			if (brightness && currentStyle.indexOf('brightness') > -1) {
				brightness.value = currentStyle[currentStyle.indexOf('brightness') + 1];
			}
			if (contrast && currentStyle.indexOf('contrast') > -1) {
				contrast.value = currentStyle[currentStyle.indexOf('contrast') + 1];
			}
		} else {
			if (brightness) {
				brightness.value = '1';
			}
			if (contrast) {
				contrast.value = '1';
			}
		}
	}

	function filterVideo(value: string, type: string, element: HTMLMediaElement) {
		if (element && element.style) {
			let currentStyle;
			if (element.style.filter) {
				currentStyle = element.style.filter.match(/\w+-?[\d+\.]*/g);
			} else {
				currentStyle = '';
			}
			if (currentStyle && currentStyle.indexOf(type) > -1) {
				const index = currentStyle.indexOf(type);
				const prev = currentStyle[index + 1];
				if (element.style.filter) {
					element.style.filter = element.style.filter.replace(`${type}(${prev})`, `${type}(${value})`);
				}
			} else { element.style.filter += `${type}(${value})`; }
		}
	}

	function getAverageVolume(array: Uint8Array) {
		let sum = 0;
		array.forEach( (item) => {
			sum += item;
		});
		// for (let i = 0; i < array.length; i++) {
		// 	sum += array[i];
		// }
		const averageVolume = sum / array.length;
		return averageVolume;
	}

	function redrawCanvas() {
		requestAnimationFrame(redrawCanvas);
		analyser.getByteFrequencyData(array);
		const average = getAverageVolume(array);
		if (canvas && canvasCtx) {
			canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
			canvasCtx.fillStyle = 'rgba(255,217,62,0.9)';
			canvasCtx.fillRect(0, 130 - average, 30, 130);
		}
	}

}

videoService();
