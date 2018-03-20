
function loadArea(regionIdx) {
    let area_select = document.getElementById("rajiko-area");
    while (area_select.lastChild) {
        area_select.removeChild(area_select.lastChild);
    }
    let id = regions[regionIdx].id;
    let areas = areaListParRegion[id];
    for (let i = 0; i < areas.length; i++) {
        let tmp = document.createElement("option");
        tmp.setAttribute("id", areas[i].id);
        tmp.innerText = areas[i].name;
        area_select.appendChild(tmp);
    }
}



window.onload = function () {
    //define event
    let region_select = document.getElementById("rajiko-region");
    region_select.onchange = function (data) {
        loadArea(this.selectedIndex);
    };

    let area_select = document.getElementById("rajiko-area");

    let confirm_button = document.getElementById("rajiko-confirm");
    confirm_button.innerText = chrome.i18n.getMessage("confirm_button");

    confirm_button.onclick = function (data) {
        let area = document.getElementById("rajiko-area");
        chrome.storage.local.get("selected_areaid", function (data) {
            if (data["selected_areaid"] && data["selected_areaid"] == area) {
                //same area;
                window.close();
            }
            else {
                chrome.storage.local.set({ selected_areaid: area.selectedOptions[0].id }, function () { });
                chrome.runtime.sendMessage({ "update-area": area.selectedOptions[0].id });
                chrome.tabs.query({ active: true, currentWindow: true }, function (arrayOfTabs) {
                    let tab = arrayOfTabs[0];
                    if (/radiko\.jp/.test(tab.url)) {
                        chrome.tabs.reload(tab.id);
                    }
                    else {
                        window.alert(chrome.i18n.getMessage("refresh_alert"));
                    }
                    window.close();
                });

            }
        });

    };


    //should hide record button from other pages than radiko.
    //what radio
    //// html <div id="player-area" class="player-default">
    //// <input type="hidden" id="url" value="#BAYFM78">
    //// <input type="hidden" id="tmpUrl" value="#LFR">
    // if playing        
    //<i class="icon icon--play-02 on"></i>
    //<i class="icon icon--play-02"></i>
    let record_button = document.getElementById("rajiko-record");
    chrome.tabs.executeScript({code:"var tmpdata = {url : window.location.href,radioname:document.getElementById('url') && document.getElementById('url').value.slice(1) };tmpdata",runAt:"document_start"},function(results){
        if(chrome.runtime.lastError){
            console.log(chrome.runtime.lastError);
        }
        console.log(results); //slice to remove #
        if ( chrome.runtime.lastError || ! /radiko\.jp/.test(results[0].url)) {
            record_button.hidden = true;
            return;
        }
        chrome.storage.local.get({"current_recording":false},function(data){
            if(!data["current_recording"] ){
                //record_button.setAttribute("state","starting");
                record_button.innerText = chrome.i18n.getMessage("record_button_to_start");
                record_button.onclick = function(data){
                    // let radioname = results[0].radioname 
                    if(!results[0].radioname || results[0].radioname == ""  ){
                        let res = /radiko\.jp\/#!\/live\/(.*)/i.exec(results[0].url);
                        let waitraido = res && res[1];
                        chrome.runtime.sendMessage({"start-recording":waitraido},function(){
                            console.log("create task done!");
                            //TODO: i18n
                            window.alert("No playing radio! Prepare recording for ",waitraido);
                            window.close();
                        });
                    }else{
                        chrome.runtime.sendMessage({"start-recording":results[0].radioname},function(){
                            window.close();
                        });
                    }

                }
            }else{
                //record_button.setAttribute("state","starting");
                record_button.innerText = chrome.i18n.getMessage("record_button_to_stop"); // pass radioname to text via placeholders and substitutions
                record_button.onclick = function(data){
                    chrome.runtime.sendMessage({"stop-recording":true},function(){ //stop's raioname --> from executescript / from storage.get current_recording?
                        window.close();
                    });
                }
            }
        
        });
        //, radioname:document.getElementById('url').value


    })

    // record_button.onclick = function(data){

    //     chrome.tabs.executeScript({code:"document.getElementById('url').value" ,runAt:"document_start"},function(results){
    //         console.log(results);
    //         chrome.runtime.sendMessage({"stop-recording":true},function(){
    //             window.close();
    //         });
    //     });
    //     // chrome.runtime.sendMessage({"stop-recording":true},function(){
    //     //     window.close();
    //     // });
    //     // if(record_button.getAttribute("state") == "stopped"){
    //     //     chrome.tabs.query({ active: true, currentWindow: true }, function (arrayOfTabs) {
    //     //         //problem : viewing page may not listeing page??
    //     //         let tab = arrayOfTabs[0];
    //     //         if (/radiko.jp/.test(tab.url)) {
                    
    //     //         }
    //     //         else {
                   
    //     //         }
    //     //     });            
    //     // }

    //     // chrome.tabs.query -> get what radio to download (allow only single download task)
    //     //change states
    //     //notify backgroud
        
    // }


    //load region and area
    chrome.storage.local.get("selected_areaid", function (data) {
        let area_id = "JP13"; //default for tokyo;
        if (data["selected_areaid"]) {
            area_id = data["selected_areaid"];
        }
        for (let i = 0; i < regions.length; i++) {
            let tmp = document.createElement("option");
            tmp.setAttribute("id", regions[i].id);
            tmp.innerText = regions[i].name;
            region_select.appendChild(tmp);
        }

        Object.keys(areaListParRegion).forEach(function (key, keyindex) {
            for (let i = 0; i < areaListParRegion[key].length; i++) {
                if (areaListParRegion[key][i].id == area_id) {
                    region_select.selectedIndex = keyindex
                    loadArea(keyindex);
                    area_select.selectedIndex = i;
                }

            }

        });

    });



};



