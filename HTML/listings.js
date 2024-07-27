async function connectToHost(hostid){

    try{
        const response = await fetch("/clientconnect", {
            method: "POST",
            mode: "no-cors",
            body: hostid
        });
        document.getElementById("modalHostAddress").innerText = await response.text();
        document.getElementById("modalConfirmPIN").onclick = function(){
            sendPin(hostid,document.getElementById("inputModalConnectionPIN").value);
        }
    }
    catch(err){
        console.error();
        document.getElementById("modalHostAddress").innerText = "";
        document.getElementById("modalConfirmPIN").onclick = "";
    }
    
}

async function sendPin(hostid,pin){
    const response = await fetch("/sendpin", {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({hostid: hostid,pin: pin})
    });

}

selectedApps = new Set();
function refreshSelectedApps(){
    var selectedAppsDiv = document.getElementById("selectedAppsDiv");
    selectedAppsDiv.innerHTML = "";
    for (const app of selectedApps){
        var button = document.createElement('button');
        button.type = "button";
        button.className = "btn btn-dark btn-sm me-1 rounded-4 ps-3"
        button.onclick = function(){
            removeSelectedApp(app);
        }
        var buttonText = document.createElement("p");
        buttonText.className = "m-0";
        buttonText.style = "white-space: pre;";
        buttonText.innerHTML = app + '  <i class="bi bi-x"></i>';
    
        button.appendChild(buttonText);
        selectedAppsDiv.appendChild(button);
    }
    filterListings();
}
function selectApp(app){
    if (!selectedApps.has(app)){
        selectedApps.add(app);
        var button = document.createElement('button');
        button.type = "button";
        button.className = "btn btn-dark btn-sm me-1 rounded-4 ps-3"
        button.onclick = function(){
            removeSelectedApp(app);
        }
        var buttonText = document.createElement("p");
        buttonText.className = "m-0";
        buttonText.style = "white-space: pre;";
        buttonText.innerHTML = app + '  <i class="bi bi-x"></i>';
    
        button.appendChild(buttonText);
        document.getElementById("selectedAppsDiv").appendChild(button);
        filterListings();
    }
    document.getElementById("searchBoxApps").value = "";
    document.getElementById("searchResults").innerHTML = "";
}
function removeSelectedApp(app){
    selectedApps.delete(app);
    refreshSelectedApps();
}

function searchApps(){

    const val = document.getElementById("searchBoxApps").value.toLowerCase();
    var searchResults = document.getElementById("searchResults");
    searchResults.innerHTML = ""
    if (val != ""){
        var numApps = 0;
    
        for (const app of allApplications){
            if (app.toLowerCase().search(val) != -1){

                var result = document.createElement('a');
                result.className = "list-group-item list-group-item-action py-1";
                result.innerText = app;
                result.onclick = function(){selectApp(app)};
                searchResults.appendChild(result);
                numApps += 1;
                if (numApps == 3){
                    break;
                }
            }
        }
    }

}

function listingHasSelectedApps(listingapps){
    for (const app of selectedApps){
        if (!listingapps.includes(app)){
            return false;
        }
    }
    return true;
}
perfColorMap = {Low: "176, 35, 35",Medium: "180, 180, 180", High: "35, 176, 89", Ultra: "13,110,253",Extreme: "255, 217, 0"}
perfTierMap = {None: 0, Low: 1,Medium:2,High:3,Ultra:4,Extreme:5}
function filterListings(){
    listingsDiv.innerHTML = "";
    for (const element of listingsData.hosts) {
        if (!(
            (document.getElementById("maxPriceSet").checked && parseFloat(element.rate) > parseFloat(document.getElementById("maxPriceInput").value)) ||
            (document.getElementById("minPriceSet").checked && parseFloat(element.rate) < parseFloat(document.getElementById("minPriceInput").value)) ||
            (parseFloat(document.getElementById("ratingLabel").innerText) > parseFloat(element.rating)) ||
            (parseInt(document.getElementById("perfSelect").value) > perfTierMap[element.perf]) ||
            (!listingHasSelectedApps(element.apps))
        )) {

            listingsDiv.insertAdjacentHTML('beforeend',
                `
                <div class="card mx-3 mb-4">
                    <div class="card-body">
                        <h5 class="card-title">${element.name}</h5>
                        <p class="card-text mb-0">$${element.rate}/hr</p>
                        <p class="card-text mb-0">Performance: <span style="color:rgb(${perfColorMap[element.perf]})">${element.perf}</span></p>
                        <p class="card-text">Latency: <span style="color:rgb(35, 176, 89)">${element.latency}ms</span></p>
    
                        <p class="card-text mb-0">Host: ${element.host}</p>
                        <p class="card-text mb-0">Hosting Since: ${element.datejoined}</p>
                        <p class="card-text">Rating: ${element.rating}/5</p>
                        <div class="d-flex flex-row">
                            <a href="#" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#connectModal" onclick="connectToHost('${element.id}')">Connect</a>
                            <a href="#" class="btn btn-primary mx-2">Details</a>
                        </div>
                    </div>
                </div>
                `
            );
        }
    }
}
async function loadListings(){

    const response = await fetch("/listings", { 
        method: "POST",
        mode: "no-cors", 
    });
    listingsData = await response.json();
    //console.log(data);

   
    listingsDiv = document.getElementById("listings-div");
    
    
    allApplications = new Set()
    for (const element of listingsData.hosts) {
        element.apps.forEach(app => allApplications.add(app))
        listingsDiv.insertAdjacentHTML('beforeend',
            `
            <div class="card mx-3 mb-4">
                <div class="card-body">
                    <h5 class="card-title">${element.name}</h5>
                    <p class="card-text mb-0">$${element.rate}/hr</p>
                    <p class="card-text mb-0">Performance: <span style="color:rgb(${perfColorMap[element.perf]})">${element.perf}</span></p>
                    <p class="card-text">Latency: <span style="color:rgb(35, 176, 89)">${element.latency}ms</span></p>

                    <p class="card-text mb-0">Host: ${element.host}</p>
                    <p class="card-text mb-0">Hosting Since: ${element.datejoined}</p>
                    <p class="card-text">Rating: ${element.rating}/5</p>
                    <div class="d-flex flex-row">
                        <a href="#" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#connectModal" onclick="connectToHost('${element.id}')">Connect</a>
                        <a href="#" class="btn btn-primary mx-2">Details</a>
                    </div>
                </div>
            </div>
            `
        );
    }
  
}

loadListings();