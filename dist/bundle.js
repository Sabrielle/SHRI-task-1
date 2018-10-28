"use strict";
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
    function pointerDownHandler(ev) {
        eventArray.push(ev);
        historyArray.push(ev);
    }
    function pointerMoveHandler(ev) {
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
                }
                else if (Math.abs(distanceChange) > ds) {
                    currentGesture = 'pinch';
                }
            }
            const target = ev.target;
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
        }
        else {
            if (ev && ev.target) {
                const target = ev.target;
                target.style.transition = 'all 1s ease-out';
                const dx = ev.clientX - historyArray[0].clientX;
                const currentStyle = target && target.style && target.style.transform && target.style.transform.match(/-?[\d+\.]*px+/g);
                if (currentStyle) {
                    currentStyleX = currentStyle[0].split('px');
                    if (typeof (currentStyleX) !== 'undefined') {
                        lastPositionX = Number(currentStyleX[0]);
                    }
                }
                else {
                    lastPositionX = ev.clientX;
                }
                const indentX = Number(lastPositionX) + Number(dx);
                const offset = currentScale * ((target.offsetWidth * currentScale) - target.offsetWidth) / (currentScale * 2);
                if (Math.abs(indentX) > offset) {
                    return;
                }
                else {
                    target.style.transform = 'translateX(' + indentX + 'px) scale(' + currentScale + ')';
                    target.style.webkitTransform = 'translateX(' + indentX + 'px) scale(' + currentScale + ')';
                    lastPositionX = indentX;
                }
            }
        }
    }
    function pointerUpHandler(ev) {
        removeEvent(ev);
        if (eventArray.length < 2) {
            prevDiff = -1;
        }
        if (isMultitouch) {
            isMultitouch = false;
            currentGesture = '';
            historyState.length = 0;
        }
        else {
            historyArray.length = 0;
            eventArray.length = 0;
        }
        eventArray.length = 0;
    }
    function removeEvent(ev) {
        for (let i = 0; i < eventArray.length; i++) {
            if (eventArray[i].pointerId === ev.pointerId) {
                eventArray.splice(i, 1);
                break;
            }
        }
    }
    function calcAngleDegrees(x, y) {
        return Math.atan2(y, x) * 180 / Math.PI;
    }
    const d = document.getElementById('image');
    if (d !== null) {
        d.addEventListener('pointerdown', pointerDownHandler);
        d.addEventListener('pointerup', pointerUpHandler);
        d.addEventListener('pointermove', pointerMoveHandler);
        d.addEventListener('pointercancel', pointerUpHandler);
    }
}
gestures();
function initVideo(video, url) {
    if (video && url) {
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play();
            });
        }
        else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8';
            video.addEventListener('loadedmetadata', () => {
                video.play();
            });
        }
    }
}
function init() {
    const video1 = document.querySelector('#video-1');
    initVideo(video1, 'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fsosed%2Fmaster.m3u8');
    const video2 = document.querySelector('#video-2');
    initVideo(video2, 'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fcat%2Fmaster.m3u8');
    const video3 = document.querySelector('#video-3');
    initVideo(video3, 'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fdog%2Fmaster.m3u8');
    const video4 = document.querySelector('#video-4');
    initVideo(video4, 'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fhall%2Fmaster.m3u8');
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
    const brightness = document.querySelector('#brightness');
    const contrast = document.querySelector('#contrast');
    const canvas = document.querySelector('#canvas');
    const canvasCtx = canvas && canvas.getContext('2d');
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    const array = new Uint8Array(analyser.frequencyBinCount);
    const mediaElements = new WeakMap();
    if (video1) {
        video1.addEventListener('click', videoClickHandler);
    }
    if (video2) {
        video2.addEventListener('click', videoClickHandler);
    }
    if (video3) {
        video3.addEventListener('click', videoClickHandler);
    }
    if (video4) {
        video4.addEventListener('click', videoClickHandler);
    }
    function videoClickHandler(e) {
        const target = e.target;
        if (modal && modal.style.display === 'block') {
            return;
        }
        const videoParent = target.parentElement;
        e.preventDefault();
        if (modalVideo) {
            modalVideo.appendChild(target);
        }
        target.play();
        target.muted = false;
        if (modal) {
            modal.style.display = 'block';
        }
        audioCtx.resume();
        let source;
        if (mediaElements.has(target)) {
            source = mediaElements.get(target);
        }
        else {
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
            brightness.oninput = (ev) => {
                let tg = ev.target;
                filterVideo(tg.value, 'brightness', target);
            };
        }
        if (contrast) {
            contrast.oninput = (ev) => {
                let tg = ev.target;
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
    function resetInputs(currentStyle, brightness, contrast) {
        if (currentStyle) {
            if (brightness && currentStyle.indexOf('brightness') > -1) {
                brightness.value = currentStyle[currentStyle.indexOf('brightness') + 1];
            }
            if (contrast && currentStyle.indexOf('contrast') > -1) {
                contrast.value = currentStyle[currentStyle.indexOf('contrast') + 1];
            }
        }
        else {
            if (brightness) {
                brightness.value = '1';
            }
            if (contrast) {
                contrast.value = '1';
            }
        }
    }
    function filterVideo(value, type, element) {
        if (element && element.style) {
            let currentStyle;
            if (element.style.filter) {
                currentStyle = element.style.filter.match(/\w+-?[\d+\.]*/g);
            }
            else {
                currentStyle = '';
            }
            if (currentStyle && currentStyle.indexOf(type) > -1) {
                const index = currentStyle.indexOf(type);
                const prev = currentStyle[index + 1];
                if (element.style.filter) {
                    element.style.filter = element.style.filter.replace(`${type}(${prev})`, `${type}(${value})`);
                }
            }
            else {
                element.style.filter += `${type}(${value})`;
            }
        }
    }
    function getAverageVolume(array) {
        let sum = 0;
        array.forEach((item) => {
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
