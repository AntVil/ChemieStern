/* pages */
let mapPage;
let searchPage;
let aboutPage;
let contentPage;

let pages;


window.onload = async function(){
    await contentSetup();
    await Promise.all([
        searchSetup(),
        mapSetup()
    ]);
    
    mapPage = document.getElementById("map");
    searchPage = document.getElementById("search");
    aboutPage = document.getElementById("about");
    contentPage = document.getElementById("content");

    pages = [mapPage, searchPage, aboutPage, contentPage];

    for(let p of pages){
        p.style.opacity = "0";
        p.style.zIndex = "-1";
    }

    window.onpopstate = (e) => {
        try{
            if(e.state.page === contentPage.id){
                loadPageContent(e.state.attribute);
            }else{
                loadPage(document.getElementById(e.state.page), null);
            }
        }catch{
            history.go(-1);
        }
    };

    document.getElementById("pageLoader").style.display = "none";

    loadPageMap();
}


function loadPage(page, pushState){
    if(pushState !== null){
        history.pushState(pushState, "");
    }

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
    if(mapPage.style.opacity === "0"){
        loadPage(mapPage, {page: mapPage.id, attribute: null});
    }else{
        loadPage(mapPage, null);
    }
}

function loadPageSearch(){
    if(searchPage.style.opacity === "0"){
        loadPage(searchPage, {page: searchPage.id, attribute: null});
    }else{
        loadPage(searchPage, null);
    }
}

function loadPageAbout(){
    if(aboutPage.style.opacity === "0"){
        loadPage(aboutPage, {page: aboutPage.id, attribute: null});
    }else{
        loadPage(aboutPage, null);
    }
}

function loadPageContent(contentName){
    loadPage(contentPage, {page: contentPage.id, attribute: contentName});
    renderContent(contentName);
}
