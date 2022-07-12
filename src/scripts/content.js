const CONTENT = [
    "Proton",
    "Elektron",
    "Neutron",
    "Atom",
    "Periodensystem",
    "Atombindung"
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
    //contentPage.innerText = contents[contentID];

    //contentPage.innerHTML = "";

    let card = getContentCard(contentID);
    console.log(card)
    let cardElement = document.getElementById("contentCard");
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
                itemElement.src = `./content/${CONTENT[contentID]}/images/images/${item.slice(1, item.length-1)}`;
            }else if(item.includes("$")){
                if(item.startsWith("$$") && item.endsWith("$$")){
                    itemElement = document.createElement("div");
                    katex.render(item.slice(2, item.length-2), itemElement, {
                        throwOnError: false
                    });
                    itemElement.style.textAlign = "center";
                }else{
                    itemElement = document.createElement("div");
                    for(let sub of item.match(/\$([^()]*)\$/g)){
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
    document.getElementById("contentText").innerText = getContentText(contentID, false);
}
