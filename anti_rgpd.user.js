// ==UserScript==
// @name        Anti RGPD
// @version     999.1
// @grant       GM.setValue
// @grant       GM.getValue
// @grant       GM.listValues
// @grant       GM.deleteValue
// @grant       GM.xmlHttpRequest
// @grant       GM.info
// @updateURL   https://raw.githubusercontent.com/lebernie/antirgpd/lebernie_test/anti_rgpd.user.js
// @downloadURL https://raw.githubusercontent.com/lebernie/antirgpd/lebernie_test/anti_rgpd.user.js
// @noframes
// @include     *
// ==/UserScript==

(async function () {
    'use strict';

    var g_debug = true;

    var AntiRGPD = {
        g_json_conf_url: "https://raw.githubusercontent.com/lebernie/antirgpd/lebernie_test/anti_rgpd.json",
        g_json_conf: null,
        g_stop_after_ms: 25000, //stop script after 10s
        g_refresh_every_ms: 7200000, //refresh conf every 2 hours

        init: async function () {
            var self = this;
            log("start");
            var json_conf = await self.load_conf();
            if (json_conf) {
                self.g_json_conf = JSON.parse(json_conf);
                var observer = new MutationObserver(async function (mutationsList, observer) {
                    await self.clear_rgpd();
                });
                observer.observe(document.body, {
                    attributes: true,
                    childList: true,
                    subtree: true
                });
                setTimeout(function () {
                    observer.disconnect();
                    log("stop");
                }, self.g_stop_after_ms);
            } else {
                log("Conf file problem")
            }


        },
        load_conf: async function () {
            var self = this;

            var download_conf = true;
            var last_update = await GM.getValue("antiRGPD_last_update");


            if (last_update) {
                var now = new Date();
                var is_old = Math.trunc(Math.abs(new Date(last_update) - new Date(now)) / self.g_refresh_every_ms);
                if (!is_old) {
                    log("conf is up to date");
                    download_conf = false;
                }
            }
            if (download_conf) {
                await self.download_conf();
            }
            return await GM.getValue("antiRGPD_config");
        },

        download_conf: async function () {
            var self = this;

            return GM.xmlHttpRequest({
                method: "GET",
                url: self.g_json_conf_url,
                onload: function (response) {
                    console.log(response);
                    GM.setValue("antiRGPD_config", response.responseText);
                    GM.setValue("antiRGPD_last_update", new Date());
                    log("conf downloaded : " + response.responseText);
                    return response.responseText;
                }
            });


        },

        clear_rgpd: async function () {
            var self = this;

            if (!self.g_json_conf) {
                self.g_json_conf = JSON.parse(await self.load_conf());
            }



            Object.keys(self.g_json_conf.class_where_remove_overflow).forEach(function (element) {                
                if (self.should_filter(self.g_json_conf.class_where_remove_overflow[element])){
                    var elements = document.getElementsByClassName(element);
                    for (let item of elements) {
                        if (item.style.overflow == "hidden"){
                            log("element has overflow:hidden, removing it");
                            item.style.removeProperty("overflow");
                        }
                        
                    }
                }
            });

            Object.keys(self.g_json_conf.div_where_remove_overflow).forEach(function (element) {                
                if (self.should_filter(self.g_json_conf.div_where_remove_overflow[element])){
                    var item = document.getElementById(element);
                    if (item.style.overflow == "hidden"){
                        log("element has overflow:hidden, removing it");
                        item.style.removeProperty("overflow");
                    }
                }
            });

            Object.keys(self.g_json_conf.class_to_remove).forEach(function (element) {                
                if (self.should_filter(self.g_json_conf.class_to_remove[element])){
                    var elements = document.getElementsByClassName(element);
                    for (let item of elements) {
                        log("remove class " + element);
                        item.classList.remove(element);
                        // if (item.style.overflow == "hidden"){
                        //     log("element has overflow:hidden, removing it");
                        //     item.style.removeProperty("overflow");
                        // }
                    }
                }

            });
            Object.keys(self.g_json_conf.class_to_delete).forEach(function (element) {
                if (self.should_filter(self.g_json_conf.class_to_delete[element])){
                    var elements = document.getElementsByClassName(element);
                    for (let item of elements) {
                        log("delete element by class " + element);
                        item.parentNode.removeChild(item);
                    }
                }
            });
            Object.keys(self.g_json_conf.div_to_delete).forEach(function (element) {
                if (self.should_filter(self.g_json_conf.div_to_delete[element])){
                    var elem_to_delete = document.getElementById(element);
                    if (elem_to_delete != null) {
                        log("delete element by id " + element);
                        elem_to_delete.parentNode.removeChild(elem_to_delete);
                    }
                }
            });
        },
        should_filter: function(urls){
            var href = window.location.href;
            var filter = urls.length == 0;

            for (let i = 0; (i < urls.length) && !filter; i++){
                let url = urls[i];
                filter = new RegExp(url.replace(/\*/g, '([^*]+)'), 'g').test(href);
                if(filter){
                    log(href + " matches " + url);                    
                }

            }
            return filter;
        }
    }
    function log(string) {
        var self = this;
        if (g_debug) {
            console.log("AntiRGPD(v" + GM.info.script.version + "): " + string);
        }
    }

    AntiRGPD.init();
})()
