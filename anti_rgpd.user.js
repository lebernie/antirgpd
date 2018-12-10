// ==UserScript==
// @name        Anti RGPD
// @version     4
// @grant       GM.setValue
// @grant       GM.getValue
// @grant       GM.listValues
// @grant       GM.deleteValue
// @grant       GM.xmlHttpRequest
// @grant       GM.info
// @updateURL   https://raw.githubusercontent.com/jeanbrochefort/antirgpd/master/anti_rgpd.user.js
// @downloadURL https://raw.githubusercontent.com/jeanbrochefort/antirgpd/master/anti_rgpd.user.js
// @include     *
// ==/UserScript==

var _conf = null;
var _debug = true;
var _conf_url = "https://raw.githubusercontent.com/jeanbrochefort/antirgpd/master/anti_rgpd.json"

async function load_conf() {
    return new Promise(async function(resolve, reject) {
       
        var last_update = await GM.getValue("antiRGPD_last_update");
        if (last_update){
            var now = new Date();
            var nbrday = Math.trunc(Math.abs(new Date(last_update) - new Date(now)) / 86400000);
            log("conf file is " + nbrday + " day old");
            if (nbrday > 0){
                log("conf is too old");
                GM.deleteValue("antiRGPD_config");

            }else{
                log("conf is up to date");
            }
        }
        else{
            await GM.deleteValue("antiRGPD_config");
        }

        var conf = await GM.getValue("antiRGPD_config");
        if (!conf) {
            log("downloading latest conf...");
            GM.xmlHttpRequest({
                method: "GET",
                url: _conf_url,
                onload: function(response) {
                    GM.setValue("antiRGPD_config", response.responseText);
                    GM.setValue("antiRGPD_last_update", new Date());
                    log("conf downloaded : " + response.responseText);
                    resolve(response.responseText);
                }
            });
        } else {
            log("load stored conf");
            resolve(conf);
        }
    });
}



async function clear_rgpd() {
    if (!_conf) {
        log("not configured");
        _conf = JSON.parse(await load_conf());

    }
    _conf.class_to_remove.forEach(function(element) {
        var elements = document.getElementsByClassName(element);
        for (let item of elements) {
            log("remove class " + element);
            item.classList.remove(element);
        }

    });
    _conf.class_to_delete.forEach(function(element) {
        var elements = document.getElementsByClassName(element);
        for (let item of elements) {
            log("delete element by class " + element);
            item.parentNode.removeChild(item);
        }
    });
    _conf.div_to_delete.forEach(function(element) {
        var elem_to_delete = document.getElementById(element);
        if (elem_to_delete != null) {
            log("delete element by id " + element);
            elem_to_delete.parentNode.removeChild(elem_to_delete);
        }
    });
}



(async () => {
    log("start");
    var json_conf = await load_conf();
    if (json_conf) {
        
        _conf = JSON.parse(json_conf);
        var observer = new MutationObserver(async function(mutationsList, observer){
            await clear_rgpd();
        });
        observer.observe(document.body, { attributes: true, childList: true, subtree: true});
        setTimeout(function() {
            observer.disconnect();
            log("stop");
        }, 10000);
    } else {
        log("Conf file problem")
    }

})();



function log(string) {
    if (_debug){
        console.log("AntiRGPD(v"+GM.info.script.version+"): " + string);
    }

}
