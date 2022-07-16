const MAP_SCALING_FACTOR = 1.5;
const SIMULATION_STEPS = 10;
const SIMULATION_REPULSION_STRENGTH = 0.1;
const SIMULATION_FRICTION_STRENGTH = 0.3;
const SIMULATION_ATTRACTION_STRENGTH = 0.4;
const GRAPH_OFFSET_X = 250;
const GRAPH_OFFSET_Y = 100;
const NODE_WIDTH = 230;
const NODE_HEIGHT = 50;
const NODE_RADIUS = 15;
const NODE_FONT_SIZE = 25;

let mapCanvas;
let ctxt;
let mapTransform;

let pointerStartPosition;
let pointerOffsetPosition;
let pointerDragging;

let mapToolDragElement;
let mapToolZoomInElement;
let mapToolZoomOutElement;

let graph;
let graphStart;

let hoverElement;

async function mapSetup(){
    mapToolDragElement = document.getElementById("mapToolDrag");
    mapToolZoomInElement = document.getElementById("mapToolZoomIn");
    mapToolZoomOutElement = document.getElementById("mapToolZoomOut");

    mapCanvas = document.getElementById("mapCanvas");
    mapCanvas.width = mapCanvas.clientWidth;
    mapCanvas.height = mapCanvas.clientHeight;
    ctxt = mapCanvas.getContext("2d");
    new ResizeObserver((x) => setCanvasSize()).observe(mapCanvas);

    mapCanvas.addEventListener("mousedown", (e) => {
        e.preventDefault();
        startPointer(e.clientX, e.clientY);
    });
    mapCanvas.addEventListener("mousemove", (e) => {
        e.preventDefault();
        movePointer(e.clientX, e.clientY);
        let hoverElement_ = mapGetHoverElement(e.clientX, e.clientY);
        if(hoverElement !== hoverElement_){
            hoverElement = hoverElement_;
            mapRender();
        }
    });
    mapCanvas.addEventListener("mouseup", (e) => {
        e.preventDefault();
        endPointer();
    });

    mapCanvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        startPointer(e.touches[0].clientX, e.touches[0].clientY);
    });
    mapCanvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        movePointer(e.touches[0].clientX, e.touches[0].clientY);
    });
    mapCanvas.addEventListener("touchend", (e) => {
        e.preventDefault();
        endPointer();
    });

    mapTransform = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ];
    pointerOffsetPosition = [0, 0];
    pointerDragging = false;

    // setup graph
    graph = [];
    for(let content of Object.keys(contents)){
        graph[content] = {
            "x": 0,
            "y": 0,
            "parents": getContentParents(content)
        };
    }

    // get root node
    let rootNodes = new Set(Object.keys(graph));
    while(rootNodes.size > 1){
        let temp = new Set();
        for(let node of rootNodes){
            graph[node].parents.forEach((p) => temp.add(p));
        }
        temp.delete(undefined);
        rootNodes = temp;
    }
    
    // put nodes into layers
    let layers = [Array.from(rootNodes)];
    let addedNodes = new Set(rootNodes);
    while(addedNodes.size !== Object.keys(graph).length){
        let layer = [];
        for(let node of Object.keys(graph)){
            if(!addedNodes.has(node) && graph[node].parents.filter((n) => !addedNodes.has(n)).length === 0){
                layer.push(node);
            }
        }
        
        layers.push(layer);
        layer.forEach((n) => addedNodes.add(n));
    }
    for(let i=0;i<layers.length;i++){
        for(let j=0;j<layers[i].length;j++){
            graph[layers[i][j]].x = j;
            graph[layers[i][j]].y = i;
        }
    }
    
    // insert extra nodes on layers between child and parent
    let extraNodeId = 0;
    for(let i=layers.length-1;i>=0;i--){
        for(let j=0;j<layers[i].length;j++){
            let node = graph[layers[i][j]];
            let parents = node.parents;
            for(let k=0;k<parents.length;k++){
                let distance = i - graph[parents[k]].y;
                if(distance === 1){
                    continue;
                }

                let extraNode;
                let firstExtraNodeName = `_${extraNodeId}`;
                for(let l=0;l<distance-1;l++){
                    let y = i - l - 1;
                    let extraNodeName = `_${extraNodeId}`;
                    extraNode = {
                        "x": layers[y].length,
                        "y": y,
                        "parents": [`_${extraNodeId+1}`]
                    }
                    layers[y].push(extraNodeName)
                    graph[extraNodeName] = extraNode;
                    extraNodeId++;
                }
                extraNode.parents = [parents[k]];
                parents[k] = firstExtraNodeName;
            }
        }
    }

    // make simulation deterministic
    for(let i=0;i<layers.length;i++){
        layers[i] = layers[i].sort();
        for(let j=0;j<layers[i].length;j++){
            graph[layers[i][j]].x = j;
            graph[layers[i][j]].dx = 0;
        }
    }    

    // simulate pushing and pulling
    for(let t=0;t<SIMULATION_STEPS;t++){
        for(let i=0;i<layers.length-1;i++){
            for(let j=0;j<layers[i].length;j++){
                let parents = graph[layers[i][j]].parents
                for(let k=0;k<parents.length;k++){
                    graph[layers[i][j]].dx += SIMULATION_ATTRACTION_STRENGTH * (graph[parents[k]].x - graph[layers[i][j]].x);
                    graph[parents[k]].dx += SIMULATION_ATTRACTION_STRENGTH * (graph[layers[i][j]].x - graph[parents[k]].x);
                }
                for(let k=0;k<layers[i].length;k++){
                    graph[layers[i][j]].dx -= SIMULATION_REPULSION_STRENGTH * Math.cbrt(graph[layers[i][k]].x - graph[layers[i][j]].x);
                }
            }
        }
        for(let i=0;i<layers.length;i++){
            for(let j=0;j<layers[i].length;j++){
                graph[layers[i][j]].dx *= SIMULATION_FRICTION_STRENGTH;
                graph[layers[i][j]].x += graph[layers[i][j]].dx;
            }
        }
    }

    // set final positions
    for(let i=0;i<layers.length;i++){
        layers[i] = layers[i].sort((a, b) => graph[a].x - graph[b].x)
        for(let j=0;j<layers[i].length;j++){
            graph[layers[i][j]].x = (j - 0.5 * (layers[i].length-1)) * GRAPH_OFFSET_X;
            graph[layers[i][j]].y = -i * GRAPH_OFFSET_Y;
        }
    }

    mapTransform[2] += mapCanvas.width / 2;
    mapTransform[5] += mapCanvas.height / 2;

    hoverElement = null;

    mapRender();
}


function setCanvasSize(){
    // client size is calculated by css
    mapCanvas.width = mapCanvas.clientWidth;
    mapCanvas.height = mapCanvas.clientHeight;
    ctxt = mapCanvas.getContext("2d");
    mapRender();
}

function startPointer(x, y){
    pointerStartPosition = [x, y];
    pointerDragging = true;

    if(mapToolDragElement.checked){
        let selectedElement = mapGetHoverElement(x, y);
        if(selectedElement !== null){
            endPointer();
            hoverElement = null;
            loadPageContent(selectedElement);
        }
    }
}

function movePointer(x, y){
    if(pointerDragging){
        pointerOffsetPosition[0] = x - pointerStartPosition[0];
        pointerOffsetPosition[1] = y - pointerStartPosition[1];

        mapRender();
    }
}

function endPointer(){
    if(mapToolDragElement.checked){
        mapTransform[2] += pointerOffsetPosition[0];
        mapTransform[5] += pointerOffsetPosition[1];
    }else if(mapToolZoomInElement.checked){
        mapTransform = zoom(pointerStartPosition[0] + pointerOffsetPosition[0], pointerStartPosition[1] + pointerOffsetPosition[1], true, mapTransform);
    }else if(mapToolZoomOutElement.checked){
        mapTransform = zoom(pointerStartPosition[0] + pointerOffsetPosition[0], pointerStartPosition[1] + pointerOffsetPosition[1], false, mapTransform);
    }

    pointerOffsetPosition = [0, 0];
    pointerDragging = false;

    mapRender();
}

function mapRender(){
    ctxt.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    ctxt.save();
    ctxt.setTransform(mapTransform[0], mapTransform[3], mapTransform[1], mapTransform[4], mapTransform[2] + pointerOffsetPosition[0], mapTransform[5] + pointerOffsetPosition[1]);

    ctxt.lineWidth = 1;
    ctxt.strokeStyle = window.getComputedStyle(document.documentElement).getPropertyValue('--fontColor');
    for(let node of Object.keys(graph)){
        for(let parent of graph[node].parents){
            ctxt.beginPath();
            ctxt.moveTo(graph[node].x, graph[node].y);
            ctxt.bezierCurveTo(graph[node].x, graph[parent].y, graph[parent].x, graph[node].y, graph[parent].x, graph[parent].y);
            ctxt.stroke();
        }
    }

    ctxt.fillStyle = window.getComputedStyle(document.documentElement).getPropertyValue('--contentBackgroundColor');
    for(let node of Object.keys(graph)){
        if(!node.startsWith("_")){
            roundedRect(ctxt, graph[node].x - NODE_WIDTH / 2, graph[node].y - NODE_HEIGHT / 2, NODE_WIDTH, NODE_HEIGHT, NODE_RADIUS);
            ctxt.fill();
        }
    }

    ctxt.textAlign = "center";
    ctxt.textBaseline = "middle";
    ctxt.fillStyle = window.getComputedStyle(document.documentElement).getPropertyValue('--fontColor');
    ctxt.font = `${NODE_FONT_SIZE}px Arial`;
    for(let node of Object.keys(graph)){
        if(!node.startsWith("_")){
            ctxt.fillText(node, graph[node].x, graph[node].y)
        }
    }

    if(hoverElement !== null){
        let highlightElements = new Set([hoverElement]);
        let stack = [hoverElement];
        while(stack.length > 0){
            let node = stack.pop();
            let parents = graph[node].parents;
            if(parents.length > 0){
                stack.push(...parents);
                parents.forEach((n) => highlightElements.add(n));
            }
        }

        ctxt.lineWidth = 5;
        ctxt.strokeStyle = window.getComputedStyle(document.documentElement).getPropertyValue('--highlightColor');
        for(let node of highlightElements){
            for(let parent of graph[node].parents){
                ctxt.beginPath();
                ctxt.moveTo(graph[node].x, graph[node].y);
                ctxt.bezierCurveTo(graph[node].x, graph[parent].y, graph[parent].x, graph[node].y, graph[parent].x, graph[parent].y);
                ctxt.stroke();
            }
        }
        
        ctxt.fillStyle = window.getComputedStyle(document.documentElement).getPropertyValue('--supportColor');
        for(let node of highlightElements){
            if(!node.startsWith("_")){
                roundedRect(ctxt, graph[node].x - NODE_WIDTH / 2, graph[node].y - NODE_HEIGHT / 2, NODE_WIDTH, NODE_HEIGHT, NODE_RADIUS);
                ctxt.fill();
            }
        }

        ctxt.textAlign = "center";
        ctxt.textBaseline = "middle";
        ctxt.fillStyle = window.getComputedStyle(document.documentElement).getPropertyValue('--highlightColor');
        ctxt.font = `${NODE_FONT_SIZE}px Arial`;
        for(let node of highlightElements){
            if(!node.startsWith("_")){
                ctxt.fillText(node, graph[node].x, graph[node].y)
            }
        }
    }

    ctxt.restore();
}

function roundedRect(ctxt, x, y, width, height, radius) {
    ctxt.beginPath();
    ctxt.moveTo(x + radius, y);
    ctxt.lineTo(x + width - radius, y);
    ctxt.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctxt.lineTo(x + width, y + height - radius);
    ctxt.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctxt.lineTo(x + radius, y + height);
    ctxt.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctxt.lineTo(x, y + radius);
    ctxt.quadraticCurveTo(x, y, x + radius, y);
    ctxt.closePath();
}

/* transfrom calculations (for zoom) */
function matrixMultiplication(matrix1, matrix2){
    let result = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for(let i=0;i<3;i++){
        for(let j=0;j<3;j++){
            for (let k=0;k<3;k++){
                result[i*3+j] += matrix1[i*3+k] * matrix2[k*3+j];
            }
        }
    }
    return result;
}

function matrixInverse(m){
    let det = m[0] * (m[4] * m[8] - m[7] * m[5]) - m[1] * (m[3] * m[8] - m[5] * m[6]) + m[2] * (m[3] * m[7] - m[4] * m[6]);

    if(det == 0){
        return [1, 0, 0, 0, 1, 0];
    }

    let invdet = 1 / det;

    return [
        (m[4] * m[8] - m[7] * m[5]) * invdet,
        (m[2] * m[7] - m[1] * m[8]) * invdet,
        (m[1] * m[5] - m[2] * m[4]) * invdet,
        (m[5] * m[6] - m[3] * m[8]) * invdet,
        (m[0] * m[8] - m[2] * m[6]) * invdet,
        (m[3] * m[2] - m[0] * m[5]) * invdet,
        (m[3] * m[7] - m[6] * m[4]) * invdet,
        (m[6] * m[1] - m[0] * m[7]) * invdet,
        (m[0] * m[4] - m[3] * m[1]) * invdet
    ];
}

function mapTransformPoint(x, y, mapTransform){
    let inverse = matrixInverse(mapTransform);
    return [
        x * inverse[0] + y * inverse[1] + inverse[2],
        x * inverse[3] + y * inverse[4] + inverse[5]
    ];
}

function zoom(x, y, zoomIn, mapTransform){
    let [x_, y_] = mapTransformPoint(x, y, mapTransform);
    
    let result = matrixMultiplication(
        mapTransform,
        [
            1, 0, x_,
            0, 1, y_,
            0, 0, 1
        ]
    );

    if(zoomIn){
        result = matrixMultiplication(
            result,
            [
                MAP_SCALING_FACTOR, 0, 0,
                0, MAP_SCALING_FACTOR, 0,
                0, 0, 1
            ]
        );
    }else{
        result = matrixMultiplication(
            result,
            [
                1 / MAP_SCALING_FACTOR, 0, 0,
                0, 1 / MAP_SCALING_FACTOR, 0,
                0, 0, 1
            ]
        );
    }
               
    result = matrixMultiplication(
        result,
        [
            1, 0, -x_,
            0, 1, -y_,
            0, 0, 1
        ]
    );

    return result;
}

function mapGetHoverElement(x, y){
    let transform = mapTransform.slice();

    transform[2] += pointerOffsetPosition[0];
    transform[5] += pointerOffsetPosition[1];
    
    let [x_, y_] = mapTransformPoint(x, y, transform);

    for(let node of Object.keys(graph)){
        if(!node.startsWith("_") && graph[node].x - NODE_WIDTH/2 < x_ && graph[node].x + NODE_WIDTH/2 > x_ && graph[node].y - NODE_HEIGHT/2 < y_ && graph[node].y + NODE_HEIGHT/2 > y_){
            return node
        }
    }

    return null;
}
