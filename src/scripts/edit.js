let Octokit;
let octokit;

let editAuthenticationElement;

let editParents;
let editTitle;
let editCard;
let editText;

async function editSetup(){
    Octokit = (await import("https://cdn.skypack.dev/@octokit/rest")).Octokit;

    editAuthenticationElement = document.getElementById("editAuthentication");
    editAuthenticationElement.style.display = "none";

    editParents = document.getElementById("editParents");
    editTitle = document.getElementById("editTitle");
    editCard = document.getElementById("editCard");
    editText = document.getElementById("editText");
}

async function setupOctokit(){
    let accessTokenInput = document.getElementById("accessTokenInput");
    let authenticateButton = document.getElementById("authenticateButton");

    if(editAuthenticationElement.style.display === ""){
        return;
    }

    editAuthenticationElement.style.display = "";

    accessTokenInput.focus();
    
    await new Promise((resolve, reject) => {
        authenticateButton.addEventListener("click", async () => {
            if(accessTokenInput.value.length > 0){
                accessTokenInput.disabled = true;
                authenticateButton.disabled = true;

                octokit = new Octokit({
                    auth: accessTokenInput.value
                });
            
                try{
                    let result = await octokit.repos.get({
                        "owner": "AntVil",
                        "repo": "ChemieStern"
                    });

                    resolve();
                }catch{
                    octokit = undefined;

                    accessTokenInput.disabled = false;
                    authenticateButton.disabled = false;
                }
            }
        });
    });

    editAuthenticationElement.style.display = "none";
    document.getElementById("editAuthenticationBackground").style.display = "none";
}

function createParentSelect(selected){
    let container = document.createElement("div");
    let select = document.createElement("select");
    for(let contentName of CONTENT){
        let option = document.createElement("option");
        option.value = contentName;
        option.innerText = contentName;
        select.appendChild(option);
    }
    if(selected !== null){
        select.value = selected;
    }
    container.appendChild(select);
    
    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = "x"
    deleteButton.onclick = () => {
        container.remove();
    }
    container.appendChild(deleteButton);
    
    return container;
}

async function editContent(contentName, pushState){
    

    if(octokit === undefined){
        setupOctokit();
    }

    let editAttribute;
    let content;
    if(contentName === null){
        content = "------"
        editAttribute = null;
    }else if(contentName === undefined){
        content = contents[contentTitle.innerText];
        editAttribute = contentTitle.innerText;
    }else{
        content = contents[contentName];
        editAttribute = contentName;
    }

    loadPageEdit(editAttribute, pushState);

    let [parents, card_, text] = content.split("---");
    let [title, ...card] = card_.split("\n").map((a) => a.trim()).filter((a) => a.length > 0);
    parents = parents.split("\n").map((a) => a.trim()).filter((a) => a.length > 0);
    text = text.trim();

    if(title === undefined){
        title = "";
    }

    editTitle.value = title;
    editCard.value = card.join("\n");
    editText.value = text;
    
    editParents.innerHTML = "";
    for(let parent of parents){
        let select = createParentSelect(parent);
        editParents.appendChild(select);
    }
    let addButton = document.createElement("button");
    addButton.innerHTML = "+";
    addButton.onclick = () => {
        editParents.insertBefore(createParentSelect(null), addButton);
    }
    editParents.appendChild(addButton);

    try{
        if(title !== "" && getContentChildren(title).length > 0){
            editTitle.disabled = true;
        }
    }catch{

    }
}

async function commit(){
    let parents = [];
    for(let container of editParents.children){
        let select = container.children[0];
        if(select !== undefined){
            parents.push(select.value);
        }
    }

    let content = `${
        parents.join("\n")
    }\n---\n${
        editTitle.value.trim()
    }\n${
        editCard.value.split("\n").map((a) => `    ${a.trim()}`).join("\n")
    }\n---\n${
        editText.value.trim()
    }\n`;

    let result = await octokit.repos.createOrUpdateFileContents({
        "owner": "AntVil",
        "repo": "ChemieStern",
        "path": `src/content/${editTitle.value}/content.txt`,
        "message": `adding content ${editTitle.value}`,
        "content": Base64.encode(content)
    });

    contents[editTitle.value] = content;

    await Promise.all([
        searchSetup(),
        mapSetup()
    ]);
    
    history.back();
}
