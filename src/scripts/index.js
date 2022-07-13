/* pages */
let mapPage;
let searchPage;
let aboutPage;
let contentPage;

let pages;


window.onload = function(){
    loadContents();
    
    mapPage = document.getElementById("map");
    searchPage = document.getElementById("search");
    aboutPage = document.getElementById("about");
    contentPage = document.getElementById("content");

    pages = [mapPage, searchPage, aboutPage, contentPage];

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
