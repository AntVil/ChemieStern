let mapCanvas;
let ctxt;
let canvasPosition;

let pointerStartPosition;
let pointerOffsetPosition;
let pointerDragging;

function mapSetup(resolve, reject){
    mapCanvas = document.getElementById("mapCanvas");
    window.onresize = (e) => {
        mapCanvas.width = mapCanvas.clientWidth;
        mapCanvas.height = mapCanvas.clientHeight;
        ctxt = mapCanvas.getContext("2d");
    }
    window.onresize(null);
    pointerDragging = false;

    mapCanvas.addEventListener("mousedown", (e) => {
        e.preventDefault();

        pointerStartPosition = {
            x: e.clientX,
            y: e.clientY
        }
        pointerDragging = true;
    });

    mapCanvas.addEventListener("mousemove", (e) => {
        e.preventDefault();

        if(pointerDragging){
            pointerOffsetPosition = {
                x: e.clientX - pointerStartPosition.x,
                y: e.clientY - pointerStartPosition.y
            }
        }
    });

    mapCanvas.addEventListener("mouseup", (e) => {
        e.preventDefault();

        canvasPosition = {
            x: canvasPosition.x + pointerOffsetPosition.x,
            y: canvasPosition.y + pointerOffsetPosition.y
        }
        pointerOffsetPosition = {
            x: 0,
            y: 0
        }
        pointerDragging = false;
    });

    mapCanvas.addEventListener("touchstart", (e) => {
        e.preventDefault();

        pointerStartPosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        }
        pointerDragging = true;
    });

    mapCanvas.addEventListener("touchmove", (e) => {
        e.preventDefault();

        if(pointerDragging){
            pointerOffsetPosition = {
                x: e.touches[0].clientX - pointerStartPosition.x,
                y: e.touches[0].clientY - pointerStartPosition.y
            }
        }
    });

    mapCanvas.addEventListener("touchend", (e) => {
        e.preventDefault();

        canvasPosition = {
            x: canvasPosition.x + pointerOffsetPosition.x,
            y: canvasPosition.y + pointerOffsetPosition.y
        }
        pointerOffsetPosition = {
            x: 0,
            y: 0
        }
        pointerDragging = false;
    });

    canvasPosition = {
        x: 0,
        y: 0
    }

    pointerOffsetPosition = {
        x: 0,
        y: 0
    }

    requestAnimationFrame(mapLoop);
    resolve();
}


function mapLoop(){
    ctxt.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

    ctxt.fillRect(canvasPosition.x + pointerOffsetPosition.x, canvasPosition.y + pointerOffsetPosition.y, 20, 20);

    requestAnimationFrame(mapLoop);
}