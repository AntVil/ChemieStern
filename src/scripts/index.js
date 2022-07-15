/* pages */
let mapPage;
let searchPage;
let aboutPage;
let contentPage;

let pages;


window.onload = async function(){
    await Promise.all(
        [
            new Promise(contentSetup),
            new Promise(searchSetup),
            new Promise(mapSetup),
        ]
    );
    
    mapPage = document.getElementById("map");
    searchPage = document.getElementById("search");
    aboutPage = document.getElementById("about");
    contentPage = document.getElementById("content");

    pages = [mapPage, searchPage, aboutPage, contentPage];

    document.getElementById("pageLoader").style.display = "none";

    loadPageMap();
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
    document.getElementById("headerToggle").checked = false;
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

function loadPageContent(contentName){
    loadPage(contentPage);
    renderContent(contentName);
}
