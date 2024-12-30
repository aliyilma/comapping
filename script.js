// --- MODAL FUNCTIONALITY ---

let userInfo = {};
let startTime, endTime;

function handleSaveAndContinue() {
    const username = document.getElementById("username").value;
    const age = document.getElementById("age").value;
    const group = document.getElementById("group").value;
    const frequency = document.getElementById("frequency").value;
    const tech = document.getElementById("tech").value;

    if (username && age && group && frequency && tech) {
        userInfo = { username, age, group, frequency, tech };
        document.getElementById("user-modal").style.display = "none";

        startTime = new Date();
    } else {
        alert("Lütfen tüm alanları doldurun.");
    }
}

// Show modal on page load
window.onload = () => {document.getElementById("user-modal").style.display = "block";};

// --- MAP INITIALIZATION ---

const mapContainerId = 'map';
const initialView = [41.016596, 28.975677];
const initialZoom = 17.5;
//const mapOptions = {maxBounds: [[41.01874865817629, 28.971567095902117], [41.01413366017337, 28.97923475870823]]};

const map = L.map(mapContainerId).setView(initialView, initialZoom);

const tileLayerURL = 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
const tileLayerOptions = {
    maxZoom: 20,
    minZoom: 17,
    attribution: 'Mapbox',
};

L.tileLayer(tileLayerURL, tileLayerOptions).addTo(map);
L.control.scale().addTo(map);

async function loadGeoJSONLayers() {
    const urls = {
        sirkeci: 'https://raw.githubusercontent.com/aliyilma/comapping/refs/heads/main/sirkeci.geojson',
        sirkeciGenis: 'https://raw.githubusercontent.com/aliyilma/comapping/refs/heads/main/sirkeci_genis.geojson'
    };

    const styles = {
        sirkeci: {
            color: 'red',
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.2,
            fill: true
        },
        sirkeciGenis: {
            color: 'yellow',
            weight: 1.5,
            opacity: 0.8,
            fillOpacity: 0.2,
            fill: true,
            dashArray: '2, 4'
        }
    };

    try {
        const [sirkeciGenis, sirkeci] = await Promise.all([
            fetch(urls.sirkeciGenis).then(resp => resp.json()),
            fetch(urls.sirkeci).then(resp => resp.json())

        ]);
        
        const sirkeciGenisLayer = L.geoJson(sirkeciGenis, { style: styles.sirkeciGenis }).addTo(map);
        const sirkeciLayer = L.geoJson(sirkeci, { style: styles.sirkeci }).addTo(map);

        // Layer control için overlay maps
        const overlayMaps = {
            "Sirkeci": sirkeciLayer,
            "Sirkeci Geniş Alan": sirkeciGenisLayer
        };

        L.control.layers(null, overlayMaps, {
            position: 'topright',
            collapsed: false
        }).addTo(map);

    } catch (error) {
        console.error("GeoJSON yüklenirken hata:", error);
    }
}

loadGeoJSONLayers();

// --- FEATURE DRAWING ---

const drawingLayers = {
    agac: new L.FeatureGroup(),
    bench: new L.FeatureGroup(),
    statue: new L.FeatureGroup(),
    cafe: new L.FeatureGroup(),
    wc: new L.FeatureGroup(),
    sport: new L.FeatureGroup(),
    culture: new L.FeatureGroup(),
    path: new L.FeatureGroup(),
    green: new L.FeatureGroup(),
    square: new L.FeatureGroup()
};

// Add all drawing layers to the map
Object.values(drawingLayers).forEach(layerGroup => map.addLayer(layerGroup));

let currentDrawingType = null;

// Helper function to create marker icons
const createMarkerIcon = (iconUrl) => L.icon({
    iconUrl: iconUrl,
    shadowUrl: 'https://img.icons8.com/ios-filled/50/FFFFFF/filled-circle.png',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    shadowSize: [24, 24],
    shadowAnchor: [12, 12]
});

// Function to create draw controls with consistent options
function createDrawControl(layerGroup, drawOptions) {
    return new L.Control.Draw({
        edit: { featureGroup: layerGroup },
        draw: drawOptions
    });
}

const drawControls = {
    agac: createDrawControl(drawingLayers.agac, {
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false,
        marker: { icon: createMarkerIcon('https://img.icons8.com/ios-glyphs/30/40C057/deciduous-tree--v1.png') }
    }),
    bench: createDrawControl(drawingLayers.bench, {
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false,
        marker: { icon: createMarkerIcon('https://img.icons8.com/ios-glyphs/30/FD7E14/city-bench.png') }
    }),
    statue: createDrawControl(drawingLayers.statue, {
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false,
        marker: { icon: createMarkerIcon('https://img.icons8.com/ios-filled/50/FA5252/venus-de-milo--v2.png') }
    }),
    cafe: createDrawControl(drawingLayers.cafe, {
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false,
        marker: { icon: createMarkerIcon('https://img.icons8.com/parakeet/48/null/cafe.png') }
    }),
    wc: createDrawControl(drawingLayers.wc, {
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false,
        marker: { icon: createMarkerIcon('https://img.icons8.com/arcade/64/null/diarrhea.png') }
    }),
    sport: createDrawControl(drawingLayers.sport, {
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false,
        marker: { icon: createMarkerIcon('https://img.icons8.com/color/48/null/basketball.png') }
    }),
    culture: createDrawControl(drawingLayers.culture, {
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false,
        marker: { icon: createMarkerIcon('https://img.icons8.com/office/30/null/theatre-mask.png') }
    }),
    path: createDrawControl(drawingLayers.path, {
        polygon: false, polyline: true, circle: false, circlemarker: false, rectangle: false,
        polyline: { shapeOptions: { color: 'orange', weight: 2, opacity: 1, lineCap: "square" } }
    }),
    green: createDrawControl(drawingLayers.green, {
        polygon: true, polyline: false, circle: false, circlemarker: false, rectangle: false,
        polygon: { shapeOptions: { color: 'green', weight: 2, opacity: 1, fillOpacity: 0.5, fill: true } }
    }),
    square: createDrawControl(drawingLayers.square, {
        polygon: true, polyline: false, circle: false, circlemarker: false, rectangle: false,
        polygon: { shapeOptions: { color: 'yellow', weight: 2, opacity: 1, fillOpacity: 0.5, fill: true } }
    })
};

// Initially add all draw controls to the map (they are shown/hidden as needed)
Object.values(drawControls).forEach(control => map.addControl(control));

// --- DRAWING EVENT HANDLING ---

map.on(L.Draw.Event.CREATED, function (e) {
    const layerType = e.layerType;
    const layer = e.layer;

    if (layerType === 'marker') {
        const iconUrl = layer.options.icon.options.iconUrl;
        if (iconUrl.includes("tree")) drawingLayers.agac.addLayer(layer);
        else if (iconUrl.includes("bench")) drawingLayers.bench.addLayer(layer);
        else if (iconUrl.includes("venus")) drawingLayers.statue.addLayer(layer);
        else if (iconUrl.includes("cafe")) drawingLayers.cafe.addLayer(layer);
        else if (iconUrl.includes("diarrhea")) drawingLayers.wc.addLayer(layer);
        else if (iconUrl.includes("basketball")) drawingLayers.sport.addLayer(layer);
        else if (iconUrl.includes("mask")) drawingLayers.culture.addLayer(layer);
    } else if (layerType === 'polyline') {
        drawingLayers.path.addLayer(layer);
    } else if (layerType === 'polygon') {
        const color = layer.options.color;
        if (color.includes("yellow")) drawingLayers.square.addLayer(layer);
        else if (color.includes("green")) drawingLayers.green.addLayer(layer);
    }
});

// --- BUTTON EVENT LISTENERS ---

const enableDrawing = (drawType) => {
    currentDrawingType = drawType;
    drawControls[drawType]._toolbars.draw._modes.marker?.handler.enable(); // Use optional chaining for safety
    drawControls[drawType]._toolbars.draw._modes.polyline?.handler.enable();
    drawControls[drawType]._toolbars.draw._modes.polygon?.handler.enable();
};

document.getElementById('draw-agac').onclick = () => enableDrawing('agac');
document.getElementById('draw-bench').onclick = () => enableDrawing('bench');
document.getElementById('draw-statue').onclick = () => enableDrawing('statue');
document.getElementById('draw-cafe').onclick = () => enableDrawing('cafe');
document.getElementById('draw-wc').onclick = () => enableDrawing('wc');
document.getElementById('draw-sport').onclick = () => enableDrawing('sport');
document.getElementById('draw-culture').onclick = () => enableDrawing('culture');
document.getElementById('draw-path').onclick = () => enableDrawing('path');
document.getElementById('draw-green').onclick = () => enableDrawing('green');
document.getElementById('draw-square').onclick = () => enableDrawing('square');
document.getElementById('reset').onclick = clearDrawing;
document.getElementById('undo').onclick = undoLastDrawing;
document.getElementById('upload').onclick = handleFinishDrawing;
document.getElementById('continue-btn').onclick = handleSaveAndContinue;


// --- DRAWING MANAGEMENT FUNCTIONS ---

function handleFinishDrawing() {
    if (window.confirm("Matrix'i daha güzel hale getirmek istediğinize emin misiniz?")) {
        uploadGeoJSONData();
    }
}

function collectDrawingFeatures() {
    return Object.entries(drawingLayers).flatMap(([type, layerGroup]) =>
        layerGroup.toGeoJSON().features.map(feature => ({
            ...feature,
            properties: { ...feature.properties, type }
        }))
    );
}

function createGeoJSONPayload(features) {
    const duration = ((new Date() - startTime) / 1000).toFixed(2);
    return {
        type: "FeatureCollection",
        properties: { ...userInfo, duration: `${duration}` },
        features: features
    };
}

function generateFilename() {
    const timestamp = new Date().toLocaleString('tr-TR').replace(/[\/\s,:]/g, '-');
    return `comapping_${userInfo.username}_${timestamp}.geojson`;
}

function uploadGeoJSONData() {
    const features = collectDrawingFeatures();
    const geoJSONPayload = createGeoJSONPayload(features);
    const fileName = generateFilename();
    const file = new File([JSON.stringify(geoJSONPayload)], fileName);

    const dropboxClient = new Dropbox.Dropbox({
        clientId: '3srgf2zk9ehxjuo',
        clientSecret: "sox2f4bp0rora92",
        refreshToken: "tS2SLNlfrDYAAAAAAAAAAdnWBjf2gdtW8RgC_2lGL30fBqX_gp-otnyQnVkGzY9f"
    });

    dropboxClient.filesUpload({ path: `/${fileName}`, contents: file })
        .then(() => alert("Oldu, sayenizde Matrix'i güncelledik!"))
        .catch(() => {
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(file);
            downloadLink.download = fileName;
            downloadLink.click();

            if (confirm('Yükleme sırasında bir hata oluştu. Çalışmanızı indirmek ister misiniz?\n\nTamam\'ı seçerseniz, çalışmanızı bize e-posta ile gönderebilirsiniz.')) {
                location.href = 'mailto:yilmazali13@itu.edu.tr';
            }
        })
        .finally(() => Object.values(drawingLayers).forEach(layerGroup => layerGroup.clearLayers()));
}

function undoLastDrawing() {
    if (currentDrawingType && drawingLayers[currentDrawingType].getLayers().length > 0) {
        const layers = drawingLayers[currentDrawingType].getLayers();
        drawingLayers[currentDrawingType].removeLayer(layers[layers.length - 1]);
    }
}

function clearDrawing() {
    if (window.confirm("Matrix'teki tüm varlığınızı temizlemek istediğinize emin misiniz?")) {
        Object.values(drawingLayers).forEach(layerGroup => layerGroup.clearLayers());
    }
}

// --- MAP RESIZE ---

$(window).on("resize", function () {
    $("#map").height($(window).height() - 20).width($(window).width() - 15);
    map.invalidateSize();
}).trigger("resize");
