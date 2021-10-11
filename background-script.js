
(function() {
    "use strict";


    // extract domain from url
    function extractDomain(url){
        let domain;
        //find & remove protocol (http, ftp, etc.) and get domain
        if (url.indexOf("://") > -1) {
            domain = url.split('/')[2];
        } else {
            domain = url.split('/')[0];
        }
        //find & remove port number
        domain = domain.split(':')[0];

        return domain.toLowerCase().replace("www.", "");
    }

    
    browser.contextMenus.create({
        id: "DownloadAccelerator",
        title: "Download Accelerator",
        contexts: ["link"],
        icons: {
            "16": "icons/accelerator-16.jpg"
        }
    });
    

    var link = null;
    var DaServerPort = 1985;
    
    browser.contextMenus.onClicked.addListener(function(info, tab){
        if (info.menuItemId == "DownloadAccelerator") {
            console.log(link);
            let xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://localhost:' + DaServerPort);
            xhr.onreadystatechange = function(){
                if(xhr.readyState == xhr.DONE){
                    if(xhr.status == 200) {
                        console.log(link + "was send");
                    }
                }
            };
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(link);
        }
    });

    
    
    var mediaList = null;
    var contentScriptDone = false;
    
    
    function updateContentScript(tabId, tab){
        mediaList = null;
        contentScriptDone = false;
        if(tab.active){
            if(tab.url.length > 0){
                if(extractDomain(tab.url).includes("youtube.com")){
                    if (tab.url.includes("watch") || tab.url.includes("embed")) {
                        console.log("youtube.com");
                        contentScriptDone = true;
                        browser.tabs.executeScript(tabId, { file: "/daYoutube.js" });
                    }
                }
                browser.tabs.executeScript(tabId, { file: "/DaContextMenu.js" });
            }
        }
    }
    
    
    
    
    /**********************************************************************************************************/
    
    //DECLARATION DE PROMISES
    //Ecoute sur tout les ports
    const runtimeOnConnect = new Promise((resolve, reject) => {
        browser.runtime.onConnect.addListener((port) => {
            if(port.name == "DABg"){
                console.log("port recupere");
                listenOnMessage(port);
            }
            else
                reject();
        });
    });
    //Ecoute de message sur un port particulier
    const listenOnMessage = (port) => {
        return new Promise((resolve) => {
            port.onMessage.addListener((msg) => {
                console.log("message recupere");
                manageMessage(port, msg);
            });
        });
    }
    //l'Onglet est active
    const tabIsActivated = new Promise((resolve) => {
        browser.tabs.onActivated.addListener(async (info) => {
            let tabInfo = await browser.tabs.get(info.tabId);
            updateContentScript(info.tabId, tabInfo);
        });
    });
    //l'Onglet est recharge
    const tabIsUpdated = new Promise((resolve) => {
        browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            updateContentScript(tabId, tab);
        });
    });
    
    //gestion du message
    const manageMessage = (port, msg) => {
        while ((typeof msg.link === 'undefined') && (typeof msg.request === 'undefined') && (typeof msg['medias'] === 'undefined')) {
            setTimeout(null, 30000);
        }
        console.log("pourquoi je nai rien ?");
        if (!(typeof msg.link === 'undefined')){
            link = msg.link;
            console.log("jai le lien ?");
        }
        else if (!(typeof msg.request === 'undefined')){
            if (mediaList != null) {
                let setOfMedias = mediaList['medias'];
                for (let index = 0; index < setOfMedias.length; index++) {
                    port.postMessage(setOfMedias[index]);
                }
                console.log("jenvoi les medias !");
            }
            else {
                if (contentScriptDone){
                    port.postMessage({request: "reload"});
                    console.log("in treatement !");
                }
                else{
                    port.postMessage({data: ""});
                    console.log("data is empty");
                }
            }
            port.postMessage({request: "disconnect"});
        }
        else if(!(typeof msg['medias'] === 'undefined')){
            mediaList = msg;
            console.log("jai recu les medias !");
        }
    }
    
    //UTILISATION DE PROMISES
    
})();

