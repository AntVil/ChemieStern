const CONTENT = [
    "Proton",
    "Elektron",
    "Neutron",
    "Atom",
    "Ion",
    "Periodensystem",
    "Isotop",
    "Atombindung",
    "Ionbindung"
];


/* page contents */
let contents;


async function loadContent(){
    contents = []
    for(let contentName of CONTENT){
        try{
            contents.push((await (await fetch(`./content/${contentName}/content.txt`)).text()).toString())
        }catch{
            console.warn(`could not find ${contentName}`);
        }
    }
}

function getContentName(contentID){
    return contents[contentID].match(/---([^()]*)---/)[1].split("\n").map((a) => a.trim()).filter((a) => a.length > 0)[0];
}

function getContentCard(contentID){
    return contents[contentID].match(/---([^()]*)---/)[1].split("    ").slice(1).map((a) => a.trim())
}

function getContentText(contentID, removeSpecial){
    let result = contents[contentID].slice(contents[contentID].lastIndexOf("---") + 3)
    if(removeSpecial){
        result = result.replaceAll(/[\n]+|#.*/ig, " ").replaceAll(/[ ]+/ig, " ")
    }
    return result
}

function renderContent(contentID){
    let card = getContentCard(contentID);
    
    let cardElement = document.getElementById("contentCard");
    cardElement.innerHTML = "";
    for(let row of card){
        let items = row.split(":");
        let rowElement = document.createElement("div");
        rowElement.style.display = "grid";
        rowElement.style.gridTemplateColumns = `repeat(${items.length}, 1fr)`;
        for(let item of items){
            item = item.trim()
            let itemElement;
            if(item.startsWith("[") && item.endsWith("]")){
                itemElement = document.createElement("img");
                itemElement.src = `./content/${CONTENT[contentID]}/images/${item.slice(1, item.length-1)}`;
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
    }

    document.getElementById("contentTitle").innerText = getContentName(contentID);

    let text = getContentText(contentID, false);
    let textElement = document.getElementById("contentText");
    textElement.innerHTML = "";
    let insideTable = false;
    let tableContent = [];

    for(let line of text.replaceAll(/\n\n+/g, "\n\n").split("\n")){
        line = line.trim();

        let lineElement;

        if(line.length == 0){
            lineElement = document.createElement("br");
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
                            itemElement.src = `./content/${CONTENT[contentID]}/images/${item.slice(1, item.length-1)}`;
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
                    lineElement.appendChild(rowElement);
                }
            }
        }else if(line.startsWith("#")){
            lineElement = document.createElement("div");
            lineElement.innerText = line.replaceAll(/\#*/g, "");
            lineElement.style.fontWeight = "bold";
            lineElement.style.textDecoration = "underline";
        }else if(line.startsWith("[") && line.endsWith("]")){
            lineElement = document.createElement("img");
            lineElement.src = `./content/${CONTENT[contentID]}/images/${line.slice(1, line.length-1)}`;
        }else if(line.startsWith("$$") && line.endsWith("$$")){
            lineElement = document.createElement("div");
            katex.render(item.slice(2, item.length-2), lineElement, {
                throwOnError: false
            });
            lineElement.style.textAlign = "center";
        }else if(line.includes("$")){
            lineElement = document.createElement("div");
            for(let sub of line.match(/\$([^\$]*)\$/g)){
                line = line.replace(sub, katex.renderToString(sub.slice(1, sub.length-1), {
                    throwOnError: false
                }));
            }
            itemElement.innerHTML = line;
        }else{
            lineElement = document.createElement("div");
            lineElement.innerText = line;
        }
        
        if(!insideTable && lineElement !== undefined){
            textElement.appendChild(lineElement);
        }
    }
}
