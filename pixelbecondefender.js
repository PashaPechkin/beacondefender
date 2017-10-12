// ==UserScript==
// @name         Pixel Bot 2ch
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  try to take over the world!
// @author       Flyink13, DarkKeks
// @match        https://pixel.vkforms.ru/*
// @downloadURL  https://drive.google.com/uc?export=download&confirm=no_antivirus&id=0B3tijp3qx-9NSXdEWEoyTF9iMmc
// @updateURL    https://drive.google.com/uc?export=download&confirm=no_antivirus&id=0B3tijp3qx-9NSXdEWEoyTF9iMmc
// @grant        none
// ==/UserScript==

function BeaconPixelBot() {
    window.BeaconPixelBot = BeaconPixelBot;

    BeaconPixelBot.url = {
        script: 'https://raw.githubusercontent.com/PashaPechkin/beacondefender/master/pixelbecondefender.js',
     };
    BeaconPixelBot.refreshTime = 300;
    BeaconPixelBot.pts = 30;
    BeaconPixelBot.tc = "rgb(0, 0, 0)";
    BeaconPixelBot.doCoordLog = true;
    BeaconPixelBot.currentUrl = '';
    BeaconPixelBot.urlGen = {
        script: function() {
            return BeaconPixelBot.url.script + '?v=' + Math.random()
        },
        image: function() {
            return new Promise(function(resolve, reject) {
                fetch('https://raw.githubusercontent.com/PashaPechkin/beacondefender/master/defence.json').then(function(data) {
                        data.json().then(function(answer){
                            resolve(answer.currentTarget);
                        }).catch(function(e) {
                            BeaconPixelBot.state.textContent = "E120: " + e;
                            reject();
                        });
                }).catch(function(e){
                    BeaconPixelBot.state.textContent = "E121: " + e;
                    resolve(BeaconPixelBot.currentUrl);
                });
            });
        }
    };
    BeaconPixelBot.state = document.createElement("div");
    BeaconPixelBot.state.onclick = BeaconPixelBot.reload;
    BeaconPixelBot.state.textContent = "Загрузка приложения...";
    Object.assign(BeaconPixelBot.state.style, {
        background: "rgba(0,0,0,0.5)",
        bottom: "0px",
        right: "0px",
        width: "100%",
        height: "100%",
        lineHeight: "500px",
        textAlign: "center",
        color: "#fff",
        position: "fixed",
        zIndex: 10000
    });
    document.body.appendChild(BeaconPixelBot.state);
    BeaconPixelBot.loger = document.createElement("div");
    BeaconPixelBot.loger.onclick = BeaconPixelBot.reload;
    Object.assign(BeaconPixelBot.loger.style, {
        background: "rgba(0,0,0,0)",
        top: "0px",
        left: "0px",
        width: "250px",
        height: "100%",
        color: "#fff",
        position: "fixed",

        fontSize: "11px",
        padding: "12px",
        zIndex: 10001
    });
    document.body.appendChild(BeaconPixelBot.loger);
    BeaconPixelBot.log = function(x) {
        BeaconPixelBot.loger.innerHTML += x + "<br>";
        BeaconPixelBot.loger.scrollTo(0, 10000)
    }
    ;
    BeaconPixelBot.setState = function(s) {
        BeaconPixelBot.state.innerHTML = "BeaconPixelBot " + s;
        BeaconPixelBot.log(s)
    }
    ;
    BeaconPixelBot.reloadImage = function() {
        BeaconPixelBot.urlGen.image().then(function(url) {
            if (!BeaconPixelBot.img) {
                BeaconPixelBot.img = new Image();
                BeaconPixelBot.img.crossOrigin = "Anonymous";
                BeaconPixelBot.img.onload = function() {
                    BeaconPixelBot.setState("перезагрузил зону защиты.");
                    if (BeaconPixelBot.inited) BeaconPixelBot.getFullData();
                };
            }
            if (url != BeaconPixelBot.currentUrl) {
                BeaconPixelBot.img.src = url;
                BeaconPixelBot.currentUrl = url;
            }
        });
    };
    BeaconPixelBot.canvasEvent = function(type, q) {
        if (!BeaconPixelBot.canvas)
            return;
        if (type == "mousewheel") {
            BeaconPixelBot.canvas.dispatchEvent(new WheelEvent("mousewheel",q))
        } else {
            BeaconPixelBot.canvas.dispatchEvent(new MouseEvent(type,q))
        }
    }
    ;
    BeaconPixelBot.canvasClick = function(x, y, color) {
        BeaconPixelBot.resetZoom();
        if (x > 1590) {
            BeaconPixelBot.canvasMoveTo(1590, 0);
            x = x - 1590
        } else {
            BeaconPixelBot.canvasMoveTo(0, 0)
        }
        var q = {
            bubbles: true,
            cancelable: true,
            button: 1,
            clientX: x,
            clientY: y + 1,
            layerX: x,
            layerY: y + 1
        };
        var pxColor = BeaconPixelBot.getColor(BeaconPixelBot.ctx.getImageData(x, y + 1, 1, 1).data, 0);
        var colorEl = document.querySelector('[style="background-color: ' + color + ';"]');
        if (!colorEl) {
            console.log("color error %c " + color, 'background:' + color + ';');
            BeaconPixelBot.setState("Ошибка подбора цвета " + color);
            return
        } else if (pxColor == color) {
            if (BeaconPixelBot.doCoordLog) {
                console.log("== " + x + "x" + y + "%c " + pxColor, 'background:' + pxColor + ';');
                BeaconPixelBot.setState("Пропускаю " + (x + 1) + "x" + (y + 1) + " совпал цвет")
            } else {
                console.log("==");
                BeaconPixelBot.setState("Пропускаю, совпал цвет")
            }
            return
        } else {
            if (BeaconPixelBot.doCoordLog) {
                console.log(x + "x" + y + "%c " + pxColor + " -> %c " + color, 'background:' + pxColor + ';', 'background:' + color + ';');
                BeaconPixelBot.setState("Поставил точку " + (x + 1) + "x" + (y + 1))
            } else {
                console.log(" -> ");
                BeaconPixelBot.setState("Поставил точку")
            }
        }
        colorEl.click();
        BeaconPixelBot.canvasEvent("mousedown", q);
        BeaconPixelBot.canvasEvent("click", q);
        q.button = 0;
        BeaconPixelBot.canvasEvent("mouseup", q);
        document.querySelector(".App__confirm button").click()
    }
    ;
    BeaconPixelBot.draw = function() {
        var px = BeaconPixelBot.pixs.shift();
        if (!px) {
            BeaconPixelBot.setState("Точек нет")
        } else {
            BeaconPixelBot.canvasClick(px[0], px[1], px[2])
        }
    }
    ;
    BeaconPixelBot.canvasMove = function(x, y) {
        var q = {
            bubbles: true,
            cancelable: true,
            button: 1,
            clientX: 0,
            clientY: 0
        };
        BeaconPixelBot.canvasEvent("mousedown", q);
        q.clientY = y;
        q.clientX = x;
        BeaconPixelBot.canvasEvent("mousemove", q);
        BeaconPixelBot.canvasEvent("mouseup", q)
    }
    ;
    BeaconPixelBot.canvasMoveTo = function(x, y) {
        BeaconPixelBot.canvasMove(10000, 10000);
        BeaconPixelBot.canvasMove(-40 - x, -149 - y)
    }
    ;
    BeaconPixelBot.getImageData = function() {
        var data = BeaconPixelBot.ctx.getImageData(0, 1, 1590, 400).data;
        return data
    }
    ;
    BeaconPixelBot.getColor = function(data, i) {
        return "rgb(" + data[i] + ", " + data[i + 1] + ", " + data[i + 2] + ")"
    }
    ;
    BeaconPixelBot.getFullData = function() {
        BeaconPixelBot.pixs = [];
        BeaconPixelBot.pixs = BeaconPixelBot.randomShuffle(BeaconPixelBot.getData(0));
        BeaconPixelBot.setState("осталось точек:" + BeaconPixelBot.pixs.length);
        return BeaconPixelBot.pixs.length
    }
    ;
    BeaconPixelBot.getData = function(offsetX) {
        BeaconPixelBot.resetZoom();
        BeaconPixelBot.canvasMoveTo(offsetX, 0);
        var id1 = BeaconPixelBot.getImageData();
        BeaconPixelBot.ctx.drawImage(BeaconPixelBot.img, -offsetX, 1);
        var id2 = BeaconPixelBot.getImageData();
        var data = [];
        for (var i = 0; i < id1.length; i += 4) {
            var x = offsetX + (i / 4) % 1590
              , y = ~~((i / 4) / 1590);
            if (BeaconPixelBot.getColor(id1, i) !== BeaconPixelBot.getColor(id2, i) && BeaconPixelBot.getColor(id2, i) !== BeaconPixelBot.tc) {
                data.push([x, y, BeaconPixelBot.getColor(id2, i), BeaconPixelBot.getColor(id1, i)])
            }
        }
        return data
    };

    BeaconPixelBot.randomShuffle = function(data) {
        var currentIndex = data.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = data[currentIndex];
            data[currentIndex] = data[randomIndex];
            data[randomIndex] = temporaryValue
        }
        return data
    };

    BeaconPixelBot.resetZoom = function() {
        BeaconPixelBot.canvasEvent("mousewheel", {
            deltaY: 100000,
            deltaX: 0,
            clientX: 100,
            clientY: 100,
        })
    };

    BeaconPixelBot.init = function() {
        BeaconPixelBot.inited = 1;
        BeaconPixelBot.getFullData();
        BeaconPixelBot.setState("Запущен.")
    };

    BeaconPixelBot.wait = setInterval(function() {
        if (window.localStorage.getItem('DROP_FIRST_TIME') != '1') {
            document.querySelector(".App__advance > .Button.primary").click();
        } else if (window.localStorage.getItem('DROP_HEADER') != '1') {
            document.querySelector(".Header__close").click();
        } else if (!BeaconPixelBot.inited && BeaconPixelBot.canvas) {
            BeaconPixelBot.ctx = BeaconPixelBot.canvas.getContext("2d");
            BeaconPixelBot.init()
        } else if (BeaconPixelBot.canvas && document.querySelector(".Ttl__wait")) {
            BeaconPixelBot.timer = 1
        } else if (!BeaconPixelBot.canvas) {
            var all = document.querySelectorAll("canvas");
            for(var i = 0; i < all.length; ++i) {
                if(all[i].style.display != 'none') {
                    BeaconPixelBot.canvas = all[i];
                }
            }
        } else if (!BeaconPixelBot.pts) {
            BeaconPixelBot.reload();
            BeaconPixelBot.pts = 30
        } else if (BeaconPixelBot.inited && BeaconPixelBot.canvas) {
            BeaconPixelBot.pts--;
            BeaconPixelBot.draw()
        }
    }, 1000);

    BeaconPixelBot.refresh = setTimeout(function() {
        location.reload()
    }, BeaconPixelBot.refreshTime * 1e3);

    BeaconPixelBot.reload = function() {
        BeaconPixelBot.state.outerHTML = "";
        BeaconPixelBot.loger.outerHTML = "";
        clearInterval(BeaconPixelBot.wait);
        var script = document.createElement('script');
        script.src = BeaconPixelBot.urlGen.script();
        document.body.appendChild(script)
    };

    BeaconPixelBot.reloadImage();
    console.log("BeaconPixelBot loaded")
}

if (window.loaded) {
    BeaconPixelBot();
} else {
    var inject = function() {
        window.loaded = 1;
        var script = document.createElement('script');
        script.appendChild(document.createTextNode('(' + BeaconPixelBot + ')();'));
        (document.body || document.head || document.documentElement).appendChild(script);
    };

    //if (document.readyState == 'complete') inject();
    window.addEventListener("load", function() {
        inject();
    });
}
window.alert = function(smth){document.location.reload();}
