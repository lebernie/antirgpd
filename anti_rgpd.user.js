// ==UserScript==
// @name        Anti RGPD
// @version     1
// @grant       GM.setValue
// @grant       GM.getValue
// @grant       GM.xmlHttpRequest
// @updateURL   
// ==/UserScript==

var _conf = null;

async function load_conf() {
    return new Promise(async function(resolve, reject) {
        var conf = await GM.getValue("antiRGPD_config");
        if (!conf) {
            log("conf not found");
            GM.xmlHttpRequest({
                method: "GET",
                url: "https://gist.githubusercontent.com/squady/704bf0e0bbe6930658f459bb62da2b3b/raw/67e0f9920af76b33e0b2086fc337e55f214a11e0/anti-rgpd",
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
        log(conf);
        _conf = JSON.parse(await load_conf());

    }
    _conf.class_to_remove.forEach(function(element) {
        // $('.'+element).removeClass(element);
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
