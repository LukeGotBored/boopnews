let news;
let isFetching = false;
if(!localStorage.getItem("topic")) localStorage.setItem("topic", "world");
let page = 1;



document.addEventListener('DOMContentLoaded', async function() {
    let oldScrollPerc;
    let direction;

    // get the localStorage topic and set #topic-select to it
    document.getElementById("topic-select").value = localStorage.getItem("topic");


    document.getElementById("topic-select").addEventListener("change", function(e){
        // get the selected item
        let selected = e.target.value;
        // save the selected item in localStorage
        localStorage.setItem("topic", selected);
    })


    document.getElementById("main").addEventListener('scroll', function(e){
        // get the direction of the scroll
        let scrollPerc = e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight) 
        // check if it's greater than the old scroll position
        if(scrollPerc > oldScrollPerc){
            // then the user is scrolling down
            direction = "down";
        } else {
            // otherwise the user is scrolling up
            direction = "up";
        }

        oldScrollPerc = e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight)


        
        console.log(direction);
        if(scrollPerc > 0.9 && !isFetching && direction == "down"){
            page++;
            fetchNews();
        }
    })


    // check if indexedDB is supported
    if (!window.indexedDB) {
        console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
    }

    // check if there's any news cached in indexedDB
    var request = window.indexedDB.open("news", 1);

    request.onerror = function(event) {
        console.log("[Error]", "Something went wrong while trying to open the local database.");
    }
    

    // fetch the latest news from newscatcherapi
    await fetchNews();  


    document.getElementsByClassName("loading")[0].style.opacity = "0";
    document.getElementsByClassName("loading")[0].style.pointerEvents = "none";



 
})




window.trim = function(string, size){
    if(string.length > size){
        return string.substring(0, size) + "...";
    }
    return string;
}

window.requestTopic = function(){
    // alert with field
    let input = prompt("Enter a topic to search for\n(Current topic: " + localStorage.getItem("topic") + ")");
    if(input == null){
        return;
    }
    // check if the input is empty with regex
    if(input.match(/^\s*$/)){
        return;
    }

    // save the input in localStorage
    localStorage.setItem("topic", input);
    // reload the page
    location.reload();
}

window.fetchNews = async function(){
    isFetching = true
    await fetch(`https://api.newscatcherapi.com/v2/latest_headlines?countries=US&lang=en&topic=${encodeURIComponent(localStorage.getItem("topic").toLocaleLowerCase())}&page_size=10&page=${page}`, {
        method: "GET",
        headers: {
            'x-api-key': 'YOUR-API-KEY-HERE'
        }
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        // save the fetched json in a variable
        news = data.articles;
        console.log(news);
        let titles = [];

        for(let i = 0; i < news.length; i++) {
            // create a new article element
            if(news.includes(news[i].title)){
                return
            }
            titles.push(news[i].title);

            
            let article = `
                <div class="item" onclick="window.open('${news[i].link}')">
                    ${news[i].media ? `<div class="item-img" style="background-image: url(${news[i].media})"></div>` : ``}
                    <div class="item-content">
                        <div class="item-title">${trim(news[i].title, 100)}</div>
                        <div class="item-data">
                            <span id="author"><img src="https://icons.duckduckgo.com/ip3/${news[i].clean_url}.ico" class="author-ico" alt="author icon"> ${news[i].author ? news[i].author : news[i].clean_url}</span><br><span id="date">${news[i].published_date}</span>
                        </div>
                    </div>
                </div>
        `

        
            document.getElementById("main").innerHTML += article
            isFetching = false;
        }
    })
}


window.switchPage = function(page){
    let allowedPages = ["main", "search", "settings"];
    if(allowedPages.includes(page)){
        // get the page with the dataset-active true
        let activePage = document.querySelector(`[data-active="true"]`);
        // set the dataset-active false to the active page
        activePage.dataset.active = "false";

        // get the page with the id of page
        let pageToSwitchTo = document.getElementById(page);
        // set the dataset-active to true
        pageToSwitchTo.dataset.active = true;
    } else {
        console.log("[Error]", "Page not found.");
    }



    switch(page){
        case "main":
            document.getElementsByClassName("navbar")[0].innerHTML = `
            <div class="nav-left">
            <div class="nav-title">
                BoopNews
            </div>
            </div>
            <div class="nav-right">
                <!-- <div class="nav-item material-symbols-outlined" id="nav-add" onclick="">add</div> -->
                <div class="nav-item material-symbols-outlined" id="nav-settings" onclick="switchPage('settings')">settings</div>
            </div>
        `
        break;

        case "search":
            document.getElementsByClassName("navbar")[0].innerHTML = `
            <div class="nav-left">
            <div class="nav-back material-symbols-outlined" onclick="switchPage("main")">arrow_back</div>
            <div class="nav-title">
                Search
            </div>
            </div>
            <div class="nav-right">
            </div>
        `
        break;

        case "settings":
            document.getElementsByClassName("navbar")[0].innerHTML = `
            <div class="nav-left">
            <div class="nav-back material-symbols-outlined" onclick="location.reload()">arrow_back</div>
            <div class="nav-title">
                Settings
            </div>
            </div>
            <div class="nav-right">
            </div>
        `
        break;
    }
}


