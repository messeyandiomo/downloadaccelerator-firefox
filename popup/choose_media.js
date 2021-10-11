
(function(){


	function convertSize(size){

		if(size < 1024){
			return size + "o";
		}
		else{
			let kilo = size/1024;
			if (kilo < 1024) {
				return parseFloat(kilo).toFixed(1) + "ko";
			}
			else{
				let mega = kilo/1024;
				if(mega < 1024){
					return parseFloat(mega).toFixed(1) + "Mo";
				}
				else{
					return parseFloat(mega/1024).toFixed(1) + "Go";
				}
			}
		}
	}


	function format(mesure){
		if(mesure < 10)
			return "0" + mesure;
		else
			return "" + mesure;
	}


	function convertDuration(duration){

		let millisecondes = duration%1000;
		let secondes = (duration - millisecondes)/1000;
		if(secondes >= 0){
			if (secondes < 60) {
				return format(secondes) + "s";
			}
			else if (secondes >= 60) {
				let minutes = (secondes - secondes%60)/60;
				secondes = secondes%60;
				if (minutes < 60) {
					return format(minutes) + "min" + format(secondes) + "s";
				}
				else if (minutes >= 60) {
					let heures = (minutes - minutes%60)/60;
					minutes = minutes%60;
					return format(heures) + "h" + format(minutes) + "min" + format(secondes) + "s";
				}
			}
		}
	}
    
    
    let setOfMedia = [];
    
    function mediaAlreadyExists(media){
        
        let retour = false;
        for(let i = 0; i < setOfMedia.length; i++){
            if((setOfMedia[i].mimeType == media.mimeType) && (setOfMedia[i].approxDurationMs == media.approxDurationMs) && (setOfMedia[i].width == media.width) && (setOfMedia[i].height == media.height) && (setOfMedia[i].contentLength == media.contentLength)){
                retour = true;
                break;
            }
        }
        
        return retour;
    }
    
    
	function addMedia(media){
        
        if(!mediaAlreadyExists(media)){
            setOfMedia.push(media);
            var title = document.createElement('div');
            title.setAttribute('class', 'title');
            title.appendChild(document.createTextNode(media.title));
            var type = document.createElement('span');
            type.setAttribute('class', 'type');
            type.appendChild(document.createTextNode(media.mimeType.split(';')[0]));
            var duration = document.createElement('span');
            duration.setAttribute('class', 'duration');
            if(Number.isInteger(parseInt(media.approxDurationMs)))
                duration.appendChild(document.createTextNode(convertDuration(parseInt(media.approxDurationMs))));
            else
                duration.appendChild(document.createTextNode(media.approxDurationMs));
            var resolution = document.createElement('span');
            resolution.setAttribute('class', 'resolution');
			if(!(typeof media.width === 'undefined') && !(typeof media.height === 'undefined'))
				resolution.appendChild(document.createTextNode(media.width + "x" + media.height));
			else
				resolution.appendChild(document.createTextNode(""));			
            var size = document.createElement('span');
            size.setAttribute('class', 'size');
			if (!(typeof media.contentLength === 'undefined')) {
				if (Number.isInteger(parseInt(media.contentLength)))
					size.appendChild(document.createTextNode(convertSize(parseInt(media.contentLength))));
				else
					size.appendChild(document.createTextNode(media.contentLength));
			}
			else
				size.appendChild(document.createTextNode(""));
                

            let infosToSent = document.createElement('span');
            infosToSent.setAttribute('class', 'infosToSent');
            if (media.url.length > 0){
				var messageToSent = media.title + separateur + media.mimeType.split(';')[0] + separateur + media.contentLength + separateur + media.url;
				if(!(typeof media.useragent === 'undefined') && !(typeof media.cookies === 'undefined'))
					messageToSent += (separateur + media.useragent + separateur + media.cookies);
				infosToSent.appendChild(document.createTextNode(messageToSent));
			}
            else
                infosToSent.appendChild(document.createTextNode(""));

            var properties = document.createElement('div');
            properties.setAttribute('class', 'properties');
            properties.appendChild(document.createTextNode("\n"));
            properties.appendChild(type);
            properties.appendChild(document.createTextNode("\n"));
            properties.appendChild(duration);
            properties.appendChild(document.createTextNode("\n"));
			properties.appendChild(resolution);
			properties.appendChild(document.createTextNode("\n"));
            properties.appendChild(size);
            properties.appendChild(infosToSent);
            var infos = document.createElement('div');
            infos.setAttribute('class', 'infos');
            infos.appendChild(document.createTextNode("\n"));
            infos.appendChild(title);
            infos.appendChild(document.createTextNode("\n"));
            infos.appendChild(properties);
            var image = document.createElement('img');
            image.setAttribute('src', media.poster);
            image.setAttribute('class', 'image');
            var mediaButton = document.createElement('div');
            mediaButton.setAttribute('class', 'button');
            mediaButton.appendChild(document.createTextNode("\n"));
            mediaButton.appendChild(image);
            mediaButton.appendChild(document.createTextNode("\n"));
            mediaButton.appendChild(infos);

            var body = document.getElementsByTagName('body')[0];
            body.appendChild(document.createTextNode("\n"));
            body.appendChild(mediaButton);
        }
		
	}
    
    function initialMedia(){
        
        let defaultMedia = {
            url:"",
            title:"No media detected in this tab",
            mimeType:"type",
            approxDurationMs:"duration",
            width:"width",
            height:"height",
            contentLength:"size",
            poster:"video.jpg"
        };
        addMedia(defaultMedia);
    }

	function pendingMedia(){

	}


	var toEmpty = true;
	function init(){
		let boutons = document.querySelectorAll('.button');
		for (var i = 0; i < boutons.length; i++) {
			document.body.removeChild(boutons[i]);
		}
        setOfMedia = [];
	}


	
	var portBg = browser.runtime.connect({name: "DABg"});

	portBg.postMessage({request: "medias"});
	portBg.onMessage.addListener(function(msg){
		if(msg.request == "disconnect"){
            portBg.disconnect();
            toEmpty = true;
        }
		else if (msg.request == "reload") {
			location.reload();
		}
		else{
            if(msg.data == ""){
                init();
                initialMedia();
            }
            else{
                if(toEmpty){
                    init();
                    toEmpty = false;
                }
                addMedia(msg);
            }
		}
	});
	

	//port de communication avec le serveur et le hostname du server
	var port = 1985;
	
	//séparateur d'informations envoyées au serveur
	var separateur = ";;";


	document.onclick = function(ev){
		let tmpElemt = ev.target;
		while(tmpElemt != null && tmpElemt != document){
			if(tmpElemt.className.includes("button")){
				let parameterToSent = tmpElemt.querySelector('span.infosToSent').textContent;
				if (parameterToSent.length > 0) {
					let xhr = new XMLHttpRequest();
					xhr.open('POST', 'http://localhost:' + port);
					xhr.onreadystatechange = function(){
						if(xhr.readyState == xhr.DONE){
							if(xhr.status == 200) {
								window.close();
							}
						}
					};
					xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
					xhr.send(parameterToSent);
					console.log(parameterToSent);
				} else{
					alert("The download of this kind of file is encrypted and is not yet supported.\nKindly look at next versions please");
					window.close();
				}
				break;
			}
			tmpElemt = tmpElemt.parentNode;
		}
	};



})();
