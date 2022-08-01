let CONTENT;


const CONTENT_TYPE = Symbol("text_type");


/* page contents */
let contents;
let contentGraph;

let contentTitle;
let contentCard;
let contentText;
let contentImage;


async function contentSetup(){
    CONTENT = (await (await fetch(`./_content.txt`)).text()).toString().split("\n").filter((a) => a.length > 0);

    contentTitle = document.getElementById("contentTitle");
    contentCard = document.getElementById("contentCard");
    contentText = document.getElementById("contentText");
    contentImage = document.getElementById("contentImage");

    await loadContents();
    contentGraph = [];
    for(let content of Object.keys(contents)){
        contentGraph[content] = {
            "parents": contents[content].split("---")[0].split("\n").map((a) => a.trim()).filter((a) => a.length > 0),
            "children": []
        };
    }
    for(let content of Object.keys(contentGraph)){
        for(let parent of contentGraph[content].parents){
            try{
                contentGraph[parent].children.push(content);
            }catch{
                console.warn(`parent ${parent} does not exist for child ${content}`);
            }
        }
    }
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
    let promises = []
    for(let contentName of CONTENT){
        promises.push(loadContent(contents, contentName));
    }
    await Promise.all(promises);
}

function getContentParents(contentName){
    return contentGraph[contentName].parents.slice();
}

function getContentChildren(contentName){
    return contentGraph[contentName].children.slice();
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
    element.onclick = () => {
        contentImage.src = element.src;
        contentImage.style.opacity = 1;
        contentImage.style.zIndex = 1;

        contentImage.onclick = () => {
            contentImage.style.opacity = 0;
            contentImage.style.zIndex = -1;
        }
    }
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
    element.style.textAlign = "center";
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
    let gridColumns = "";
    for(let item of items){
        let itemElement = renderContentItem(contentName, item);
        if(itemElement[CONTENT_TYPE] === "img"){
            gridColumns += "auto "
        }else{
            gridColumns += "1fr "
        }
        rowElement.appendChild(itemElement);
    }
    rowElement.style.display = "grid";
    if(!gridColumns.includes("1fr")){
        gridColumns = gridColumns.replaceAll("auto", "1fr");
    }
    rowElement.style.gridTemplateColumns = gridColumns;
    return rowElement;
}

function renderContentNav(links){
    let nav = document.createElement("aside");
    nav[CONTENT_TYPE] = "nav";
    for(let link of links){
        let linkElement = document.createElement("a");
        linkElement.onclick = () => loadPageContent(link, true);
        linkElement.innerText = link;
        nav.appendChild(linkElement);
    }
    return nav;
}

function renderContent(contentName){
    // title
    contentTitle.innerText = contentName;

    // card
    let cardList = getContentCardList(contentName);
    contentCard.innerHTML = "";
    for(let row of cardList){
        let rowElement = renderContentTableRow(contentName, row);
        contentCard.appendChild(rowElement)
    }
    contentCard.classList.add("table");
    
    // main
    let prefix = renderContentNav(getContentParents(contentName));
    let suffix = renderContentNav(getContentChildren(contentName));
    let text = getContentText(contentName, false);

    contentText.innerHTML = "";
    contentText.appendChild(prefix);

    let isTable = false;
    let tableElement = document.createElement("div");
    
    for(let line of text.split("\n")){
        line = line.trim();
        if(isTable || line.startsWith("{")){
            if(line.endsWith("}")){
                isTable = false;
                tableElement.classList.add("table");
                contentText.appendChild(tableElement);
                tableElement = document.createElement("div")
            }else{
                isTable = true;
                if(line.startsWith("{")){
                    continue;
                }
                tableElement.appendChild(renderContentTableRow(contentName, line));
            }
        }else if(line.length === 0){
            contentText.appendChild(document.createElement("br"));
        }else{
            let element = renderContentItem(contentName, line);
            let previousElement = contentText.lastElementChild;
            let textElements = ["text", "inlinemath"];

            if(previousElement !== null && (textElements.includes(element[CONTENT_TYPE]) && textElements.includes(previousElement[CONTENT_TYPE]))){
                previousElement.innerHTML += ` ${element.innerHTML}`;
            }else{
                contentText.appendChild(element);
            }
        }
    }

    contentText.appendChild(suffix);
}
