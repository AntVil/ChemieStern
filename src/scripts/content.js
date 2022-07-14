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
    "Isomer",
    "Kunststoff",
    "Katalysator",
    "Redoxreaktion"
];


const CONTENT_TYPE = Symbol("text_type");


/* page contents */
let contents;


async function contentSetup(resolve, reject){
    await loadContents();
    resolve();
}


async function loadContent(contents, contentName){
    try{
        let content = (await (await fetch(`./content/${contentName}/content.txt`)).text()).toString();
        contents[contentName] = content.replaceAll("\r", "").replaceAll(/\n\n+/g, "\n\n");
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

function getContentCardList(contentName){
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

function renderContentImage(contentName, imageSrc){
    let element = document.createElement("img");
    element[CONTENT_TYPE] = "img";
    element.src = `./content/${contentName}/images/${imageSrc}`;
    return element;
}

function renderContentInlineMath(contentName, text){
    let element = document.createElement("div");
    element[CONTENT_TYPE] = "inlinemath";
    for(let sub of text.match(/\$([^\$]*)\$/g)){
        text = text.replace(sub, katex.renderToString(sub.slice(1, sub.length-1), {
            throwOnError: false
        }));
    }
    element.innerHTML = text;
    return element;
}

function renderContentBlockMath(contentName, math){
    let element = document.createElement("div");
    element[CONTENT_TYPE] = "blockmath";
    katex.render(math, element, {
        throwOnError: false
    });
    return element;
}

function renderContentHeading(contentName, text){
    let element = document.createElement("div");
    element[CONTENT_TYPE] = "heading";
    element.innerText = text;
    element.style.fontWeight = "bold";
    element.style.textDecoration = "underline";
    return element;
}

function renderContentTextline(contentName, text){
    let element = document.createElement("div");
    element[CONTENT_TYPE] = "text";
    element.innerText = text;
    return element;
}


function renderContentItem(contentName, item){
    item = item.trim();
    if(item.startsWith("[") && item.endsWith("]")){
        return renderContentImage(contentName, item.slice(1, item.length-1));
    }else if(item.includes("$")){
        if(item.startsWith("$$") && item.endsWith("$$")){
            return renderContentBlockMath(contentName, item.slice(2, item.length-2));
        }else{
            return renderContentInlineMath(contentName, item);
        }
    }else if(item.startsWith("#")){
        return renderContentHeading(contentName, item.slice(1).trim());
    }else{
        return renderContentTextline(contentName, item);
    }
}


function renderContentTableRow(contentName, row){
    let rowElement = document.createElement("div");
    let items = row.split(":");
    for(let item of items){
        let itemElement = renderContentItem(contentName, item);
        rowElement.appendChild(itemElement);
    }
    rowElement.style.display = "grid";
    rowElement.style.gridTemplateColumns = `repeat(${items.length}, 1fr)`;
    return rowElement;
}


function renderContent(contentName){
    // title
    document.getElementById("contentTitle").innerText = getContentName(contentName);

    // card
    let cardList = getContentCardList(contentName);
    let cardElement = document.getElementById("contentCard");
    cardElement.innerHTML = "";
    for(let row of cardList){
        let rowElement = renderContentTableRow(contentName, row);
        cardElement.appendChild(rowElement)
    }
    cardElement.classList.add("table");
    
    // main
    let text = getContentText(contentName, false);
    let textElement = document.getElementById("contentText");
    textElement.innerHTML = "";

    let isTable = false;
    let tableElement = document.createElement("div");
    
    for(let line of text.split("\n")){
        line = line.trim();
        if(isTable || line.startsWith("{")){
            if(line.endsWith("}")){
                isTable = false;
                tableElement.classList.add("table");
                textElement.appendChild(tableElement);
                tableElement = document.createElement("div")
            }else{
                isTable = true;
                if(line.startsWith("{")){
                    continue;
                }
                tableElement.appendChild(renderContentTableRow(contentName, line));
            }
        }else if(line.length === 0){
            textElement.appendChild(document.createElement("br"));
        }else{
            let element = renderContentItem(contentName, line);
            let previousElement = textElement.lastElementChild;

            if(previousElement !== null && (element[CONTENT_TYPE] === "text" && previousElement[CONTENT_TYPE] === "text")){
                previousElement.innerText += ` ${element.innerText}`;
            }else{
                textElement.appendChild(element);
            }
        }
    }
}
