const CONTENT = [
    "Proton",
    "Elektron",
    "Neutron",
    "Atom",
    "Ion",
    "Periodensystem",
    "Isotop",
    "Atombindung",
    "Ionenbindung",
    "Metallbindung",
    "Reaktionsgleichung",
    "Molekül",
    "Nomenklatur",
    "Funktionelle Gruppe",
    "Katalysator",
    "Redoxreaktion"
];


/* page contents */
let contents;


async function loadContent(contents, contentName){
    try{
        contents[contentName] = (await (await fetch(`./content/${contentName}/content.txt`)).text()).toString().replaceAll("\r", "");
    }catch{
        console.warn(`could not find ${contentName}`);
    }
}

async function loadContents(){
    contents = {};
    for(let contentName of CONTENT){
        loadContent(contents, contentName);
    }
}

function getContentName(contentName){
    return contents[contentName].split("---")[1].split("\n")[1].trim()
}

function getContentCard(contentName){
    let result = contents[contentName].split("---")[1].split("\n").slice(2).map((a) => a.trim()).filter((a) => a.length > 0);
    return result;
}

function getContentText(contentName, removeSpecial){
    let result = contents[contentName].slice(contents[contentName].lastIndexOf("---") + 3).split("\n");
    
    while(result.length > 0 && result[0].trim().length === 0){
        result.shift();
    }
    while(result.length > 0 && result[result.length-1].trim().length === 0){
        result.pop();
    }

    result = result.join("\n");

    if(removeSpecial){
        result = result.replaceAll(/[\n]+|#.*/ig, " ").replaceAll(/[ ]+/ig, " ")
    }
    return result
}

function renderContent(contentName){
    let card = getContentCard(contentName);
    
    let cardElement = document.getElementById("contentCard");
    cardElement.innerHTML = "";
    for(let row of card){
        let items = row.split(":");
        let rowElement = document.createElement("div");
        rowElement.style.display = "grid";
        rowElement.style.gridTemplateColumns = `repeat(${items.length}, 1fr)`;
        for(let item of items){
            item = item.trim();
            let itemElement;
            if(item.startsWith("[") && item.endsWith("]")){
                itemElement = document.createElement("img");
                itemElement.src = `./content/${contentName}/images/${item.slice(1, item.length-1)}`;
            }else if(item.includes("$")){
                if(item.startsWith("$$") && item.endsWith("$$")){
                    itemElement = document.createElement("div");
                    katex.render(item.slice(2, item.length-2), itemElement, {
                        throwOnError: false
                    });
                    itemElement.style.textAlign = "center";
                }else{
                    itemElement = document.createElement("div");
                    for(let sub of item.match(/\$([^\$]*)\$/g)){
                        item = item.replace(sub, katex.renderToString(sub.slice(1, sub.length-1), {
                            throwOnError: false
                        }));
                    }
                    itemElement.innerHTML = item;
                }
            }else{
                itemElement = document.createElement("div");
                itemElement.innerText = item;
            }
            
            rowElement.appendChild(itemElement);
        }
        cardElement.appendChild(rowElement);
        cardElement.classList.add("table");
    }

    document.getElementById("contentTitle").innerText = getContentName(contentName);

    let text = getContentText(contentName, false);
    let textElement = document.getElementById("contentText");
    textElement.innerHTML = "";
    let insideTable = false;
    let previousElement = "none";
    let tableContent = [];

    for(let line of text.replaceAll(/\n\n+/g, "\n\n").split("\n")){
        line = line.trim();

        let lineElement;

        if(line.length == 0){
            lineElement = document.createElement("br");
            previousElement = "linebreak";
        }else if(line.startsWith("{") || insideTable){
            insideTable = true;
            tableContent.push(line);
            if(line.endsWith("}")){
                insideTable = false;
                lineElement = document.createElement("div")
                for(let row of tableContent){
                    let items = row.replaceAll(/\{|\}/g, "").split(":");
                    let rowElement = document.createElement("div");
                    rowElement.style.display = "grid";
                    rowElement.style.gridTemplateColumns = `repeat(${items.length}, 1fr)`;
                    for(let item of items){
                        item = item.trim()
                        let itemElement;
                        if(item.startsWith("[") && item.endsWith("]")){
                            itemElement = document.createElement("img");
                            itemElement.src = `./content/${contentName}/images/${item.slice(1, item.length-1)}`;
                        }else if(item.includes("$")){
                            if(item.startsWith("$$") && item.endsWith("$$")){
                                itemElement = document.createElement("div");
                                katex.render(item.slice(2, item.length-2), itemElement, {
                                    throwOnError: false
                                });
                                itemElement.style.textAlign = "center";
                            }else{
                                itemElement = document.createElement("div");
                                for(let sub of item.match(/\$([^\$]*)\$/g)){
                                    console.log(sub);
                                    item = item.replace(sub, katex.renderToString(sub.slice(1, sub.length-1), {
                                        throwOnError: false
                                    }));
                                }
                                itemElement.innerHTML = item;
                            }
                        }else{
                            itemElement = document.createElement("div");
                            itemElement.innerText = item;
                        }
                        
                        rowElement.appendChild(itemElement);
                    }
                    if(rowElement.innerText !== ""){
                        lineElement.appendChild(rowElement);
                    }
                }
                lineElement.classList.add("table")
            }
            previousElement = "table";
        }else if(line.startsWith("#")){
            lineElement = document.createElement("div");
            lineElement.innerText = line.replaceAll(/\#*/g, "");
            lineElement.style.fontWeight = "bold";
            lineElement.style.textDecoration = "underline";
            previousElement = "heading";
        }else if(line.startsWith("[") && line.endsWith("]")){
            lineElement = document.createElement("img");
            lineElement.src = `./content/${contentName}/images/${line.slice(1, line.length-1)}`;
            previousElement = "image";
        }else if(line.startsWith("$$") && line.endsWith("$$")){
            lineElement = document.createElement("div");
            katex.render(line.slice(2, line.length-2), lineElement, {
                throwOnError: false
            });
            lineElement.style.textAlign = "center";
            previousElement = "math";
        }else if(line.includes("$")){
            lineElement = document.createElement("div");
            for(let sub of line.match(/\$([^\$]*)\$/g)){
                line = line.replace(sub, katex.renderToString(sub.slice(1, sub.length-1), {
                    throwOnError: false
                }));
            }
            lineElement.innerHTML = line;
            previousElement = "math";
        }else{
            if(previousElement === "text"){
                let element = textElement.children[textElement.children.length - 1];
                element.innerText = `${element.innerText} ${line}`.replaceAll(/  +/g, " ");
                continue;
            }
            lineElement = document.createElement("div");
            lineElement.innerText = line;
            previousElement = "text";
        }
        
        if(!insideTable && lineElement !== undefined){
            textElement.appendChild(lineElement);
        }
    }
}
