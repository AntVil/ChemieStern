let mapPage;
let searchPage;
let aboutPage;
let headerToggle;

let pages;

window.onload = function(){
    mapPage = document.getElementById("map");
    searchPage = document.getElementById("search");
    aboutPage = document.getElementById("about");
    headerToggle = document.getElementById("headerToggle");

    pages = [mapPage, searchPage, aboutPage];

    loadPageSearch();
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

function search(){
    let searchInput = document.getElementById("searchInput");
    searchInput.blur();
    let searchButton = document.getElementById("searchButton");
    searchButton.blur();

    let searchString = searchInput.value;
    for(let contentName of CONTENT){
        let path = `${window.location}`.split("index.html")[0];
        console.log(`${path}content/${contentName}/content.txt`)
        let content = fetch(`${window.location}/content/${contentName}/content.txt`);
        console.log(content)
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
