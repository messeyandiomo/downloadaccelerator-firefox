(function(){


	function getLinkUrl(href){
        if (href.search(window.location.protocol) == 0)//si la href commence par le protocole
            return href;
        else {//si la href est un chemin relatif
            if (href[0] == "/")//commencant par un / comme dans le cas du site gen.lib.rus.ec
                return window.location.protocol + "//" + window.location.hostname + href;
            else//indiquant uniquement le nom du fichier comme dans le site debian.org
                return window.location + href;
        }
	}

	
	var hrefForLastClicked = {};
    var links = document.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('contextmenu', function(e){
            hrefForLastClicked.link = getLinkUrl(e.target.getAttribute('href'));
            let portBg = browser.runtime.connect({name: "DABg"});
            portBg.postMessage(hrefForLastClicked);
            portBg.disconnect();
        }, false);
    }

    
})();