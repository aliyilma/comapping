// ekrana mesaj çak ve nick iste
setTimeout(function () {
    kullaniciadi = prompt(
        "Şu anda Sirkeci Garı'ndan Eminönü'ne kadar olan hattı keyfinize göre tasarlamak üzeresiniz. Bunu katılımcı planlama ve tasarım anlayışı ile harmanlanan bir mekânsal anket çalışması olarak düşünebilirsiniz.\n\nHarita üzerinde bulunan yardımcı butonlar vasıtası ile fikirlerinizi haritaya ekleyebilir ve hayallerinizin gerçekleşmesini umabilirsiniz. Sizin gibi diğer ziyaretçiler de bu mekânsal anketi hayalleri ile dolduruyor ve sonuçları Matrix'te yer alan çok güvenli bir sunucuya PTT ile gönderiliyor.\n\nAnkete güvenle devam edebilmeniz için annenizin evlenmeden önceki soyadı?\n\Şaka. Olmak istediğiniz kişiyi giriniz.", "white rabbit"
    );
}, 1000);

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
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoic2Fyc2FyaG9zIiwiYSI6ImNtNTNxa2s4dTJhMDEyanNkNG0wODFzYTgifQ.-fITMwABFFCOan5-3LrYtg', {
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

// Çizim katmanlarını oluşturuyoruz
const layers = {
    agac: new L.FeatureGroup(),
    bank: new L.FeatureGroup(), 
    heykel: new L.FeatureGroup(),
    yol: new L.FeatureGroup(),
    cafe: new L.FeatureGroup(),
    wc: new L.FeatureGroup(),
    sport: new L.FeatureGroup(),
    kultur: new L.FeatureGroup(),
    yesil: new L.FeatureGroup(),
    meydan: new L.FeatureGroup()
};

// Tüm katmanları haritaya ekliyoruz
Object.values(layers).forEach(layer => map.addLayer(layer));

// Çizim kontrol ayarları
const drawConfigs = {
    agac: {
        featureGroup: 'agacGroup',
        drawOptions: {
            polygon: false,
            polyline: true,
            circle: false,
            circlemarker: false,
            rectangle: false
        }
    },
    bank: {
        featureGroup: 'bankGroup',
        drawOptions: {
            polygon: false,
            polyline: true,
            marker: true,
            circle: false,
            circlemarker: false,
            rectangle: false
        }
    },
    heykel: {
        featureGroup: 'heykelGroup',
        drawOptions: {
            polygon: false,
            polyline: true,
            circle: false,
            circlemarker: false,
            rectangle: false
        }
    },
    yol: {
        featureGroup: 'yolGroup',
        drawOptions: {
            polygon: false,
            polyline: true,
            circle: false,
            circlemarker: false,
            rectangle: false
        }
    },
    cafe: {
        featureGroup: 'cafeGroup',
        drawOptions: {
            polygon: false,
            polyline: true,
            circle: false,
            circlemarker: false,
            rectangle: false
        }
    },
    wc: {
        featureGroup: 'wcGroup',
        drawOptions: {
            polygon: false,
            polyline: true,
            circle: false,
            circlemarker: false,
            rectangle: false
        }
    },
    sport: {
        featureGroup: 'sportGroup',
        drawOptions: {
            polygon: false,
            polyline: true,
            circle: false,
            circlemarker: false,
            rectangle: false
        }
    },
    kultur: {
        featureGroup: 'kulturGroup',
        drawOptions: {
            polygon: false,
            polyline: true,
            circle: false,
            circlemarker: false,
            rectangle: false
        }
    },
    yesil: {
        featureGroup: 'yesilGroup',
        drawOptions: {
            polygon: true,
            polyline: false,
            circle: false,
            circlemarker: false,
            rectangle: false
        }
    },
    meydan: {
        featureGroup: 'meydanGroup',
        drawOptions: {
            polygon: true,
            polyline: false,
            circle: false,
            circlemarker: false,
            rectangle: false
        }
    }
};

// Çizim kontrollerini oluştur ve haritaya ekle
const drawControls = {};
Object.entries(drawConfigs).forEach(([key, config]) => {
    drawControls[key] = new L.Control.Draw({
        edit: {
            featureGroup: layers[key]
        },
        draw: config.drawOptions
    });
    map.addControl(drawControls[key]);
});

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
// İkon ve kontrol ayarları
const drawingControls = {
    agac: {
        id: 'draw-agac',
        key: 65, // A tuşu
        icon: {
            url: 'https://img.icons8.com/ios-glyphs/30/40C057/deciduous-tree--v1.png',
            size: [24, 24],
            anchor: [12, 24]
        },
        type: 'marker'
    },
    bank: {
        id: 'draw-bench',
        key: 66, // B tuşu
        icon: {
            url: 'https://img.icons8.com/ios-glyphs/30/FD7E14/city-bench.png',
            size: [24, 24],
            anchor: [12, 24]
        },
        type: 'marker'
    },
    heykel: {
        id: 'draw-statue',
        key: 84, // T tuşu
        icon: {
            url: 'https://img.icons8.com/ios-filled/50/FA5252/venus-de-milo--v2.png',
            size: [24, 24],
            anchor: [12, 24]
        },
        type: 'marker'
    },
    cafe: {
        id: 'draw-cafe',
        key: 67, // C tuşu
        icon: {
            url: 'https://img.icons8.com/parakeet/48/null/cafe.png',
            size: [24, 24],
            anchor: [12, 24]
        },
        type: 'marker'
    },
    wc: {
        id: 'draw-wc',
        key: 87, // W tuşu
        icon: {
            url: 'https://img.icons8.com/arcade/64/null/diarrhea.png',
            size: [24, 24],
            anchor: [12, 24]
        },
        type: 'marker'
    },
    sport: {
        id: 'draw-sport',
        key: 83, // S tuşu
        icon: {
            url: 'https://img.icons8.com/color/48/null/basketball.png',
            size: [24, 24],
            anchor: [12, 24]
        },
        type: 'marker'
    },
    kultur: {
        id: 'draw-culture',
        key: 75, // K tuşu
        icon: {
            url: 'https://img.icons8.com/office/30/null/theatre-mask.png',
            size: [25, 25],
            anchor: [12, 25]
        },
        type: 'marker'
    },
    yol: {
        id: 'draw-path',
        key: 89, // Y tuşu
        options: {
            color: 'yellow',
            weight: 6,
            opacity: 0.75,
            lineCap: "square"
        },
        type: 'polyline'
    },
    yesil: {
        id: 'draw-green',
        key: 76, // L tuşu
        options: {
            color: 'green',
            weight: 2,
            opacity: 1,
            fillColor: 'green',
            fillOpacity: 0.5,
            fill: true
        },
        type: 'polygon'
    },
    meydan: {
        id: 'draw-square',
        key: 77, // M tuşu
        options: {
            color: 'yellow',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.5,
            fill: true
        },
        type: 'polygon'
    }
};

// Ortak gölge ayarları
const shadowOptions = {
    url: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
    size: [30, 30],
    anchor: [15, 27]
};

// Çizim kontrollerini aktifleştiren fonksiyon
function activateDrawing(controlKey) {
    const control = drawingControls[controlKey];
    const drawControl = drawControls[controlKey];

    if (control.type === 'marker') {
        drawControl.setDrawingOptions({
            marker: {
                icon: new L.Icon({
                    iconUrl: control.icon.url,
                    shadowUrl: shadowOptions.url,
                    iconSize: control.icon.size,
                    iconAnchor: control.icon.anchor,
                    shadowSize: shadowOptions.size,
                    shadowAnchor: shadowOptions.anchor
                })
            }
        });
        drawControl._toolbars.draw._modes.marker.handler.enable();
    } else if (control.type === 'polyline' || control.type === 'polygon') {
        const options = {};
        options[control.type] = {
            shapeOptions: control.options
        };
        drawControl.setDrawingOptions(options);
        drawControl._toolbars.draw._modes[control.type].handler.enable();
    }

    type = controlKey;
}

// Event listener'ları ekle
Object.entries(drawingControls).forEach(([key, control]) => {
    // Buton tıklama
    document.getElementById(control.id).onclick = () => activateDrawing(key);
    
    // Klavye kısayolu
    document.addEventListener('keydown', (e) => {
        if (e.keyCode === control.key) {
            activateDrawing(key);
        }
    });
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

// Tüm türlerle tek bir GeoJSON oluşturup Dropbox'a yüklüyoruz
function uploadCombinedGeoJSON() {
    var combinedGeoJSON = {
        type: "FeatureCollection",
        features: []
    };

    // Tüm katmanlardan özellikleri topluyoruz
    Object.values(layers).forEach(layer => {
        var geojson = layer.toGeoJSON();
        if (geojson.features) {
            combinedGeoJSON.features.push(...geojson.features);
        }
    });

    // GeoJSON dosyasını oluşturuyoruz
    var geoBlob = new Blob([JSON.stringify(combinedGeoJSON)], { type: "application/json" });
    var fileName = getFileName() + ".geojson";
    var file = new File([geoBlob], fileName);

    // Dropbox API v2 ile dosya yükleme
    var dbx = new Dropbox.Dropbox({
        clientId: '3srgf2zk9ehxjuo',
        clientSecret: "sox2f4bp0rora92",
        refreshToken: "tS2SLNlfrDYAAAAAAAAAAdnWBjf2gdtW8RgC_2lGL30fBqX_gp-otnyQnVkGzY9f"
    });

    dbx.filesUpload({ path: "/" + file.name, contents: file })
        .then(function (response) {
            console.log("Dosya başarıyla yüklendi.");
            alert("Oldu! Sayenizde Matrix'i güncelledik.");
        })
        .catch(function (error) {
            console.error(error);
            // Dosyayı indir
            var downloadUrl = URL.createObjectURL(file);
            var link = document.createElement("a");
            link.href = downloadUrl;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (window.confirm('Matrix\'te bir hata ile karşılaştık fakat çalışmalarını kurtardık.\n\nTamam\'ı seçersen kodu düzeltmek için bir şans verip bize tasarımını mail atabilirsin. Vazgeç\'i seçersen her şey sona erer ve hayatına geri dönersin.')) {
                window.location.href = 'mailto:yilmazali13@itu.edu.tr';
            };
        });

    clearAllLayers();
}

// Dosya adı oluşturucu
function getFileName() {
    var date = new Date();
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    var hour = String(date.getHours()).padStart(2, '0');
    var minute = String(date.getMinutes()).padStart(2, '0');
    var second = String(date.getSeconds()).padStart(2, '0');
    return `map_${kullaniciadi}_${year}${month}${day}_${hour}${minute}${second}`;
}

// Son eklenen katmanı sil
function removeLastLayer(layerGroup) {
    if (layerGroup && layerGroup.getLayers().length > 0) {
        const layers = layerGroup.getLayers();
        layerGroup.removeLayer(layers[layers.length - 1]);
    }
}

// Geri al fonksiyonu
function undoDraw() {
    if (!type) return;
    
    // Katmanı bul ve son eklenen öğeyi sil
    const selectedLayer = layers[type];
    if (selectedLayer) {
        removeLastLayer(selectedLayer);
    } else {
        console.warn(`${type} için katman bulunamadı`);
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
