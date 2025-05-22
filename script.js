// --- 1. GLOBAL DEĞİŞKENLER ---

/**
 * @type {Object} userInfo - Kullanıcıya özgü verileri ve etkileşim günlüklerini depolar.
 * @property {Array<Object>} zoomLevels - Zaman damgalarıyla birlikte yakınlaştırma düzeyi değişikliklerinin günlüğü.
 * @property {Array<Object>} toolUsages - Çizim aracı kullanımının, eylemlerin ve zaman damgalarının günlüğü.
 * @property {Array<Object>} panEvents - Mesafe ve zaman damgalarıyla birlikte harita kaydırma olaylarının günlüğü.
 * @property {Array<Object>} toolActivity - Hangi aracın ne zaman aktif/deaktif edildiğinin günlüğü. // YENİ
 * @property {string} startTime - Haritalama oturumunun başladığı zamanın zaman damgası.
 * @property {string} endTime - Haritalama oturumunun sona erdiği zamanın zaman damgası.
 * @property {string} username - Kullanıcının girdiği rumuz.
 * @property {string} age - Kullanıcının girdiği yaş.
 * @property {string} group - Kullanıcının seçtiği kullanıcı grubu.
 * @property {string} frequency - Kullanıcının seçtiği kullanım sıklığı.
 * @property {string} tech - Kullanıcının seçtiği teknoloji aşinalık düzeyi.
 * @property {string} district - Kullanıcının seçtiği ilçe.
 * @property {string} neighborhood - Kullanıcının seçtiği mahalle.
 */
let userInfo = {
    zoomLevels: [],
    toolUsages: [],
    panEvents: [],
    toolActivity: [], // YENİ: Araç aktivite günlüğü
    district: null,
    neighborhood: null,
    userAgent: null,
    screenSize: null,
    referer: null,
    touchScreen: null,
};

let activeDrawHandler = null; // Aktif çizim aracını tutacak değişken
let startTime, endTime; // Oturum başlangıç ve bitiş zamanları
let mahallelerData; // mahalleler.json dosyasından gelen veriyi saklar
let drawHistory = []; // Çizim geçmişini saklamak için dizi
let undoHistory = []; // Geri alma geçmişini saklamak için dizi

// --- 2. MODAL İŞLEVSELLİĞİ ---

/**
 * Kullanıcı bilgilerini modalden kaydetmeyi ve harita oturumunu başlatmayı yönetir.
 * Kullanıcı girişlerini alır, doğrular, userInfo'da saklar, modali gizler ve startTime'ı ayarlar.
 */
function handleSaveAndContinue() {
    // Modal formundan kullanıcı giriş değerlerini al
    const username = document.getElementById("username").value;
    const age = document.getElementById("age").value;
    const group = document.getElementById("group").value;
    const frequency = document.getElementById("frequency").value;
    const district = document.getElementById("district").value;
    const neighborhood = document.getElementById("neighborhood").value;
    const mapFamiliarity = document.getElementById("map-familiarity").value;
    const GISFamiliarity = document.getElementById("gis-familiarity").value;
    const onlineParticipation = document.getElementById("online-participation").value;

    const userAgent = navigator.userAgent;
    const screenSize = `${window.screen.width}x${window.screen.height}`;
    const referrer = document.referrer;
    const touchScreen = navigator.maxTouchPoints > 0;

    console.log("User Agent:", userAgent);
    console.log("Screen Size:", screenSize);
    console.log("Referrer URL:", referrer);
    console.log("Touch Screen:", touchScreen);

    // Tüm alanların doldurulduğunu doğrula
    if (username && age && group && frequency && district && neighborhood && mapFamiliarity && GISFamiliarity && onlineParticipation) {
        // Kullanıcı bilgilerini sakla
        userInfo = {
            userAgent, screenSize, username, age, group, frequency,mapFamiliarity, GISFamiliarity, onlineParticipation, district, neighborhood,
            toolUsages: [],
            zoomLevels: [],
            panEvents: [],
            toolActivity: [], // YENİ: toolActivity'yi burada da başlat
        };
        document.getElementById("user-modal").style.display = "none"; // Modali gizle

        startTime = new Date(); // Oturum başlangıç zamanını kaydet
        userInfo.startTime = startTime.toISOString(); // Başlangıç zamanını userInfo'da sakla
    } else {
        alert("Lütfen tüm alanları doldurun."); // Doğrulama başarısız olursa kullanıcıyı tüm alanları doldurmaya uyar
    }
}

async function loadDistricts() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/aliyilma/comapping/refs/heads/main/mahalleler.json');
        mahallelerData = await response.json();
        const districtSelect = document.getElementById('district');
        Object.keys(mahallelerData).forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Mahalleler JSON dosyası yüklenirken hata:", error);
    }
}


// Sayfa yüklendiğinde kullanıcı modalini göster ve ilçeleri yükle
window.onload = () => {
    loadDistricts(); // İlçeleri yükle
    document.getElementById("consent-modal").style.display = "block";
    console.log("Sayfa yüklendi, onam modalı gösteriliyor.");
};

// Onam modalındaki butona tıklama olayı
document.getElementById('consent-agree-btn').addEventListener('click', function() {
    document.getElementById('consent-modal').style.display = 'none'; // Onam modalını gizle
    document.getElementById('workflow-modal').style.display = 'block'; // YENİ: Çalışma Akışı modalını göster
    console.log("Onay verildi, çalışma akışı modalı gösteriliyor.");
});

// YENİ: Çalışma Akışı modalındaki devam butonuna tıklama olayı
document.getElementById('workflow-continue-btn').addEventListener('click', function() {
    document.getElementById('workflow-modal').style.display = 'none'; // Çalışma Akışı modalını gizle
    document.getElementById('user-modal').style.display = 'block'; // Kullanıcı bilgi modalını göster
    console.log("Çalışma akışı anlaşıldı, kullanıcı bilgi modalı gösteriliyor.");
});


document.getElementById('district').addEventListener('change', function() {
    const selectedDistrict = this.value;
    const neighborhoodSelect = document.getElementById('neighborhood');
    neighborhoodSelect.innerHTML = '<option value="">Lütfen bir mahalle seçiniz</option>'; // Önceki mahalleleri temizle

    if (selectedDistrict && mahallelerData[selectedDistrict]) {
        mahallelerData[selectedDistrict].forEach(neighborhood => {
            const option = document.createElement('option');
            option.value = neighborhood;
            option.textContent = neighborhood;
            neighborhoodSelect.appendChild(option);
        });
        neighborhoodSelect.disabled = false; // Mahalle seçimini aktif hale getir
    } else {
        neighborhoodSelect.disabled = true; // İlçe seçilmediyse mahalleyi pasif yap
    }
});


// --- 3. HARİTA BAŞLATMA ---

const mapContainerId = 'map'; // Harita için HTML konteyner ID'si
const initialView = [41.016677, 28.974282]; // Başlangıç harita merkezi koordinatları (enlem, boylam)
const initialZoom = 17.5; // Başlangıç harita yakınlaştırma düzeyi

const map = L.map(mapContainerId, {zoomSnap: 0.5, zoomDelta: 0.5}).setView(initialView, initialZoom); // Leaflet harita örneği oluştur

const tileLayerURL = 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'; // Google Uydu karo katmanı için URL
const tileLayerOptions = {
    maxZoom: 21,
    minZoom: 16,
    attribution: 'Mapbox',
};

L.tileLayer(tileLayerURL, tileLayerOptions).addTo(map); // Haritaya karo katmanı ekle
L.control.scale().addTo(map); // Haritaya ölçek kontrolü ekle

// --- 4. HARİTA OLAY DİNLEYİCİLERİ ---

/**
 * Harita yakınlaştırma değişiklikleri için olay dinleyicisi.
 * Yakınlaştırma düzeyini ve zaman damgasını userInfo.zoomLevels'a kaydeder.
 */
map.on('zoomend', function () {
    const currentZoom = map.getZoom();
    const zoomDatetime = new Date().toISOString();
    userInfo.zoomLevels.push({ zoomLevel: currentZoom, datetime: zoomDatetime });
    console.log("Yakınlaştırma:", currentZoom, "Tarih:", zoomDatetime);
});

let lastCenter = map.getCenter(); // Başlangıç harita merkezini sakla

/**
 * Harita kaydırma (hareket) olayları için olay dinleyicisi.
 * Kaydırma mesafesini ve zaman damgasını userInfo.panEvents'e hesaplar ve kaydeder.
 */
map.on('moveend', function () {
    const currentCenter = map.getCenter();
    const panDatetime = new Date().toISOString();
    const distance = lastCenter.distanceTo(currentCenter); // Metre cinsinden mesafe

    if (distance > 0) {
        userInfo.panEvents.push({ distance: distance.toFixed(2), datetime: panDatetime });
        console.log("Harita kaydırma:", distance.toFixed(2), "Tarih:", panDatetime);
    }
    lastCenter = currentCenter; // Sonraki hareket olayı için lastCenter'ı güncelle
});

// --- 5. GEOJSON KATMAN YÜKLEME ---

async function loadGeoJSONLayers() {
    const urls = {
        sirkeci: 'https://raw.githubusercontent.com/aliyilma/comapping/refs/heads/main/sirkeci.geojson'
    };
    const styles = {
        sirkeci: { color: 'red', weight: 2, opacity: 1, dashArray: '10, 5',
            fillColor: 'black', fillOpacity: 0.6, fill: true }
    };

    try {
        const [sirkeci] = await Promise.all([
            fetch(urls.sirkeci).then(resp => resp.json())
        ]);

        const sirkeciLayer = L.geoJson(sirkeci, { style: styles.sirkeci }).addTo(map);

        const overlayMaps = { "Sirkeci": sirkeciLayer };
        L.control.layers(null, overlayMaps, { position: 'topright', collapsed: false }).addTo(map);
    } catch (error) {
        console.error("GeoJSON yüklenirken hata:", error);
    }
}

loadGeoJSONLayers();

// --- 6. ÖZELLİK ÇİZİMİ ---

const drawingLayers = {
    agac: new L.FeatureGroup(), bench: new L.FeatureGroup(), statue: new L.FeatureGroup(),
    cafe: new L.FeatureGroup(), wc: new L.FeatureGroup(), sport: new L.FeatureGroup(),
    culture: new L.FeatureGroup(), path: new L.FeatureGroup(), green: new L.FeatureGroup(),
    square: new L.FeatureGroup(), treeRow: new L.FeatureGroup()
};

Object.values(drawingLayers).forEach(layerGroup => map.addLayer(layerGroup));

let currentDrawingType = null;

function createDrawControl(layerGroup, drawOptions) {
    return new L.Control.Draw({ edit: { featureGroup: layerGroup }, draw: drawOptions });
}

const drawControls = {
    agac: createDrawControl(drawingLayers.agac, {
        marker: {
            icon: L.icon({
                iconUrl: 'https://img.icons8.com/stickers/48/deciduous-tree.png',
                iconSize: [20, 20],
                iconAnchor: [10, 20]
            })
        },
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false
    }),
    bench: createDrawControl(drawingLayers.bench, {
        marker: {
            icon: L.icon({
                iconUrl: 'https://img.icons8.com/stickers/48/city-bench.png',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            })
        },
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false
    }),
    statue: createDrawControl(drawingLayers.statue, {
        marker: {
            icon: L.icon({
                iconUrl: 'https://img.icons8.com/stickers/48/statue.png',
                iconSize: [24, 24],
                iconAnchor: [12, 24]
            })
        },
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false
    }),
    cafe: createDrawControl(drawingLayers.cafe, {
        marker: {
            icon: L.icon({
                iconUrl: 'https://img.icons8.com/stickers/48/espresso-cup.png',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            })
        },
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false
    }),
    wc: createDrawControl(drawingLayers.wc, {
        marker: {
            icon: L.icon({
                iconUrl: 'https://img.icons8.com/stickers/48/toilet-bowl.png',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            })
        },
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false
    }),
    sport: createDrawControl(drawingLayers.sport, {
        marker: {
            icon: L.icon({
                iconUrl: 'https://img.icons8.com/stickers/48/basketball.png',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            })
        },
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false
    }),
    culture: createDrawControl(drawingLayers.culture, {
        marker: {
            icon: L.icon({
                iconUrl: 'https://img.icons8.com/stickers/48/theatre-mask.png',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            })
        },
        polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false
    }),
    path: createDrawControl(drawingLayers.path, { polyline: { shapeOptions: { color: 'orange', weight: 2, opacity: 1, lineCap: "square" } }, polygon: false, marker: false, circle: false, circlemarker: false, rectangle: false }),
    green: createDrawControl(drawingLayers.green, { polygon: { shapeOptions: { color: 'green', weight: 2, opacity: 1, fillOpacity: 0.5, fill: true } }, polyline: false, marker: false, circle: false, circlemarker: false, rectangle: false }),
    square: createDrawControl(drawingLayers.square, { polygon: { shapeOptions: { color: 'yellow', weight: 2, opacity: 1, fillOpacity: 0.5, fill: true } }, polyline: false, marker: false, circle: false, circlemarker: false, rectangle: false })
};

Object.values(drawControls).forEach(control => map.addControl(control));

// --- 7. ÇİZİM OLAY İŞLEYİCİ ---

map.on(L.Draw.Event.CREATED, function (e) {
    const layerType = e.layerType;
    const layer = e.layer;
    const creationDatetime = new Date().toISOString();
    const currentTool = currentDrawingType;
    const actionType = 'creation';

    if (!currentTool) {
        console.warn("Bir çizim aracı seçili değilken çizim oluşturuldu.", e);
        return;
    }

    let vertexCount = 0;
    if (layerType === 'marker') {
        vertexCount = 1;
    } else if (layerType === 'polyline') {
        vertexCount = layer.getLatLngs().length;
    } else if (layerType === 'polygon') {
        vertexCount = layer.getLatLngs()[0].length;
    }

    userInfo.toolUsages.push({
        tool: currentTool,
        actionType: actionType,
        datetime: creationDatetime,
        vertexCount: vertexCount
    });
    console.log("Araç:", currentTool, "Eylem:", actionType, "Zaman:", creationDatetime, "Vertex:", vertexCount);

    let featureAdded = false;

    if (layerType === 'marker') {
        const targetLayerGroup = drawingLayers[currentTool];
        if (targetLayerGroup) {
            targetLayerGroup.addLayer(layer);
            drawHistory.push({ type: currentTool, layer: layer, vertexCount: vertexCount });
            featureAdded = true;
        } else {
             console.error("Marker için hedef katman grubu bulunamadı:", currentTool);
        }
    } else if (layerType === 'polyline' && currentTool === 'path') {
        drawingLayers.path.addLayer(layer);
        drawHistory.push({ type: 'path', layer: layer, vertexCount: vertexCount });
        featureAdded = true;
    } else if (layerType === 'polygon') {
        const targetLayerGroup = drawingLayers[currentTool];
        if (targetLayerGroup && (currentTool === 'green' || currentTool === 'square')) {
            targetLayerGroup.addLayer(layer);
            drawHistory.push({ type: currentTool, layer: layer, vertexCount: vertexCount });
            featureAdded = true;
        } else {
            console.error("Polygon için hedef katman grubu bulunamadı veya tür uyumsuz:", currentTool);
        }
    } else {
        console.warn("İşlenmeyen katman türü veya araç uyumsuzluğu:", layerType, currentTool);
    }

    if (featureAdded && currentDrawingType && activeDrawHandler) {
        setTimeout(() => {
            if (activeDrawHandler && typeof activeDrawHandler.enable === 'function') {
                 try {
                    activeDrawHandler.enable();
                    console.log(currentDrawingType, "aracı aktif tutuluyor.");
                 } catch (error) {
                     console.error("Handler tekrar etkinleştirilirken hata oluştu:", error);
                     activeDrawHandler = null;
                     currentDrawingType = null;
                     const activeButton = document.querySelector('.buttongroup button.active-tool');
                     if (activeButton) {
                        activeButton.classList.remove('active-tool');
                     }
                 }
            } else {
                console.warn("Timeout sonrası aktif handler bulunamadı veya geçersiz.");
                activeDrawHandler = null;
                currentDrawingType = null;
                const activeButton = document.querySelector('.buttongroup button.active-tool');
                if (activeButton) {
                    activeButton.classList.remove('active-tool');
                 }
            }
        }, 0);
    } else if (!featureAdded) {
        console.warn("Katman eklenmediği için araç yeniden etkinleştirilmedi.");
    }
});

// --- 8. ÇİZİM ARACI ETKİNLEŞTİRME FONKSİYONU ---

const toggleDrawing = (drawType) => {
    const activationTime = new Date().toISOString(); // YENİ: Aktivasyon/Deaktivasyon zamanı

    // Eğer tıklanan araç zaten aktifse, onu devre dışı bırak
    if (currentDrawingType === drawType && activeDrawHandler) {
        activeDrawHandler.disable();
        // YENİ: Araç deaktivasyonunu logla
        userInfo.toolActivity.push({ tool: currentDrawingType, status: 'deactivated', datetime: activationTime });
        console.log("Araç devre dışı bırakıldı:", currentDrawingType, "Zaman:", activationTime);

        activeDrawHandler = null;
        currentDrawingType = null;
        document.getElementById(`draw-${drawType}`).classList.remove('active-tool');
        return;
    }

    // Başka bir araç aktifse, onu önce devre dışı bırak
    if (activeDrawHandler) {
        activeDrawHandler.disable();
        // YENİ: Eski aracın deaktivasyonunu logla
        if (currentDrawingType) {
            userInfo.toolActivity.push({ tool: currentDrawingType, status: 'deactivated', datetime: activationTime });
            console.log("Araç (otomatik) devre dışı bırakıldı:", currentDrawingType, "Zaman:", activationTime);
            document.getElementById(`draw-${currentDrawingType}`).classList.remove('active-tool');
        }
        activeDrawHandler = null;
        currentDrawingType = null;
    }

    // Yeni aracı etkinleştir
    currentDrawingType = drawType;
    const drawControl = drawControls[drawType];
    let handler = null;

    if (drawControl._toolbars.draw._modes.marker) {
        handler = drawControl._toolbars.draw._modes.marker.handler;
    } else if (drawControl._toolbars.draw._modes.polyline) {
        handler = drawControl._toolbars.draw._modes.polyline.handler;
    } else if (drawControl._toolbars.draw._modes.polygon) {
        handler = drawControl._toolbars.draw._modes.polygon.handler;
    }

    if (handler) {
        handler.enable();
        activeDrawHandler = handler;
        // YENİ: Yeni aracın aktivasyonunu logla
        userInfo.toolActivity.push({ tool: currentDrawingType, status: 'activated', datetime: activationTime });
        console.log("Araç seçildi:", currentDrawingType, "Zaman:", activationTime);

        document.getElementById(`draw-${drawType}`).classList.add('active-tool');
    } else {
        console.error("Bu çizim türü için uygun handler bulunamadı:", drawType);
        currentDrawingType = null;
    }
};

// --- 9. ÇİZİM ARAÇLARI VE EYLEMLERİ İÇİN DÜĞME OLAY DİNLEYİCİLERİ ---

document.getElementById('draw-agac').onclick = () => toggleDrawing('agac');
document.getElementById('draw-bench').onclick = () => toggleDrawing('bench');
document.getElementById('draw-statue').onclick = () => toggleDrawing('statue');
document.getElementById('draw-cafe').onclick = () => toggleDrawing('cafe');
document.getElementById('draw-wc').onclick = () => toggleDrawing('wc');
document.getElementById('draw-sport').onclick = () => toggleDrawing('sport');
document.getElementById('draw-culture').onclick = () => toggleDrawing('culture');
document.getElementById('draw-path').onclick = () => toggleDrawing('path');
document.getElementById('draw-green').onclick = () => toggleDrawing('green');
document.getElementById('draw-square').onclick = () => toggleDrawing('square');

document.getElementById('reset').onclick = clearDrawing;
document.getElementById('undo').onclick = undoLastDrawing;
document.getElementById('upload').onclick = handleFinishDrawing;
document.getElementById('continue-btn').onclick = handleSaveAndContinue;
document.getElementById('submit-nasa-tlx-btn').onclick = submitNasaTlx;

// --- 10. ÇİZİM YÖNETİM FONKSİYONLARI ---

let geoJSONPayloadForUpload = null;
let nasaTlxData = {};

function handleFinishDrawing() {
    if (window.confirm("Alanı daha güzel hale getirmek üzeresiniz. Yollayalım mı?")) {
        endTime = new Date();
        userInfo.endTime = endTime.toISOString();
        userInfo.duration = ((endTime - startTime) / 1000).toFixed(2);

        const features = collectDrawingFeatures();
        geoJSONPayloadForUpload = createGeoJSONPayload(features);

        document.getElementById('nasa-tlx-modal').style.display = 'block';
    }
}

function submitNasaTlx() {
    nasaTlxData = {
        mentalDemand: document.getElementById('mental-demand').value,
        physicalDemand: document.getElementById('physical-demand').value,
        temporalDemand: document.getElementById('temporal-demand').value,
        performance: document.getElementById('performance').value,
        effort: document.getElementById('effort').value,
        frustration: document.getElementById('frustration').value
    };

    if (geoJSONPayloadForUpload) {
        geoJSONPayloadForUpload.properties.nasaTlx = nasaTlxData;
        uploadGeoJSONData(geoJSONPayloadForUpload);
        geoJSONPayloadForUpload = null;
        nasaTlxData = {};
    }
    document.getElementById('nasa-tlx-modal').style.display = 'none';
}

function collectDrawingFeatures() {
    return Object.entries(drawingLayers).flatMap(([type, layerGroup]) =>
        layerGroup.toGeoJSON().features.map(feature => ({ ...feature, properties: { ...feature.properties, type } }))
    );
}

function createGeoJSONPayload(features) {
    const userInfoDetails = {
        userAgent: userInfo.userAgent,
        screenSize: userInfo.screenSize,
        username: userInfo.username,
        age: userInfo.age,
        group: userInfo.group,
        frequency: userInfo.frequency,
        mapFamiliarity: userInfo.mapFamiliarity,
        GISFamiliarity: userInfo.GISFamiliarity,
        onlineParticipation: userInfo.onlineParticipation,
        district: userInfo.district,
        neighborhood: userInfo.neighborhood,
        referrer: userInfo.referrer,
        touchScreen: userInfo.touchScreen
    };

    const userEvents = {
        timeWindow: {
            startTime: userInfo.startTime,
            endTime: userInfo.endTime,
            duration: userInfo.duration
        },
        toolUsages: userInfo.toolUsages,
        undoHistory: undoHistory,
        zoomLevels: userInfo.zoomLevels,
        panEvents: userInfo.panEvents,
        toolActivity: userInfo.toolActivity // YENİ: toolActivity'yi GeoJSON'a ekle
    };

    return {
        type: "FeatureCollection",
        properties: {
            userInfo: userInfoDetails,
            userEvents: userEvents,
            nasaTlx: nasaTlxData
        },
        features: features
    };
}

function generateFilename() {
    const timestamp = new Date().toLocaleString('tr-TR').replace(/[\/\s,:]/g, '-');
    return `V4_sirkeci_${timestamp}.geojson`;
}

function uploadGeoJSONData(geoJSONPayload) {
    const fileName = generateFilename();
    const fileContent = JSON.stringify(geoJSONPayload, null, 2);
    const file = new File([fileContent], fileName, { type: 'application/json' });

    const dropboxClient = new Dropbox.Dropbox({
        clientId: '3srgf2zk9ehxjuo',
        clientSecret: "sox2f4bp0rora92",
        refreshToken: "tS2SLNlfrDYAAAAAAAAAAdnWBjf2gdtW8RgC_2lGL30fBqX_gp-otnyQnVkGzY9f"
    });

    dropboxClient.filesUpload({ path: `/${fileName}`, contents: file, mode: 'overwrite' })
        .then(() => alert("İşte bu kadar, sayenizde burayı güzelleştirdik! Sayfayı kapatabilirsiniz, gerisi bizde."))
        .catch(() => {
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(file);
            downloadLink.download = fileName;
            downloadLink.click();
            if (confirm('Yükleme sırasında bir hata oluştu. Çalışmanızı indirmek ister misiniz?\n\nTamam\'ı seçerseniz, çalışmanızı bize e-posta ile gönderebilirsiniz.')) {
                location.href = 'mailto:yilmazali13@itu.edu.tr';
            }
        })
        .finally(() => {
            Object.values(drawingLayers).forEach(layerGroup => layerGroup.clearLayers());
            location.reload();
        });
}

function undoLastDrawing() {
    if (drawHistory.length > 0) {
        const lastAction = drawHistory.pop();
        const { type, layer, vertexCount } = lastAction;
        if (drawingLayers[type]) {
            drawingLayers[type].removeLayer(layer);
            const undoTimestamp = new Date().toISOString();
            undoHistory.push({
                tool: type,
                datetime: undoTimestamp,
                vertexCount: vertexCount
            });
            console.log("Undo:", undoTimestamp, "Vertex Count:", vertexCount);
        }
    } else {
        alert("Geri alınacak işlem bulunamadı.");
    }
}

function clearDrawing() {
    if (window.confirm("Matrix'teki tüm varlığınızı temizlemek istediğinize emin misiniz?")) {
        Object.values(drawingLayers).forEach(layerGroup => layerGroup.clearLayers());
    }
}

// --- 11. HARİTA YENİDEN BOYUTLANDIRMA İŞLEYİCİ ---

$(window).on("resize", function () {
    $("#map").height($(window).height() - 10).width($(window).width() - 8);
    map.invalidateSize();
}).trigger("resize");
