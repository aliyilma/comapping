// --- User Interaction Data Tracking and Map Drawing ---
// Bu script, kullanıcı girdilerini, harita etkileşimlerini, çizim işlevlerini ve bir web haritalama uygulaması için veri dışa aktarımını yönetir.
// Harita gösterimi için Leaflet ve çizim özellikleri için Leaflet.draw kullanır.

// --- 1. GLOBAL DEĞİŞKENLER ---

/**
 * @type {Object} userInfo - Kullanıcıya özgü verileri ve etkileşim günlüklerini depolar.
 * @property {Array<Object>} zoomLevels - Zaman damgalarıyla birlikte yakınlaştırma düzeyi değişikliklerinin günlüğü.
 * @property {Array<Object>} toolUsages - Çizim aracı kullanımının, eylemlerin ve zaman damgalarının günlüğü.
 * @property {Array<Object>} panEvents - Mesafe ve zaman damgalarıyla birlikte harita kaydırma olaylarının günlüğü.
 * @property {string} startTime - Haritalama oturumunun başladığı zamanın zaman damgası.
 * @property {string} endTime - Haritalama oturumunun sona erdiği zamanın zaman damgası.
 * @property {string} username - Kullanıcının girdiği rumuz.
 * @property {string} age - Kullanıcının girdiği yaş.
 * @property {string} group - Kullanıcının seçtiği kullanıcı grubu.
 * @property {string} frequency - Kullanıcının seçtiği kullanım sıklığı.
 * @property {string} tech - Kullanıcının seçtiği teknoloji aşinalık düzeyi.
 * @property {string} district - Kullanıcının seçtiği ilçe. // YENİ: İlçe bilgisi
 * @property {string} neighborhood - Kullanıcının seçtiği mahalle. // YENİ: Mahalle bilgisi
 */
let userInfo = {
    zoomLevels: [],
    toolUsages: [], // Poligon araçları için köşe zaman damgalarını içerecek şekilde güncellendi
    panEvents: [],
    district: null, // Başlangıçta ilçe yok
    neighborhood: null, // Başlangıçta mahalle yok
    userAgent: null,
    screenSize: null
};

let startTime, endTime; // Oturum başlangıç ve bitiş zamanları
let mahallelerData; // mahalleler.json dosyasından gelen veriyi saklar

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
    const tech = document.getElementById("tech").value;
    const district = document.getElementById("district").value; // İlçe bilgisini al
    const neighborhood = document.getElementById("neighborhood").value; // Mahalle bilgisini al

    const userAgent = navigator.userAgent;
    const screenSize = `${window.screen.width}x${window.screen.height}`;    

    // Tüm alanların doldurulduğunu doğrula (ilçe ve mahalle de dahil)
    if (username && age && group && frequency && tech && district && neighborhood) {
        // Kullanıcı bilgilerini sakla
        userInfo = {
            username, age, group, frequency, tech, district, neighborhood, // İlçe ve mahalle bilgilerini ekledik
            zoomLevels: [],
            toolUsages: [],
            panEvents: [],
            userAgent: userAgent,
            screenSize: screenSize
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
    document.getElementById("user-modal").style.display = "block";
};


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
const initialView = [41.016596, 28.975677]; // Başlangıç harita merkezi koordinatları (enlem, boylam)
const initialZoom = 17.5; // Başlangıç harita yakınlaştırma düzeyi

const map = L.map(mapContainerId).setView(initialView, initialZoom); // Leaflet harita örneği oluştur

const tileLayerURL = 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'; // Google Uydu karo katmanı için URL
const tileLayerOptions = {
    maxZoom: 20,
    minZoom: 17,
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
    console.log("Yakınlaştırma:", currentZoom, "Tarih:", zoomDatetime); // İsteğe bağlı konsol günlüğü
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
        console.log("Harita kaydırma:", distance.toFixed(2), "Tarih:", panDatetime); // İsteğe bağlı konsol günlüğü
    }
    lastCenter = currentCenter; // Sonraki hareket olayı için lastCenter'ı güncelle
});

// --- 5. GEOJSON KATMAN YÜKLEME ---

/**
 * GeoJSON katmanlarını eşzamansız olarak yükler ve haritaya ekler.
 * GeoJSON verilerini URL'lerden getirir ve stiller uygular.
 */
async function loadGeoJSONLayers() {
    const urls = {
        sirkeci: 'https://raw.githubusercontent.com/aliyilma/comapping/refs/heads/main/sirkeci.geojson',
        sirkeciGenis: 'https://raw.githubusercontent.com/aliyilma/comapping/refs/heads/main/sirkeci_genis.geojson'
    };
    const styles = {
        sirkeci: { color: 'red', weight: 1.5, opacity: 1, fillOpacity: 0.2, fill: true },
        sirkeciGenis: { color: 'yellow', weight: 1.5, opacity: 0.8, fillOpacity: 0.2, fill: true, dashArray: '2, 4' }
    };

    try {
        const [sirkeciGenis, sirkeci] = await Promise.all([
            fetch(urls.sirkeciGenis).then(resp => resp.json()),
            fetch(urls.sirkeci).then(resp => resp.json())
        ]);

        const sirkeciGenisLayer = L.geoJson(sirkeciGenis, { style: styles.sirkeciGenis }).addTo(map);
        const sirkeciLayer = L.geoJson(sirkeci, { style: styles.sirkeci }).addTo(map);

        const overlayMaps = { "Sirkeci": sirkeciLayer, "Sirkeci Geniş Alan": sirkeciGenisLayer }; // Katman kontrolü için bindirme katmanları
        L.control.layers(null, overlayMaps, { position: 'topright', collapsed: false }).addTo(map); // Katman kontrolü ekle
    } catch (error) {
        console.error("GeoJSON yüklenirken hata:", error);
    }
}

loadGeoJSONLayers(); // GeoJSON katman yükleme fonksiyonunu çağır

// --- 6. ÖZELLİK ÇİZİMİ ---

// Çizilen öğeler için özellik grupları, türe göre düzenlenmiş
const drawingLayers = {
    agac: new L.FeatureGroup(), bench: new L.FeatureGroup(), statue: new L.FeatureGroup(),
    cafe: new L.FeatureGroup(), wc: new L.FeatureGroup(), sport: new L.FeatureGroup(),
    culture: new L.FeatureGroup(), path: new L.FeatureGroup(), green: new L.FeatureGroup(),
    square: new L.FeatureGroup(), treeRow: new L.FeatureGroup()
};

Object.values(drawingLayers).forEach(layerGroup => map.addLayer(layerGroup)); // Tüm çizim katmanlarını haritaya ekle

let currentDrawingType = null; // Şu anda etkin olan çizim aracı türü

// Çizim araçları için işaretleyici simgeleri oluşturmak için yardımcı fonksiyon
const createMarkerIcon = (iconUrl) => L.icon({ iconUrl: iconUrl, iconSize: [18, 18], iconAnchor: [9, 9] });

// Her çizim türü için tutarlı seçeneklerle çizim kontrolleri oluşturma fonksiyonu
function createDrawControl(layerGroup, drawOptions) {
    return new L.Control.Draw({ edit: { featureGroup: layerGroup }, draw: drawOptions });
}

// Her özellik türü için çizim kontrollerini tanımla
const drawControls = {
    agac: createDrawControl(drawingLayers.agac, { marker: { icon: createMarkerIcon('https://img.icons8.com/stickers/48/deciduous-tree.png') }, polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false }),
    bench: createDrawControl(drawingLayers.bench, { marker: { icon: createMarkerIcon('https://img.icons8.com/stickers/48/city-bench.png') }, polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false }),
    statue: createDrawControl(drawingLayers.statue, { marker: { icon: createMarkerIcon('https://img.icons8.com/stickers/48/statue.png') }, polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false }),
    cafe: createDrawControl(drawingLayers.cafe, { marker: { icon: createMarkerIcon('https://img.icons8.com/stickers/48/espresso-cup.png') }, polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false }),
    wc: createDrawControl(drawingLayers.wc, { marker: { icon: createMarkerIcon('https://img.icons8.com/stickers/48/toilet-bowl.png') }, polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false }),
    sport: createDrawControl(drawingLayers.sport, { marker: { icon: createMarkerIcon('https://img.icons8.com/stickers/48/basketball.png') }, polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false }),
    culture: createDrawControl(drawingLayers.culture, { marker: { icon: createMarkerIcon('https://img.icons8.com/stickers/48/theatre-mask.png') }, polygon: false, polyline: false, circle: false, circlemarker: false, rectangle: false }),
    path: createDrawControl(drawingLayers.path, { polyline: { shapeOptions: { color: 'orange', weight: 2, opacity: 1, lineCap: "square" } }, polygon: false, marker: false, circle: false, circlemarker: false, rectangle: false }),
    green: createDrawControl(drawingLayers.green, { polygon: { shapeOptions: { color: 'green', weight: 2, opacity: 1, fillOpacity: 0.5, fill: true } }, polyline: false, marker: false, circle: false, circlemarker: false, rectangle: false }),
    square: createDrawControl(drawingLayers.square, { polygon: { shapeOptions: { color: 'yellow', weight: 2, opacity: 1, fillOpacity: 0.5, fill: true } }, polyline: false, marker: false, circle: false, circlemarker: false, rectangle: false })
};

Object.values(drawControls).forEach(control => map.addControl(control)); // Çizim kontrollerini haritaya ekle

// --- 7. ÇİZİM OLAY İŞLEYİCİ ---

/**
 * Harita üzerinde bir çizim oluşturulduğunda olay dinleyicisi.
 * Araç kullanımını zaman damgalarıyla kaydeder ve çizilen katmanı uygun FeatureGroup'a ekler.
 */
map.on(L.Draw.Event.CREATED, function (e) {
    const layerType = e.layerType;
    const layer = e.layer;
    const creationDatetime = new Date().toISOString();
    const currentTool = currentDrawingType;
    const actionType = 'creation';
    let vertexDatetimes = []; // Poligon köşelerinin zaman damgalarını saklamak için dizi

    if (layerType === 'polygon') {
        const latlngs = layer.getLatLngs()[0];
        latlngs.forEach(() => { vertexDatetimes.push(new Date().toISOString()); }); // Her köşe için zaman damgası yakala
        userInfo.toolUsages.push({ tool: currentTool, actionType: actionType, vertexDatetimes: vertexDatetimes });
        console.log("Araç:", currentTool, "Eylem:", actionType, "Zaman:", vertexDatetimes); // İsteğe bağlı konsol günlüğü
    } else if (layerType === 'polyline') { // Polyline için ayrı işlem
        const latlngs = layer.getLatLngs(); // Polyline'ın LatLng dizisini al
        let vertexDatetimes = []; // Nokta işaretleme zamanlarını saklamak için dizi
        latlngs.forEach(() => { vertexDatetimes.push(new Date().toISOString()); }); // Her nokta için zaman damgası al
        userInfo.toolUsages.push({ tool: currentTool, actionType: actionType, vertexDatetimes: vertexDatetimes });
        console.log("Araç:", currentTool, "Eylem:", actionType, "Zaman:", vertexDatetimes); // İsteğe bağlı konsol günlüğü

    } else { // İşaretleyici ve diğer poligon olmayanlar için (sadece genel oluşturma zamanını kaydet)
        userInfo.toolUsages.push({ tool: currentTool, actionType: actionType, datetime: creationDatetime });
        console.log("Araç:", currentTool, "Eylem:", actionType, "Zaman:", creationDatetime); // İsteğe bağlı konsol günlüğü
    }


    // Katmanı araç türüne göre özellik grubuna ekle
    if (layerType === 'marker') {
        const iconUrl = layer.options.icon.options.iconUrl;
        const layerGroup =
            iconUrl.includes("tree") ? drawingLayers.agac :
                iconUrl.includes("bench") ? drawingLayers.bench :
                    iconUrl.includes("statue") ? drawingLayers.statue :
                        iconUrl.includes("espresso") ? drawingLayers.cafe :
                            iconUrl.includes("toilet") ? drawingLayers.wc :
                                iconUrl.includes("basketball") ? drawingLayers.sport :
                                    iconUrl.includes("theatre") ? drawingLayers.culture : null;
        if (layerGroup) layerGroup.addLayer(layer);
    } else if (layerType === 'polyline') drawingLayers.path.addLayer(layer);
    else if (layerType === 'polygon') {
        const color = layer.options.color;
        const layerGroup = color.includes("yellow") ? drawingLayers.square : color.includes("green") ? drawingLayers.green : null;
        if (layerGroup) layerGroup.addLayer(layer);
    }
});

// --- 8. ÇİZİM ARACI ETKİNLEŞTİRME FONKSİYONU ---

/**
 * Belirli bir tür için çizim aracını etkinleştirir.
 * currentDrawingType'ı ayarlar ve uygun Leaflet.draw işleyicisini etkinleştirir.
 * @param {string} drawType - Etkinleştirilecek çizim aracı türü (örneğin, 'agac', 'path').
 */
const enableDrawing = (drawType) => {
    currentDrawingType = drawType;
    drawControls[drawType]._toolbars.draw._modes.marker?.handler.enable(); // İşaretleyici işleyicisini etkinleştir eğer varsa
    drawControls[drawType]._toolbars.draw._modes.polyline?.handler.enable(); // Çizgi işleyicisini etkinleştir eğer varsa
    drawControls[drawType]._toolbars.draw._modes.polygon?.handler.enable(); // Poligon işleyicisini etkinleştir eğer varsa
    console.log("Araç seçildi:", drawType, "Zaman:", new Date().toISOString()); // İsteğe bağlı konsol günlüğü
};

// --- 9. ÇİZİM ARAÇLARI VE EYLEMLERİ İÇİN DÜĞME OLAY DİNLEYİCİLERİ ---

// Çizim araçlarını etkinleştirmek için HTML düğmelerine olay dinleyicileri ekle
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

// --- 10. ÇİZİM YÖNETİM FONKSİYONLARI ---

let geoJSONPayloadForUpload = null; // Geçici olarak GeoJSON'u saklamak için değişken

/**
 * Çizimi bitirme eylemini yönetir.
 * Kullanıcıyla onaylar, endTime'ı kaydeder ve geri bildirim modalini görüntüler.
 */
function handleFinishDrawing() {
    if (window.confirm("Matrix'i daha güzel hale getirmek istediğinize emin misiniz?")) {
        endTime = new Date();
        userInfo.endTime = endTime.toISOString();
        userInfo.duration = ((endTime - startTime) / 1000).toFixed(2);

        const features = collectDrawingFeatures();
        geoJSONPayloadForUpload = createGeoJSONPayload(features); // GeoJSON'u sakla, henüz yükleme yapma

        populateFeedbackModal(); // Geri bildirim modalını doldur
        document.getElementById('feedback-modal').style.display = 'block'; // Geri bildirim modalını göster
    }
}

/**
 * Kullanılan her çizim aracı için geri bildirim modalini metin alanlarıyla doldurur.
 */
function populateFeedbackModal() {
    const feedbackFieldsDiv = document.getElementById('feedback-fields');
    feedbackFieldsDiv.innerHTML = ''; // Önceki içeriği temizle

    const toolLabels = { // Araç isimleri için kullanıcı dostu etiketler
        agac: "🌳 Ağaç",
        bench: "🪑 Bank",
        statue: "🗽 Anıt",
        cafe: "☕️ Cafe",
        wc: "🚽 WC",
        sport: "🏀 Spor",
        culture: "🎭 Kültür/Sergi",
        path: "🚶🏻‍♂️ Yaya Yolu",
        green: "✳️ Yeşil Alan",
        square: "🟨 Meydan"
    };

    // Kullanılan çizim araçlarını tespit et (en az bir çizim yapılmış olanları)
    const usedTools = Object.keys(drawingLayers).filter(toolType => drawingLayers[toolType].getLayers().length > 0);

    usedTools.forEach(toolType => {
        const label = toolLabels[toolType] || toolType; // Etiket yoksa toolType'ı kullan
        const feedbackFieldDiv = document.createElement('div');

        const feedbackLabel = document.createElement('label');
        feedbackLabel.setAttribute('for', `feedback-${toolType}`);
        feedbackLabel.innerHTML = `<strong>${label}</strong> aracını neden ve nasıl kullandınız?`;
        feedbackFieldDiv.appendChild(feedbackLabel);

        const feedbackTextarea = document.createElement('textarea');
        feedbackTextarea.id = `feedback-${toolType}`;
        feedbackTextarea.name = `feedback-${toolType}`;
        feedbackTextarea.placeholder = `Tasarım aracını kullanım amacınızı ve yönteminizi açıklayabilirsiniz.`;
        feedbackFieldDiv.appendChild(feedbackTextarea);

        feedbackFieldsDiv.appendChild(feedbackFieldDiv); // Ana div'e ekle
    });
}

/**
 * Geri bildirim gönderimini yönetir, GeoJSON'a ekler ve veriyi yükler.
 */
function submitFeedback() {
    const userFeedback = {};
    const feedbackFields = document.querySelectorAll('#feedback-form textarea');
    feedbackFields.forEach(textarea => {
        const toolType = textarea.id.replace('feedback-', '');
        userFeedback[toolType] = textarea.value;
    });

    if (geoJSONPayloadForUpload) {
        geoJSONPayloadForUpload.properties.userFeedback = userFeedback; // Geri bildirimi GeoJSON'a ekle
        uploadGeoJSONData(geoJSONPayloadForUpload); // Yükleme fonksiyonunu geri bildirimli GeoJSON ile çağır
        geoJSONPayloadForUpload = null; // Yükleme sonrası temizle
    }

    document.getElementById('feedback-modal').style.display = 'none'; // Geri bildirim modalını kapat
}


/**
 * drawingLayers'dan çizilen tüm özellikleri toplar ve bunları GeoJSON Özellik dizisine dönüştürür.
 * @returns {Array<Object>} - GeoJSON Özelliklerinin dizisi.
 */
function collectDrawingFeatures() {
    return Object.entries(drawingLayers).flatMap(([type, layerGroup]) =>
        layerGroup.toGeoJSON().features.map(feature => ({ ...feature, properties: { ...feature.properties, type } }))
    );
}

/**
 * Yüklenecek veya indirilecek GeoJSON yükünü oluşturur.
 * userInfo, userFeedback ve çizilen özellikleri içerir.
 * @param {Array<Object>} features - GeoJSON Özelliklerinin dizisi.
 * @returns {Object} - GeoJSON FeatureCollection nesnesi.
 */
function createGeoJSONPayload(features) {
    return {
        type: "FeatureCollection",
        properties: {
            userInfo: {
                ...userInfo, // Diğer kullanıcı bilgilerini koru
                district: userInfo.district, // İlçe bilgisini ekle
                neighborhood: userInfo.neighborhood, // Mahalle bilgisini ekle
                userAgent: userinfo.userAgent,
                screenSize: userinfo.screenSize
            },
            userFeedback: {}
        }, // userFeedback başlangıçta boş obje olarak tanımlanır, submitFeedback ile doldurulur
        features: features
    };
}

/**
 * Kullanıcı adı ve zaman damgasına göre GeoJSON dosyası için bir dosya adı oluşturur.
 * @returns {string} - Oluşturulan dosya adı.
 */
function generateFilename() {
    const timestamp = new Date().toLocaleString('tr-TR').replace(/[\/\s,:]/g, '-');
    return `comapping_${userInfo.username}_${timestamp}.geojson`;
}

/**
 * GeoJSON verilerini Dropbox'a yükler veya yükleme başarısız olursa bir indirme bağlantısı sağlar.
 * @param {Object} geoJSONPayload - Kullanıcı verileri ve geri bildirimi içeren GeoJSON FeatureCollection nesnesi.
 */
function uploadGeoJSONData(geoJSONPayload) {
    const fileName = generateFilename();
    // Okunabilirlik için girintileme ile "Güzel" GeoJSON çıktısı
    const fileContent = JSON.stringify(geoJSONPayload, null, 2);
    const file = new File([fileContent], fileName, { type: 'application/json' });

    const dropboxClient = new Dropbox.Dropbox({
        clientId: '3srgf2zk9ehxjuo',
        clientSecret: "sox2f4bp0rora92",
        refreshToken: "tS2SLNlfrDYAAAAAAAAAAdnWBjf2gdtW8RgC_2lGL30fBqX_gp-otnyQnVkGzY9f"
    });

    dropboxClient.filesUpload({ path: `/${fileName}`, contents: file, mode: 'overwrite' })
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

/**
 * Geçerli çizim türünün son çizilen özelliğini geri alır.
 */
function undoLastDrawing() {
    if (currentDrawingType && drawingLayers[currentDrawingType].getLayers().length > 0) {
        const layers = drawingLayers[currentDrawingType].getLayers();
        drawingLayers[currentDrawingType].removeLayer(layers[layers.length - 1]);
    }
}

/**
 * Kullanıcı onayından sonra tüm çizim katmanlarından çizilen tüm özellikleri temizler.
 */
function clearDrawing() {
    if (window.confirm("Matrix'teki tüm varlığınızı temizlemek istediğinize emin misiniz?")) {
        Object.values(drawingLayers).forEach(layerGroup => layerGroup.clearLayers());
    }
}

// --- 11. HARİTA YENİDEN BOYUTLANDIRMA İŞLEYİCİ ---

// Duyarlılık için pencere yeniden boyutlandırıldığında harita konteyner boyutunu ayarla
$(window).on("resize", function () {
    $("#map").height($(window).height() - 20).width($(window).width() - 15);
    map.invalidateSize(); // Leaflet harita boyutunu güncelle
}).trigger("resize"); // Sayfa yüklendiğinde yeniden boyutlandırma olayını tetikle
