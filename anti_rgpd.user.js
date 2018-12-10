// ==UserScript==
// @name        Anti RGPD
// @version     2
// @grant       GM.setValue
// @grant       GM.getValue
// @grant       GM.xmlHttpRequest
// @updateURL   https://raw.githubusercontent.com/jeanbrochefort/antirgpd/master/anti_rgpd.user.js
// @downloadURL https://raw.githubusercontent.com/jeanbrochefort/antirgpd/master/anti_rgpd.user.js
// @include     *
// ==/UserScript==

var _conf = null;

async function load_conf() {
    return new Promise(async function(resolve, reject) {
        var conf = await GM.getValue("antiRGPD_config");
        if (!conf) {
            log("conf not found");
            GM.xmlHttpRequest({
                method: "GET",
                url: "https://raw.githubusercontent.com/jeanbrochefort/antirgpd/master/anti_rgpd.json",
                onload: function(response) {
                    GM.setValue("antiRGPD_config", response.responseText);
                    resolve(response.responseText);
                }
            });
        } else {
            log("conf found");
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
    var json_conf = await load_conf();
    if (json_conf) {
      log("start");
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

    console.log("AntiRGPD: " + string);

}
