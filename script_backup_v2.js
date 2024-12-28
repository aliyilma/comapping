// --- MODAL FUNCTIONS ---

let userInfo = {};

function saveAndContinue() {
    const username = document.getElementById("username").value;
    const age = document.getElementById("age").value;
    const group = document.getElementById("group").value;
    const frequency = document.getElementById("frequency").value;

    if (username && age && group && frequency) {
        userInfo = { username, age, group, frequency };
        document.getElementById("user-modal").style.display = "none";
        alert("Kullanıcı bilgileri kaydedildi. Haritaya devam edebilirsiniz!");
    } else {
        alert("Lütfen tüm alanları doldurun.");
    }
}

// Show modal on page load
window.onload = () => {
    document.getElementById("user-modal").style.display = "block";
};

// --- MAP INITIALIZATION ---

const map = L.map('map', {
    maxBounds: [[41.01874865817629, 28.971567095902117], [41.01413366017337, 28.97923475870823]]
}).setView([41.016596, 28.975677], 17);

L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoic2Fyc2FyaG9zIiwiYSI6ImNtNTNxa2s4dTJhMDEyanNkNG0wODFzYTgifQ.-fITMwABFFCOan5-3LrYtg', {
    maxZoom: 20,
    minZoom: 17,
    attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
}).addTo(map);

L.control.scale().addTo(map);

// Load GeoJSON data
async function loadShapefile() {
    const url = 'https://raw.githubusercontent.com/aliyilma/comapping/main/sirkeci.geojson';
    const response = await fetch(url);
    const shapeObj = await response.json();
    return shapeObj;
}
loadShapefile().then(L.geoJson).then(map.addLayer.bind(map));

// --- FEATURE GROUPS ---

const featureGroups = {
    'agac': new L.FeatureGroup(),
    'bench': new L.FeatureGroup(),
    'statue': new L.FeatureGroup(),
    'cafe': new L.FeatureGroup(),
    'wc': new L.FeatureGroup(),
    'sport': new L.FeatureGroup(),
    'culture': new L.FeatureGroup(),
    'path': new L.FeatureGroup(),
    'green': new L.FeatureGroup(),
    'square': new L.FeatureGroup()
};

Object.values(featureGroups).forEach(group => map.addLayer(group));

let currentDrawType;

// --- DRAW CONTROLS ---

function createDrawControl(featureGroup, drawOptions) {
    return new L.Control.Draw({
        edit: {
            featureGroup: featureGroup,
        },
        draw: drawOptions
    });
}

const drawControls = {
    'agac': createDrawControl(featureGroups.agac, {
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false,
        marker: {
            icon: L.icon({
                iconUrl: 'https://img.icons8.com/ios-glyphs/30/40C057/deciduous-tree--v1.png',
                shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                iconSize: [24, 24], iconAnchor: [12, 24], shadowSize: [30, 30], shadowAnchor: [15, 27]
            })
        }
    }),
    'bench': createDrawControl(featureGroups.bench, {
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false,
        marker: {
            icon: L.icon({
                iconUrl: 'https://img.icons8.com/ios-glyphs/30/FD7E14/city-bench.png',
                shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                iconSize: [24, 24], iconAnchor: [12, 24], shadowSize: [30, 30], shadowAnchor: [15, 27]
            })
        }
    }),
    'statue': createDrawControl(featureGroups.statue, {
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false,
        marker: {
            icon: L.icon({
                iconUrl: 'https://img.icons8.com/ios-filled/50/FA5252/venus-de-milo--v2.png',
                shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                iconSize: [24, 24], iconAnchor: [12, 24], shadowSize: [30, 30], shadowAnchor: [15, 27]
            })
        }
    }),
    'cafe': createDrawControl(featureGroups.cafe, {
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false,
        marker: {
            icon: L.icon({
                iconUrl: 'https://img.icons8.com/parakeet/48/null/cafe.png',
                shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                iconSize: [24, 24], iconAnchor: [12, 24], shadowSize: [30, 30], shadowAnchor: [15, 27]
            })
        }
    }),
    'wc': createDrawControl(featureGroups.wc, {
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false,
        marker: {
            icon: L.icon({
                iconUrl: 'https://img.icons8.com/arcade/64/null/diarrhea.png',
                shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                iconSize: [24, 24], iconAnchor: [12, 24], shadowSize: [30, 30], shadowAnchor: [15, 27]
            })
        }
    }),
    'sport': createDrawControl(featureGroups.sport, {
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false,
        marker: {
            icon: L.icon({
                iconUrl: 'https://img.icons8.com/color/48/null/basketball.png',
                shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                iconSize: [24, 24], iconAnchor: [12, 24], shadowSize: [30, 30], shadowAnchor: [15, 27]
            })
        }
    }),
    'culture': createDrawControl(featureGroups.culture, {
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false,
        marker: {
            icon: L.icon({
                iconUrl: 'https://img.icons8.com/office/30/null/theatre-mask.png',
                shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
                iconSize: [25, 25], iconAnchor: [12, 25], shadowSize: [32, 32], shadowAnchor: [16, 27]
            })
        }
    }),
    'path': createDrawControl(featureGroups.path, {
        polygon: false, polyline: true, circle: false, circlemarker: false, rectangle: false,
        polyline: { shapeOptions: { color: 'yellow', weight: 6, opacity: 0.75, lineCap: "square" } }
    }),
    'green': createDrawControl(featureGroups.green, {
        polygon: true, polyline: false, circle: false, circlemarker: false, rectangle: false,
        polygon: { shapeOptions: { color: 'green', weight: 2, opacity: 1, fillColor: 'green', fillOpacity: 0.5, fill: true } }
    }),
    'square': createDrawControl(featureGroups.square, {
        polygon: true, polyline: false, circle: false, circlemarker: false, rectangle: false,
        polygon: { shapeOptions: { color: 'yellow', weight: 2, opacity: 1, fillOpacity: 0.5, fill: true } }
    })
};

// Add draw controls to map (initially hidden)
Object.values(drawControls).forEach(control => map.addControl(control));

// --- EVENT HANDLERS FOR DRAWING ---

map.on(L.Draw.Event.CREATED, function (e) {
    const layerType = e.layerType;
    const layer = e.layer;

    if (layerType === 'marker') {
        const iconUrl = layer.options.icon.options.iconUrl;
        if (iconUrl.includes("tree")) featureGroups.agac.addLayer(layer);
        else if (iconUrl.includes("bench")) featureGroups.bench.addLayer(layer);
        else if (iconUrl.includes("venus")) featureGroups.statue.addLayer(layer);
        else if (iconUrl.includes("cafe")) featureGroups.cafe.addLayer(layer);
        else if (iconUrl.includes("diarrhea")) featureGroups.wc.addLayer(layer);
        else if (iconUrl.includes("basketball")) featureGroups.sport.addLayer(layer);
        else if (iconUrl.includes("mask")) featureGroups.culture.addLayer(layer);
    } else if (layerType === 'polyline') {
        featureGroups.path.addLayer(layer);
    } else if (layerType === 'polygon') {
        const color = layer.options.color;
        if (color.includes("yellow")) featureGroups.square.addLayer(layer);
        else if (color.includes("green")) featureGroups.green.addLayer(layer);
    }
});

// --- BUTTON CLICK HANDLERS ---

const buttonActions = {
    'draw-agac': () => { currentDrawType = 'agac'; drawControls.agac._toolbars.draw._modes.marker.handler.enable(); },
    'draw-bench': () => { currentDrawType = 'bench'; drawControls.bench._toolbars.draw._modes.marker.handler.enable(); },
    'draw-statue': () => { currentDrawType = 'statue'; drawControls.statue._toolbars.draw._modes.marker.handler.enable(); },
    'draw-cafe': () => { currentDrawType = 'cafe'; drawControls.cafe._toolbars.draw._modes.marker.handler.enable(); },
    'draw-wc': () => { currentDrawType = 'wc'; drawControls.wc._toolbars.draw._modes.marker.handler.enable(); },
    'draw-sport': () => { currentDrawType = 'sport'; drawControls.sport._toolbars.draw._modes.marker.handler.enable(); },
    'draw-culture': () => { currentDrawType = 'culture'; drawControls.culture._toolbars.draw._modes.marker.handler.enable(); },
    'draw-path': () => { currentDrawType = 'path'; drawControls.path._toolbars.draw._modes.polyline.handler.enable(); },
    'draw-green': () => { currentDrawType = 'green'; drawControls.green._toolbars.draw._modes.polygon.handler.enable(); },
    'draw-square': () => { currentDrawType = 'square'; drawControls.square._toolbars.draw._modes.polygon.handler.enable(); },
    'reset': clearDraw,
    'undo': undoDraw,
    'upload': finishDraw
};

for (const buttonId in buttonActions) {
    document.getElementById(buttonId).onclick = buttonActions[buttonId];
}

// --- KEYBOARD SHORTCUTS ---

document.addEventListener('keydown', function (e) {
    switch (e.key) {
        case 't': case 'T': buttonActions['draw-statue'](); break;
    }
});

// --- DRAWING MANAGEMENT FUNCTIONS ---

function finishDraw() {
    if (window.confirm("Gerçekten mi?")) {
        uploadGeojson();
    }
}

function uploadGeojson() {
    const allFeatures = Object.entries(featureGroups).flatMap(([type, group]) =>
        group.toGeoJSON().features.map(feature => ({
            ...feature,
            properties: { ...feature.properties, type }
        }))
    );

    const geoJSON = {
        type: "FeatureCollection",
        properties: {
            username: userInfo.username,
            age: userInfo.age,
            group: userInfo.group,
            frequency: userInfo.frequency
        },
        features: allFeatures
    };

    const fileName = `map_${userInfo.username}_${new Date().toLocaleString('tr-TR').replace(/[\/\s,:]/g, '-')}.geojson`;
    const file = new File([JSON.stringify(geoJSON)], fileName);

    const dbx = new Dropbox.Dropbox({
        clientId: '3srgf2zk9ehxjuo',
        clientSecret: "sox2f4bp0rora92",
        refreshToken: "tS2SLNlfrDYAAAAAAAAAAdnWBjf2gdtW8RgC_2lGL30fBqX_gp-otnyQnVkGzY9f"
    });

    dbx.filesUpload({ path: `/${file.name}`, contents: file })
        .then(() => alert("Oldu! Sayenizde Matrix'i güncelledik."))
        .catch(() => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(file);
            link.download = file.name;
            link.click();

            if (confirm('Matrix\'te bir hata ile karşılaştık fakat çalışmalarını kurtardık.\n\nTamam\'ı seçersen kodu düzeltmek için bir şans verip bize tasarımını mail atabilirsin. Vazgeç\'i seçersen her şey sona erer ve hayatına geri dönersin.')) {
                location.href = 'mailto:yilmazali13@itu.edu.tr';
            }
        })
        .finally(() => Object.values(featureGroups).forEach(group => group.clearLayers()));
}

function undoDraw() {
    if (currentDrawType && featureGroups[currentDrawType].getLayers().length > 0) {
        const layers = featureGroups[currentDrawType].getLayers();
        featureGroups[currentDrawType].removeLayer(layers[layers.length - 1]);
    }
}

function clearDraw() {
    if (window.confirm("Yanlışlıkla basma diye buradayım. Emin misin?")) {
        Object.values(featureGroups).forEach(group => group.clearLayers());
    }
}

// --- MAP RESIZE ---

$(window).on("resize", function () {
    $("#map").height($(window).height() - 100).width($(window).width() - 15);
    map.invalidateSize();
}).trigger("resize");