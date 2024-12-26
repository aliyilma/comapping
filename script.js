// Stil güncelleme
const style = document.createElement('style');
style.textContent = `
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.6);
}
.modal-content {
    background-color: white;
    margin: 10% auto;
    padding: 30px;
    border: none;
    width: 90%;
    max-width: 500px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.form-group {
    margin-bottom: 20px;
}
.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
}
.form-control {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    box-sizing: border-box;
}
.form-control:focus {
    outline: none;
    border-color: #4A90E2;
    box-shadow: 0 0 0 2px rgba(74,144,226,0.2);
}
select.form-control {
    background-color: white;
    cursor: pointer;
}
.btn {
    background-color: #4A90E2;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    width: 100%;
    transition: background-color 0.2s;
}
.btn:hover {
    background-color: #357ABD;
}
h2 {
    color: #333;
    margin-bottom: 20px;
}
p {
    color: #666;
    margin-bottom: 25px;
    line-height: 1.5;
}
`;

// Modal HTML güncelleme
modal.innerHTML = `
    <div class="modal-content">
        <h2>Hoş Geldiniz!</h2>
        <p>Sirkeci Garı'ndan Eminönü'ne kadar olan hattı tasarlamak üzeresiniz. Lütfen başlamadan önce bilgilerinizi giriniz.</p>
        
        <form id="userForm">
            <div class="form-group">
                <label for="username">Kullanıcı Adı</label>
                <input type="text" id="username" class="form-control" required 
                       pattern="[A-Za-z0-9üğışçöÜĞİŞÇÖ\s]+" 
                       title="Lütfen geçerli bir kullanıcı adı giriniz">
            </div>

            <div class="form-group">
                <label for="age">Yaşınız</label>
                <input type="number" id="age" class="form-control" 
                       min="0" max="120" required>
            </div>

            <div class="form-group">
                <label for="userGroup">Kullanıcı Grubu</label>
                <select id="userGroup" class="form-control" required>
                    <option value="">Lütfen seçiniz...</option>
                    <option value="burada yaşıyor">Burada yaşıyor</option>
                    <option value="ziyaretçi">Ziyaretçi</option>
                    <option value="turist">Turist</option>
                </select>
            </div>

            <div class="form-group">
                <label for="frequency">Kullanım Sıklığı</label>
                <select id="frequency" class="form-control" required>
                    <option value="">Lütfen seçiniz...</option>
                    <option value="her gün">Her gün</option>
                    <option value="haftada bir">Haftada bir</option>
                    <option value="ayda bir">Ayda bir</option>
                    <option value="yılda bir">Yılda bir</option>
                </select>
            </div>

            <button type="submit" class="btn">Başla</button>
        </form>
    </div>
`;

// Get user device information, and location and print to the console
/*
navigator.geolocation.getCurrentPosition(function (position) {
    console.log(position);
});
*/

// harita oluşturucu
var map = L.map('map', {
    maxBounds: [[41.01874865817629, 28.971567095902117], [41.01413366017337, 28.97923475870823]]
}).setView([41.016596, 28.975677], 17);

// basemap ekleyici
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoic2Fyc2FyaG9zIiwiYSI6ImNtNTNxa2s4dTJhMDEyanNkNG0wODFzYTgifQ.-fITMwABFFCOan5-3LrYtg', {
    maxZoom: 20,
    minZoom: 17,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
}).addTo(map);



// add scale bar to map
L.control.scale().addTo(map);

// add geojson file to map from website url as layer
async function load_shapefile() {
    let url = 'https://raw.githubusercontent.com/aliyilma/comapping/main/sirkeci.geojson';
    const response = await fetch(url)
    const shape_obj = await response.json();
    console.log(shape_obj);
    return shape_obj;
}
load_shapefile().then(L.geoJson).then(map.addLayer.bind(map));

var type;

// çizim katmanlarını oluşturuyoruz
var agacGroup = new L.FeatureGroup();
map.addLayer(agacGroup);
var bankGroup = new L.FeatureGroup();
map.addLayer(bankGroup);
var heykelGroup = new L.FeatureGroup();
map.addLayer(heykelGroup);
var yolGroup = new L.FeatureGroup();
map.addLayer(yolGroup);
var cafeGroup = new L.FeatureGroup();
map.addLayer(cafeGroup);
var wcGroup = new L.FeatureGroup();
map.addLayer(wcGroup);
var sportGroup = new L.FeatureGroup();
map.addLayer(sportGroup);
var kulturGroup = new L.FeatureGroup();
map.addLayer(kulturGroup);
var yesilGroup = new L.FeatureGroup();
map.addLayer(yesilGroup);
var meydanGroup = new L.FeatureGroup();
map.addLayer(meydanGroup);

// agac çizici
var agacControl = new L.Control.Draw({
    edit: {
        featureGroup: agacGroup,
    },
    draw: {
        polygon: false,
        polyline: true,
        circle: false,
        circlemarker: false,
        rectangle: false,
    }
});
map.addControl(agacControl);

// bank çizici
var bankControl = new L.Control.Draw({
    edit: {
        featureGroup: bankGroup,
    },
    draw: {
        polygon: false,
        polyline: true,
        marker: true,
        circle: false,
        circlemarker: false,
        rectangle: false,
    }
});
map.addControl(bankControl);

// heykel çizici
var heykelControl = new L.Control.Draw({
    edit: {
        featureGroup: heykelGroup,
    },
    draw: {
        polygon: false,
        polyline: true,
        circle: false,
        circlemarker: false,
        rectangle: false,
    }
});
map.addControl(heykelControl);

// yol çizici
var yolControl = new L.Control.Draw({
    edit: {
        featureGroup: yolGroup,
    },
    draw: {
        polygon: false,
        polyline: true,
        circle: false,
        circlemarker: false,
        rectangle: false,
    }
});
map.addControl(yolControl);

// cafe çizici
var cafeControl = new L.Control.Draw({
    edit: {
        featureGroup: cafeGroup,
    },
    draw: {
        polygon: false,
        polyline: true,
        circle: false,
        circlemarker: false,
        rectangle: false,
    }
});
map.addControl(cafeControl);

// wc çizici
var wcControl = new L.Control.Draw({
    edit: {
        featureGroup: wcGroup,
    },
    draw: {
        polygon: false,
        polyline: true,
        circle: false,
        circlemarker: false,
        rectangle: false,
    }
});
map.addControl(wcControl);

// sport çizici
var sportControl = new L.Control.Draw({
    edit: {
        featureGroup: sportGroup,
    },
    draw: {
        polygon: false,
        polyline: true,
        circle: false,
        circlemarker: false,
        rectangle: false,
    }
});
map.addControl(sportControl);

// kultur çizici
var kulturControl = new L.Control.Draw({
    edit: {
        featureGroup: kulturGroup,
    },
    draw: {
        polygon: false,
        polyline: true,
        circle: false,
        circlemarker: false,
        rectangle: false,
    }
});
map.addControl(kulturControl);

// yeşil alan çizici
var yesilControl = new L.Control.Draw({
    // for polygon drawing
    edit: {
        featureGroup: yesilGroup,
    },
    draw: {
        polygon: true,
        polyline: false,
        circle: false,
        circlemarker: false,
        rectangle: false,
    }
});
map.addControl(yesilControl);

// meydan çizici
var meydanControl = new L.Control.Draw({
    // for polygon drawing
    edit: {
        featureGroup: meydanGroup,
    },
    draw: {
        polygon: true,
        polyline: false,
        circle: false,
        circlemarker: false,
        rectangle: false,
    }
});
map.addControl(meydanControl);

// haritalarımıza entity ekliyoruz
map.on(L.Draw.Event.CREATED, function (e) {
    var type = e.layerType,
        layer = e.layer;

    if (type === 'marker') {
        if (layer.options.icon.options.iconUrl.includes("tree")) {
            agacGroup.addLayer(layer);
        } else if (layer.options.icon.options.iconUrl.includes("bench")) {
            bankGroup.addLayer(layer);
        } else if (layer.options.icon.options.iconUrl.includes("venus")) {
            heykelGroup.addLayer(layer);
        } else if (layer.options.icon.options.iconUrl.includes("cafe")) {
            cafeGroup.addLayer(layer);
        } else if (layer.options.icon.options.iconUrl.includes("diarrhea")) {
            wcGroup.addLayer(layer);
        } else if (layer.options.icon.options.iconUrl.includes("basketball")) {
            sportGroup.addLayer(layer);
        } else if (layer.options.icon.options.iconUrl.includes("mask")) {
            kulturGroup.addLayer(layer);
        }
    } else if (type === 'polyline') {
        yolGroup.addLayer(layer);
    } else if (type === 'polygon') {
        if (layer.options.color.includes("yellow")) {
            meydanGroup.addLayer(layer);
        } else if (layer.options.color.includes("green")) {
            yesilGroup.addLayer(layer);
        }
    }
});
//----------- BUTON TIKLAYICILARI -----------------------------------------------------------------

// A tuşuna ve butona tıklayınca ağaç çiziciyi aktif ediyoruz
document.getElementById('draw-agac').onclick = function (e) {
    agacControl.setDrawingOptions({
        marker: {
            icon: new L.Icon({
                iconUrl: 'https://img.icons8.com/ios-glyphs/30/40C057/deciduous-tree--v1.png',
                shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                shadowSize: [30, 30],
                shadowAnchor: [15, 27]
            }),
        },
    });
    type = 'agac';
    agacControl._toolbars.draw._modes.marker.handler.enable();
}
document.addEventListener('keydown', function (e) {
    if (e.keyCode == 65) {
        agacControl.setDrawingOptions({
            marker: {
                icon: new L.Icon({
                    iconUrl: 'https://img.icons8.com/ios-glyphs/30/40C057/deciduous-tree--v1.png',
                    shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                    iconSize: [24, 24],
                    iconAnchor: [12, 24],
                    shadowSize: [30, 30],
                    shadowAnchor: [15, 27]
                }),
            },
        });
        type = 'agac';
        agacControl._toolbars.draw._modes.marker.handler.enable();
    }
});

// butona tıklayınca bank çiziciyi aktif ediyoruz
document.getElementById('draw-bench').onclick = function (e) {
    bankControl.setDrawingOptions({
        marker: {
            icon: new L.Icon({
                iconUrl: 'https://img.icons8.com/ios-glyphs/30/FD7E14/city-bench.png',
                shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                shadowSize: [30, 30],
                shadowAnchor: [15, 27]
            }),
        },
    });
    type = 'bank';
    bankControl._toolbars.draw._modes.marker.handler.enable();
}
document.addEventListener('keydown', function (e) {
    if (e.keyCode == 66) {
        bankControl.setDrawingOptions({
            marker: {
                icon: new L.Icon({
                    iconUrl: 'https://img.icons8.com/ios-glyphs/30/FD7E14/city-bench.png',
                    shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                    iconSize: [24, 24],
                    iconAnchor: [12, 24],
                    shadowSize: [30, 30],
                    shadowAnchor: [15, 27]
                }),
            },
        });
        type = 'bank';
        bankControl._toolbars.draw._modes.marker.handler.enable();
    }
});

// T tuşuna ve butona tıklayınca heykel çiziciyi aktif ediyoruz
document.getElementById('draw-statue').onclick = function (e) {
    heykelControl.setDrawingOptions({
        marker: {
            icon: new L.Icon({
                iconUrl: 'https://img.icons8.com/ios-filled/50/FA5252/venus-de-milo--v2.png',
                shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                shadowSize: [30, 30],
                shadowAnchor: [15, 27]
            }),
        },
    });
    type = 'heykel';
    heykelControl._toolbars.draw._modes.marker.handler.enable();
}
document.addEventListener('keydown', function (e) {
    if (e.keyCode == 84) {
        heykelControl.setDrawingOptions({
            marker: {
                icon: new L.Icon({
                    iconUrl: 'https://img.icons8.com/ios-filled/50/FA5252/venus-de-milo--v2.png',
                    shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                    iconSize: [24, 24],
                    iconAnchor: [12, 24],
                    shadowSize: [30, 30],
                    shadowAnchor: [15, 27]
                }),
            },
        });
        type = 'heykel';
        heykelControl._toolbars.draw._modes.marker.handler.enable();
    }
});

// C tuşuna ve butona tıklayınca cafe çiziciyi aktif ediyoruz
document.getElementById('draw-cafe').onclick = function (e) {
    cafeControl.setDrawingOptions({
        marker: {
            icon: new L.Icon({
                iconUrl: 'https://img.icons8.com/parakeet/48/null/cafe.png',
                shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                shadowSize: [30, 30],
                shadowAnchor: [15, 27]
            }),
        },
    });
    type = 'cafe';
    cafeControl._toolbars.draw._modes.marker.handler.enable();
}
document.addEventListener('keydown', function (e) {
    if (e.keyCode == 67) {
        cafeControl.setDrawingOptions({
            marker: {
                icon: new L.Icon({
                    iconUrl: 'https://img.icons8.com/parakeet/48/null/cafe.png',
                    shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                    iconSize: [24, 24],
                    iconAnchor: [12, 24],
                    shadowSize: [30, 30],
                    shadowAnchor: [15, 27]
                }),
            },
        });
        type = 'cafe';
        cafeControl._toolbars.draw._modes.marker.handler.enable();
    }
});

// W tuşuna ve butona tıklayınca wc çiziciyi aktif ediyoruz
document.getElementById('draw-wc').onclick = function (e) {
    wcControl.setDrawingOptions({
        marker: {
            icon: new L.Icon({
                iconUrl: 'https://img.icons8.com/arcade/64/null/diarrhea.png',
                shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                shadowSize: [30, 30],
                shadowAnchor: [15, 27]
            }),
        },
    });
    type = 'wc';
    wcControl._toolbars.draw._modes.marker.handler.enable();
}
document.addEventListener('keydown', function (e) {
    if (e.keyCode == 87) {
        wcControl.setDrawingOptions({
            marker: {
                icon: new L.Icon({
                    iconUrl: 'https://img.icons8.com/arcade/64/null/diarrhea.png',
                    shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                    iconSize: [24, 24],
                    iconAnchor: [12, 24],
                    shadowSize: [30, 30],
                    shadowAnchor: [15, 27]
                }),
            },
        });
        type = 'wc';
        wcControl._toolbars.draw._modes.marker.handler.enable();
    }
});

// S tuşuna ve butona tıklayınca spor çiziciyi aktif ediyoruz
document.getElementById('draw-sport').onclick = function (e) {
    sportControl.setDrawingOptions({
        marker: {
            icon: new L.Icon({
                iconUrl: 'https://img.icons8.com/color/48/null/basketball.png',
                shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                shadowSize: [30, 30],
                shadowAnchor: [15, 27]
            }),
        },
    });
    type = 'sport';
    sportControl._toolbars.draw._modes.marker.handler.enable();
}
document.addEventListener('keydown', function (e) {
    if (e.keyCode == 83) {
        sportControl.setDrawingOptions({
            marker: {
                icon: new L.Icon({
                    iconUrl: 'https://img.icons8.com/color/48/null/basketball.png',
                    shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                    iconSize: [24, 24],
                    iconAnchor: [12, 24],
                    shadowSize: [30, 30],
                    shadowAnchor: [15, 27]
                }),
            },
        });
        type = 'sport';
        sportControl._toolbars.draw._modes.marker.handler.enable();
    }
});

// butona tıklayınca kultur çiziciyi aktif ediyoruz
document.getElementById('draw-culture').onclick = function (e) {
    kulturControl.setDrawingOptions({
        marker: {
            icon: new L.Icon({
                iconUrl: 'https://img.icons8.com/office/30/null/theatre-mask.png',
                shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                iconSize: [25, 25],
                iconAnchor: [12, 25],
                shadowSize: [32, 32],
                shadowAnchor: [16, 27]
            }),
        },
    });
    type = 'kultur';
    kulturControl._toolbars.draw._modes.marker.handler.enable();
}
document.addEventListener('keydown', function (e) {
    if (e.keyCode == 75) {
        kulturControl.setDrawingOptions({
            marker: {
                icon: new L.Icon({
                    iconUrl: 'https://img.icons8.com/office/30/null/theatre-mask.png',
                    shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                    iconSize: [25, 25],
                    iconAnchor: [12, 25],
                    shadowSize: [32, 32],
                    shadowAnchor: [16, 27]
                }),
            },
        });
        type = 'kultur';
        kulturControl._toolbars.draw._modes.marker.handler.enable();
    }
});

// butona tıklayınca yol çiziciyi aktif ediyoruz
document.getElementById('draw-path').onclick = function (e) {
    yolControl.setDrawingOptions({
        polyline: {
            shapeOptions: {
                color: 'yellow',
                weight: 6,
                opacity: 0.75,
                lineCap: "square",
            },
        },
    });
    type = 'yol';
    yolControl._toolbars.draw._modes.polyline.handler.enable();
}
document.addEventListener('keydown', function (e) {
    if (e.keyCode == 89) {
        yolControl.setDrawingOptions({
            polyline: {
                shapeOptions: {
                    color: 'yellow',
                    weight: 6,
                    opacity: 0.75,
                    lineCap: "square",
                },
            },
        });
        type = 'yol';
        yolControl._toolbars.draw._modes.polyline.handler.enable();
    }
});

// butona tıklayınca yeşil alan çiziciyi aktif ediyoruz
document.getElementById('draw-green').onclick = function (e) {
    yesilControl.setDrawingOptions({
        polygon: {
            shapeOptions: {
                color: 'green',
                weight: 2,
                opacity: 1,
                fillColor: 'green',
                fillOpacity: 0.5,
                fill: true
            },
        },
    });
    type = 'yesil';
    yesilControl._toolbars.draw._modes.polygon.handler.enable();
}
document.addEventListener('keydown', function (e) {
    if (e.keyCode == 76) {
        yesilControl.setDrawingOptions({
            polygon: {
                shapeOptions: {
                    color: 'green',
                    weight: 2,
                    opacity: 1,
                    fillColor: 'green',
                    fillOpacity: 0.5,
                    fill: true
                },
            },
        });
        type = 'yesil';
        yesilControl._toolbars.draw._modes.polygon.handler.enable();
    }
});

// butona tıklayınca meydan çiziciyi aktif ediyoruz
document.getElementById('draw-square').onclick = function (e) {
    meydanControl.setDrawingOptions({
        polygon: {
            shapeOptions: {
                color: 'yellow',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.5,
                fill: true
            },
        },
    });
    type = 'meydan';
    meydanControl._toolbars.draw._modes.polygon.handler.enable();
}
document.addEventListener('keydown', function (e) {
    if (e.keyCode == 77) {
        meydanControl.setDrawingOptions({
            polygon: {
                shapeOptions: {
                    color: 'yellow',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.5,
                    fill: true
                },
            },
        });
        type = 'meydan';
        meydanControl._toolbars.draw._modes.polygon.handler.enable();
    }
});

// butona tıklayınca çizilenleri temizliyoruz
document.getElementById('reset').onclick = function (e) { clearDraw(); }

// butona veya ctrl/cmd z tuşuna basınca son çizileni siliyoruz
document.getElementById("undo").addEventListener("click", undoDraw);
document.addEventListener("keydown", function (event) {
    event.preventDefault(); // burası önemli
    if (event.keyCode == 90 && (navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey)) {
        undoDraw();
    }
});

// butona tıklayınca veya windows için ctrl s, mac için cmd s tuşuna basınca dropbox'a yükler
document.getElementById("upload").addEventListener("click", areYouSure);
document.addEventListener("keydown", function (event) {
    event.preventDefault(); // burası önemli
    if (event.keyCode == 83 && (navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey)) {
        areYouSure();
    }
});

//----------- FONKSİYONLAR -----------------------------------------------------------------

// Emin misin sorusu
function areYouSure() {
    if (window.confirm("Gerçekten mi?")) {
        uploadCombinedGeoJSON();
    }
}

function uploadCombinedGeoJSON() {
    // Tüm grupları tek bir FeatureCollection'da birleştir
    const combinedFeatures = {
        "type": "FeatureCollection",
        "features": [
            ...agacGroup.toGeoJSON().features.map((f, i) => ({
                ...f,
                properties: { 
                    ...f.properties, 
                    tur: 'agac',
                    isim: `Ağaç ${i+1}`
                }
            })),
            ...bankGroup.toGeoJSON().features.map((f, i) => ({
                ...f,
                properties: { 
                    ...f.properties, 
                    tur: 'bank',
                    isim: `Bank ${i+1}`
                }
            })),
            ...heykelGroup.toGeoJSON().features.map((f, i) => ({
                ...f,
                properties: { 
                    ...f.properties, 
                    tur: 'heykel',
                    isim: `Heykel ${i+1}`
                }
            })),
            ...yolGroup.toGeoJSON().features.map((f, i) => ({
                ...f,
                properties: { 
                    ...f.properties, 
                    tur: 'yol',
                    isim: `Yol ${i+1}`
                }
            })),
            ...yesilGroup.toGeoJSON().features.map((f, i) => ({
                ...f,
                properties: { 
                    ...f.properties, 
                    tur: 'yesil',
                    isim: `Yeşil Alan ${i+1}`
                }
            })),
            ...wcGroup.toGeoJSON().features.map((f, i) => ({
                ...f,
                properties: { 
                    ...f.properties, 
                    tur: 'wc',
                    isim: `WC ${i+1}`
                }
            })),
            ...sportGroup.toGeoJSON().features.map((f, i) => ({
                ...f,
                properties: { 
                    ...f.properties, 
                    tur: 'spor',
                    isim: `Spor Alanı ${i+1}`
                }
            })),
            ...kulturGroup.toGeoJSON().features.map((f, i) => ({
                ...f,
                properties: { 
                    ...f.properties, 
                    tur: 'kultur',
                    isim: `Kültürel Alan ${i+1}`
                }
            })),
            ...cafeGroup.toGeoJSON().features.map((f, i) => ({
                ...f,
                properties: { 
                    ...f.properties, 
                    tur: 'cafe',
                    isim: `Kafe ${i+1}`
                }
            })),
            ...meydanGroup.toGeoJSON().features.map((f, i) => ({
                ...f,
                properties: { 
                    ...f.properties, 
                    tur: 'meydan',
                    isim: `Meydan ${i+1}`
                }
            }))
        ]
    };

    // GeoJSON dosyası oluştur
    const file = new File([JSON.stringify(combinedFeatures)], getFileName() + ".geojson");

    // Dropbox API v2 ile yükle
    const dbx = new Dropbox.Dropbox({
        clientId: '3srgf2zk9ehxjuo',
        clientSecret: "sox2f4bp0rora92",
        refreshToken: "tS2SLNlfrDYAAAAAAAAAAdnWBjf2gdtW8RgC_2lGL30fBqX_gp-otnyQnVkGzY9f"
    });

    dbx.filesUpload({ path: "/" + file.name, contents: file })
        .then(function (response) {
            console.log("Dosya başarıyla yüklendi.");
            alert("Oldu! Sayenizde Matrix'i güncelledik.");
            // Grupları temizle
            clearAllGroups();
        })
        .catch(function (error) {
            console.error(error);
            // Yükleme başarısız olursa indir
            const downloadUrl = URL.createObjectURL(file);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (window.confirm('Matrix\'te bir hata ile karşılaştık fakat çalışmalarını kurtardık.\n\nTamam\'ı seçersen kodu düzeltmek için bir şans verip bize tasarımını mail atabilirsin. Vazgeç\'i seçersen her şey sona erer ve hayatına geri dönersin.')) {
                window.location.href = 'mailto:yilmazali13@itu.edu.tr';
            }
        });
}

// Yardımcı fonksiyon - tüm grupları temizle
function clearAllGroups() {
    bankGroup.clearLayers();
    agacGroup.clearLayers();
    heykelGroup.clearLayers(); 
    yolGroup.clearLayers();
    yesilGroup.clearLayers();
    wcGroup.clearLayers();
    sportGroup.clearLayers();
    kulturGroup.clearLayers();
    cafeGroup.clearLayers();
    meydanGroup.clearLayers();
}

// dosya adı oluşturucu
function getFileName() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    return "map_" + kullaniciadi + "-" + month + "-" + day + "_" + hour + "-" + minute + "-" + second;
}

// geri alıcı
function undoDraw() {
    if (type == 'bank') {
        bankGroup.removeLayer(bankGroup.getLayers()[bankGroup.getLayers().length - 1]);
    } if (type == 'agac') {
        agacGroup.removeLayer(agacGroup.getLayers()[agacGroup.getLayers().length - 1]);
    } else if (type == 'heykel') {
        heykelGroup.removeLayer(heykelGroup.getLayers()[heykelGroup.getLayers().length - 1]);
    } else if (type == 'yol') {
        yolGroup.removeLayer(yolGroup.getLayers()[yolGroup.getLayers().length - 1]);
    } else if (type == 'wc') {
        wcGroup.removeLayer(wcGroup.getLayers()[wcGroup.getLayers().length - 1]);
    } else if (type == 'sport') {
        sportGroup.removeLayer(sportGroup.getLayers()[sportGroup.getLayers().length - 1]);
    } else if (type == 'kultur') {
        kulturGroup.removeLayer(kulturGroup.getLayers()[kulturGroup.getLayers().length - 1]);
    } else if (type == 'yesil') {
        yesilGroup.removeLayer(yesilGroup.getLayers()[yesilGroup.getLayers().length - 1]);
    } else if (type == 'meydan') {
        meydanGroup.removeLayer(meydanGroup.getLayers()[meydanGroup.getLayers().length - 1]);
    } else if (type == 'cafe') {
        cafeGroup.removeLayer(cafeGroup.getLayers()[cafeGroup.getLayers().length - 1]);
    }
}

// çizim temizleyici
function clearDraw() {
    if (window.confirm("Yanlışlıkla basma diye buradayım. Emin misin?")) {
        bankGroup.clearLayers();
        agacGroup.clearLayers();
        heykelGroup.clearLayers();
        yolGroup.clearLayers();
        yesilGroup.clearLayers();
        wcGroup.clearLayers();
        sportGroup.clearLayers();
        kulturGroup.clearLayers();
        cafeGroup.clearLayers();
        meydanGroup.clearLayers();
    }
}

// haritayı resize edici
$(window).on("resize", function () {
    $("#map").height($(window).height() - 100).width($(window).width() - 15);
    map.invalidateSize();
}).trigger("resize");
