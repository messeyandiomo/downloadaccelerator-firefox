(function(){
    
    
    /*************************************************************************************************/
    
    "use strict";

    //get video's ID
    var getVideoId = () => {
        var retour = "";
        var pageurl = document.location.href;
        if(pageurl.includes("watch")){
            var url = new URL(pageurl);
            retour = url.searchParams.get("v");
            console.log(retour);
        }
        else if(pageurl.includes("embed")){
            var pathnameComponents = document.location.pathname.split('/');
            retour = pathnameComponents[pathnameComponents.length - 1];
            console.log(retour);
        }
        return retour;
    };
    
    //download page
    const getPage = (pageUrl) => {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', pageUrl);
            xhr.onload = () => {
                if(xhr.readyState === xhr.DONE && xhr.status === 200){
                    console.log('Success to get ' + pageUrl);
                    resolve(xhr.responseText);
                }
                else{
                    console.log('Failed to get ' + pageUrl);
                    reject();
                }
            };
            xhr.send(null);
        });
    };
    
    
    

    /***********
     * begin of experience
    */
     var Ke=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#(.*))?$");
     var Me=false;
     var l=this;
     
     var Hn="corp.google.com googleplex.com youtube.com youtube-nocookie.com prod.google.com sandbox.google.com docs.google.com drive.google.com mail.google.com plus.google.com play.google.com googlevideo.com".split(" ");
     var Kn="";
     
     
     function Je(a,b,c,d,e,g,h){
         var k="";
         a&&(k+=a+":");
         c&&(k+="//",b&&(k+=b+"@"),k+=c,d&&(k+=":"+d));
         e&&(k+=e);
         g&&(k+="?"+g);
         h&&(k+="#"+h);
         return k
     }
     
     function Le(a){
         if (Me) {
             Me = false;
             var b = l.location;
             if (b) {
                 var c = b.href;
                 if (c&&(c=Ne(c))&&c!=b.hostname) {
                     throw Me=true,Error();
                 }
             }
         }
         return a.match(Ke)
     }
     
     function Ne(a){return(a=Le(a)[3]||null)&&decodeURIComponent(a)}
     
     function qz(a,b,c){
         a=Le(a);
         var d=false,e=a[6];
         if(e){
             var g=RegExp("((^|&)"+b+"=)[^&]*");
             0<=e.search(g)&&(e=e.replace(g,"$1"+c),d=!0)
         }
         if(g=a[5]){
             g=g.split("/");
             g[g.length-1]||g.pop();
             for(var h=g.length-2;0<h;h-=2)
                 if(g[h]==b){
                     g[h+1]=c;
                     d=!0;
                     break
                 }
             g=g.join("/")
         }
         d||(e=e?e+"&"+b+"="+c:b+"="+c);
         return Je(a[1],a[2],a[3],a[4],g,e,a[7])
     }
     
     function rz(a,b){
         var c=a,d;
         for(d in b)
             null!=b[d]&&(c=qz(c,d,b[d]));
         return c
     }
     
     function bz(a){
         a=a.split("");
         a=cz(a,61);
         a=cz(a,5);
         a=a.reverse();
         a=a.slice(2);
         a=cz(a,69);
         a=a.slice(2);
         a=a.reverse();
         return a.join("")
     }
     
     function cz(a,b){
         var c=a[0];
         a[0]=a[b%a.length];
         a[b]=c;
         return a
     }
     
     function Ln(a){
         if (a&&a==Kn) {
             return true;
         } else {
             if (Mn(a, Hn)) {
                 Kn = a;
                 return true;
             } else
                 return false;
         }
     }
     
     function Mn(a,b){
         return RegExp("^https?://([a-z0-9-]{1,63}\\.)*("+b.join("|").replace(/\./g,".")+")(:[0-9]+)?([/?#]|$)","i").test(a)
     }
     
     function Zz(a,b,c){
         if(!Ln(a))
             return"";
         b={
             alr:"yes",
             mime:encodeURIComponent(b.mimeType.split(";")[0]),
             ratebypass:"yes"
         };
         c&&(b.signature=bz(c));
         return rz(a,b)
     }

     

     
     /*************
      * end of experience
      */


    var updateMedia = (cver, title, media) => {

        media['cver'] = cver;
        media['title'] = title;
        
        if (media['mimeType'].includes('video')) {
            media['poster'] = "https://i.ytimg.com/vi/" + getVideoId() + "/default.jpg";
        }
        else if (media['mimeType'].includes('audio')) {
            media['poster'] = "audio.jpg";
        }
        if (!(typeof media['signatureCipher'] === 'undefined')) {
            var cipherParametersArray = media['signatureCipher'].split("&");
            var cipherParameter = null;
            for(var i = 0; i < cipherParametersArray.length; i++){
                cipherParameter = cipherParametersArray[i].split("=");
                media[cipherParameter[0]] = decodeURIComponent(cipherParameter[1]);
            }
            //media['url'] = media['url'] + "&alr=yes&" + media['sp'] + "=" + bz(media['s']) + "&cver=" + media['cver'];
            media['url'] = Zz(media['url'], media, media['s']);
            media['useragent'] = navigator.userAgent;
            media['cookies'] = document.cookie;
            //console.log('decipher url : ' + media['url']);
            
        }

        return media;
    };


    var updateListOfMedia = (cver, title, listOfMedia) => {

        if (!(typeof listOfMedia === 'undefined')) {
            for (var index = 0; index < listOfMedia.length; index++) {
                var media = updateMedia(cver, title, listOfMedia[index]);
            }
        }

    };


    var getVideoMetaData = () => {
        return new Promise((resolve) => {
            var pageurl = document.location.href;
            if (pageurl.includes("embed")) {
                pageurl = "https://www.youtube.com/watch?v=" + getVideoId();
            }
            if(pageurl.includes("watch")){
                getPage(pageurl).then((rawEmbedPage) => {
                    var result = [];
                    if(rawEmbedPage.length !== 0){
                        var stringOfLocalisation = "var ytInitialPlayerResponse = {";
                        var firstIndex = rawEmbedPage.indexOf(stringOfLocalisation) + stringOfLocalisation.length - 1;
                        var lastIndex = firstIndex + 1;
                        var bracketCounter = 1;
                        while(bracketCounter !== 0){
                            if(rawEmbedPage[lastIndex] == "{")
                                bracketCounter++;
                            else if(rawEmbedPage[lastIndex] == "}")
                                bracketCounter--;
                            lastIndex++;
                        }
                        var rawMetaData = rawEmbedPage.substring(firstIndex, lastIndex);
                        rawMetaData = rawMetaData.replace(/\\u0026/g, "&");
                        rawMetaData = rawMetaData.replace(/,\ /g, "-");
                        rawMetaData = rawMetaData.replace(/\\\"/g, "");
                        var metaDataObjet = JSON.parse(rawMetaData);
                        
                        var title = metaDataObjet['videoDetails']['title'];
                        var cver = "";
    
                        var listOfMedia_formats = metaDataObjet['streamingData']['formats'];
                        updateListOfMedia(cver, title, listOfMedia_formats);
    
                        var listOfMedia_adaptiveFormats = metaDataObjet['streamingData']['adaptiveFormats'];
                        updateListOfMedia(cver, title, listOfMedia_adaptiveFormats);
    
                        result = listOfMedia_formats.concat(listOfMedia_adaptiveFormats);
                        
                    }
                    resolve(result);
                });
            }
        });
    };


    async function sendListOfMedia() {
        await getVideoMetaData().then((listOfMedia) => {
            if (listOfMedia.length != 0) {
                var result = {};
                result['medias'] = listOfMedia;
                var portBg = browser.runtime.connect({name: "DABg"});
                    portBg.postMessage(result);
                    portBg.disconnect();
            }
        });
    };

    sendListOfMedia();
   
})();
