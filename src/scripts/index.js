const UNLOAD_PAGE = Symbol("unload_page");

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
        mapSetup(),
        editSetup()
    ]);
    
    mapPage = document.getElementById("map");
    searchPage = document.getElementById("search");
    aboutPage = document.getElementById("about");
    contentPage = document.getElementById("content");
    editPage = document.getElementById("edit");

    mapPage[UNLOAD_PAGE] = () => {};
    searchPage[UNLOAD_PAGE] = () => {};
    aboutPage[UNLOAD_PAGE] = () => {};
    contentPage[UNLOAD_PAGE] = () => {
        contentImage.click()
    };
    editPage[UNLOAD_PAGE] = () => {};

    pages = [mapPage, searchPage, aboutPage, contentPage, editPage];

    for(let p of pages){
        p.style.opacity = "0";
        p.style.zIndex = "-1";
    }

    document.addEventListener('keydown', function(e) {
        if(e.key === "Escape") {
            loadPageMap();
        }
    });

    window.onpopstate = (e) => {
        try{
            // prevents pushing
            document.getElementById(e.state.page).style.opacity = "1";

            if(e.state.page === contentPage.id){
                loadPageContent(e.state.attribute, false);
            }else if(e.state.page === editPage.id){
                loadPageEdit(null);
                editContent(e.state.attribute, false);
            }else{
                loadPage(document.getElementById(e.state.page), null);
            }
        }catch{
            history.go(-1);
        }
    };


    window.matchMedia('(prefers-color-scheme: dark)').onchange = (e) => {
        mapRender();
    }

    document.getElementById("pageLoader").style.display = "none";

    loadPageMap();
}


function closeHeader(){
    document.getElementById("headerToggle").checked = false;
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
        p[UNLOAD_PAGE]();
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
    mapRender();
}

function loadPageSearch(){
    if(searchPage.style.opacity === "0"){
        loadPage(searchPage, {page: searchPage.id, attribute: null});
    }else{
        loadPage(searchPage, null);
    }
    document.getElementById("searchInput").focus();
}

function loadPageAbout(){
    if(aboutPage.style.opacity === "0"){
        loadPage(aboutPage, {page: aboutPage.id, attribute: null});
    }else{
        loadPage(aboutPage, null);
    }
}

function loadPageContent(contentName, pushState){
    if(pushState){
        loadPage(contentPage, {page: contentPage.id, attribute: contentName});
    }else{
        loadPage(contentPage, null);
    }
    renderContent(contentName);
}

function loadPageEdit(editAttribute){
    if(editPage.style.opacity === "0"){
        loadPage(editPage, {page: editPage.id, attribute: editAttribute});
    }else{
        loadPage(editPage, null);
    }
}
