let mapPage;
let searchPage;
let aboutPage;
let headerToggle;

let pages;

let contents;

window.onload = function(){
    loadContent();
    
    mapPage = document.getElementById("map");
    searchPage = document.getElementById("search");
    aboutPage = document.getElementById("about");
    headerToggle = document.getElementById("headerToggle");

    pages = [mapPage, searchPage, aboutPage];

    loadPageSearch();
}

async function loadContent(){
    contents = []
    for(let contentName of CONTENT){
        contents.push((await (await fetch(`./content/${contentName}/content.txt`)).text()).toString())
    }
}


function loadPage(page){
    for(let p of pages){
        if(p !== page){
            p.style.opacity = "0";
            p.style.zIndex = "-1";
        }
    }
    page.style.opacity = "1";
    page.style.zIndex = "0";
    headerToggle.checked = false;
}


function loadPageMap(){
    loadPage(mapPage);
}

function loadPageSearch(){
    loadPage(searchPage);
}

function loadPageAbout(){
    loadPage(aboutPage);
}

function loadPageContent(){
    loadPage(aboutPage);
}

async function search(){
    let searchInput = document.getElementById("searchInput");
    searchInput.blur();
    let searchButton = document.getElementById("searchButton");
    searchButton.blur();

    let searchString = `${searchInput.value}`;

    let mainContents = [];
    for(let i=0;i<contents.length;i++){
        let content = contents[i];
        
        let mainContent = content.slice(0, Math.min(content.lastIndexOf("---") + 200, content.length));
        let mainWords = mainContent.toLowerCase().split(/[# $\n\[\]()&.:,\-?/]+/);
        let scores = mainWords.map((string) => string_similarity(string, searchString))
        mainContents.push(
            {
                "contentID": i,
                "score": Math.max(...scores)
            }
        );
    }

    let results = mainContents.filter(
        (a) => a["score"] >= 0.0
    ).sort(
        (a, b) => b["score"] - a["score"]
    ).map(
        (a) => a["contentID"]
    );

    console.log(results)
    
    let resultsElement = document.getElementById("searchResults")
    resultsElement.innerHTML = "";

    for(let resultID of results){
        let resultElement = document.createElement("div");
        let resultImage = document.createElement("img");
        let resultText = document.createElement("div");
        let resultTitle = document.createElement("div");
        let resultContent = document.createElement("div");

        resultImage.src = `./content/${CONTENT[resultID]}/images/${contents[resultID].match(/\[([^()]*)\]/)[1]}`;
        resultImage.onerror = (e) => {
            resultImage.onerror = null;
            resultImage.src = "./images/defaultSearchImage.svg";
        };

        resultTitle.innerText = contents[resultID].match(/---([^()]*)---/)[1].split("\n").map((a) => a.trim()).filter((a) => a.length > 0)[0];
        resultContent.innerText = contents[resultID].slice(contents[resultID].lastIndexOf("---") + 3).replaceAll(/[\n#]+/ig, " ").replaceAll(/[ ]+/ig, " ");

        console.log( resultContent.innerText )

        resultText.appendChild(resultTitle);
        resultText.appendChild(resultContent);

        resultElement.appendChild(resultImage);
        resultElement.appendChild(resultText);

        resultsElement.appendChild(resultElement);
    }
}




function get_bigrams(string){
    let s = string.toLowerCase()
    let v = s.split("");
    for(let i=0; i<v.length; i++){
        v[i] = s.slice(i, i + 2);
    }
    return v;
}
  
function string_similarity(str1, str2){
    if(str1.length > 0 && str2.length > 0){
        let pairs1 = get_bigrams(str1);
        let pairs2 = get_bigrams(str2);
        let union = pairs1.length + pairs2.length;
        let hits = 0;
        for(let x=0;x<pairs1.length;x++){
            for(let y=0;y<pairs2.length;y++){
                if(pairs1[x] == pairs2[y]){
                    hits++;
                }
            }
        }
        if(hits > 0){
            return ((2.0 * hits) / union);
        }
    }
    return 0.0
}
