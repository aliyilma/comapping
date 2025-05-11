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
    neighborhood: null,
    userAgent: null, // Cihazın ham User-Agent bilgisini saklar
    screenSize: null, // Başlangıçta mahalle yok
    referer: null, // Başlangıçta referans yok
    touchScreen: null, // Başlangıçta dokunmatik ekran yok
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
    const district = document.getElementById("district").value; // İlçe bilgisini al
    const neighborhood = document.getElementById("neighborhood").value; // Mahalle bilgisini al
    const mapFamiliarity = document.getElementById("map-familiarity").value; // YENİ: Harita aşinalığı bilgisini al
    const GISFamiliarity = document.getElementById("gis-familiarity").value;
    const onlineParticipation = document.getElementById("online-participation").value; // YENİ: Çevrimiçi katılım bilgisini al
    
    const userAgent = navigator.userAgent;
    const screenSize = `${window.screen.width}x${window.screen.height}`;
    const referrer = document.referrer; // Yönlendiren URL'yi al
    const touchScreen = navigator.maxTouchPoints > 0; // Dokunmatik ekran var mı?

    console.log("User Agent:", userAgent);
    console.log("Screen Size:", screenSize);
    console.log("Referrer URL:", referrer);
    console.log("Touch Screen:", touchScreen);

    // Tüm alanların doldurulduğunu doğrula (ilçe ve mahalle de dahil)
    if (username && age && group && frequency && district && neighborhood && mapFamiliarity && GISFamiliarity && onlineParticipation) {
        // Kullanıcı bilgilerini sakla
        userInfo = {
            userAgent, screenSize, username, age, group, frequency,mapFamiliarity, GISFamiliarity, onlineParticipation, district, neighborhood,
            toolUsages: [],
            zoomLevels: [],
            panEvents: [],
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
    document.getElementById('user-modal').style.display = 'block'; // Kullanıcı bilgi modalını göster
    console.log("Onay verildi, kullanıcı bilgi modalı gösteriliyor.");
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
const initialView = [41.016596, 28.975677]; // Başlangıç harita merkezi koordinatları (enlem, boylam)
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
// ...existing code...
async function loadGeoJSONLayers() {
    const urls = {
        sirkeci: 'https://raw.githubusercontent.com/aliyilma/comapping/refs/heads/main/sirkeci.geojson'
        // sirkeciGenis kaldırıldı
    };
    const styles = {
        sirkeci: { color: 'black', weight: 2, opacity: 1, fillOpacity: 0.6, fill: true }
        // sirkeciGenis stili kaldırıldı
    };

    try {
        // Promise.all'dan sirkeciGenis fetch kaldırıldı
        const [sirkeci] = await Promise.all([
            fetch(urls.sirkeci).then(resp => resp.json())
        ]);

        // sirkeciGenisLayer oluşturma kaldırıldı
        const sirkeciLayer = L.geoJson(sirkeci, { style: styles.sirkeci }).addTo(map);

        // overlayMaps'ten sirkeciGenisLayer kaldırıldı
        const overlayMaps = { "Sirkeci": sirkeciLayer }; // Katman kontrolü için bindirme katmanları
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
 * Araç kullanımını zaman damgalarıyla kaydeder, çizilen katmanı uygun FeatureGroup'a ekler
 * ve seçili aracı aktif tutar.
 */
map.on(L.Draw.Event.CREATED, function (e) {
    const layerType = e.layerType;
    const layer = e.layer;
    const creationDatetime = new Date().toISOString();
    // 'currentDrawingType' global değişkeninden alınmalı, burada tekrar tanımlanmamalı
    const currentTool = currentDrawingType;
    const actionType = 'creation';

    // Hata ayıklama: Eğer bir araç seçili değilken çizim yapılırsa logla ve çık
    if (!currentTool) {
        console.warn("Bir çizim aracı seçili değilken çizim oluşturuldu.", e);
        return;
    }

    // İşaretleyici ve diğer poligon olmayanlar için (sadece genel oluşturma zamanını kaydet)
    // Poligon ve Polyline için köşe noktası zaman damgaları loglamasını isterseniz buraya ekleyebilirsiniz.
    userInfo.toolUsages.push({ tool: currentTool, actionType: actionType, datetime: creationDatetime });
    console.log("Araç:", currentTool, "Eylem:", actionType, "Zaman:", creationDatetime); // İsteğe bağlı konsol günlüğü

    let featureAdded = false; // Katmanın eklenip eklenmediğini takip et

    // Katmanı araç türüne göre özellik grubuna ekle
    if (layerType === 'marker') {
        // currentTool'a göre doğru katman grubunu bul
        const targetLayerGroup = drawingLayers[currentTool];
        if (targetLayerGroup) {
            targetLayerGroup.addLayer(layer);
            drawHistory.push({ type: currentTool, layer: layer });
            featureAdded = true;
        } else {
             console.error("Marker için hedef katman grubu bulunamadı:", currentTool);
        }
    } else if (layerType === 'polyline' && currentTool === 'path') { // Sadece path aracı için polyline
        drawingLayers.path.addLayer(layer);
        drawHistory.push({ type: 'path', layer: layer });
        featureAdded = true;
    } else if (layerType === 'polygon') {
        // currentTool'a göre doğru katman grubunu bul (green veya square)
        const targetLayerGroup = drawingLayers[currentTool];
        if (targetLayerGroup && (currentTool === 'green' || currentTool === 'square')) {
            targetLayerGroup.addLayer(layer);
            drawHistory.push({ type: currentTool, layer: layer });
            featureAdded = true;
        } else {
            console.error("Polygon için hedef katman grubu bulunamadı veya tür uyumsuz:", currentTool);
        }
    } else {
        console.warn("İşlenmeyen katman türü veya araç uyumsuzluğu:", layerType, currentTool);
    }

    // Eğer bir katman başarıyla eklendiyse ve bir çizim aracı hala aktifse (aktif handler mevcutsa),
    // Leaflet.Draw'ın otomatik kapanmasını engellemek için aynı aracı tekrar etkinleştir.
    if (featureAdded && currentDrawingType && activeDrawHandler) {
        // setTimeout, Leaflet'in kendi iç işlemlerini tamamlamasına olanak tanıyabilir.
        setTimeout(() => {
            // Tekrar etkinleştirmeden önce hala geçerli bir handler olup olmadığını kontrol et
            if (activeDrawHandler && typeof activeDrawHandler.enable === 'function') {
                 try {
                    activeDrawHandler.enable();
                    console.log(currentDrawingType, "aracı aktif tutuluyor.");
                 } catch (error) {
                     console.error("Handler tekrar etkinleştirilirken hata oluştu:", error);
                     // Hata durumunda aracı temizle
                     activeDrawHandler = null;
                     currentDrawingType = null;
                     // İlgili butondan active-tool sınıfını kaldır
                     const activeButton = document.querySelector('.buttongroup button.active-tool');
                     if (activeButton) {
                        activeButton.classList.remove('active-tool');
                     }
                 }
            } else {
                console.warn("Timeout sonrası aktif handler bulunamadı veya geçersiz.");
                // Aracı temizle
                activeDrawHandler = null;
                currentDrawingType = null;
                const activeButton = document.querySelector('.buttongroup button.active-tool');
                if (activeButton) {
                    activeButton.classList.remove('active-tool');
                 }
            }
        }, 0); // Olay döngüsünün sonuna ertele
    } else if (!featureAdded) {
        console.warn("Katman eklenmediği için araç yeniden etkinleştirilmedi.");
    }
});

// --- 8. ÇİZİM ARACI ETKİNLEŞTİRME FONKSİYONU ---

/**
 * Belirli bir tür için çizim aracını etkinleştirir veya devre dışı bırakır.
 * @param {string} drawType - Etkinleştirilecek/Devre dışı bırakılacak çizim aracı türü (örneğin, 'agac', 'path').
 */
const toggleDrawing = (drawType) => {
    // Eğer tıklanan araç zaten aktifse, onu devre dışı bırak
    if (currentDrawingType === drawType && activeDrawHandler) {
        activeDrawHandler.disable();
        activeDrawHandler = null;
        currentDrawingType = null;
        // Aktif butondan 'active-tool' sınıfını kaldır
        document.getElementById(`draw-${drawType}`).classList.remove('active-tool');
        console.log("Araç devre dışı bırakıldı:", drawType);
        return; // Fonksiyondan çık
    }

    // Başka bir araç aktifse, onu önce devre dışı bırak
    if (activeDrawHandler) {
        activeDrawHandler.disable();
        // Eski aktif butondan 'active-tool' sınıfını kaldır
        if (currentDrawingType) {
             document.getElementById(`draw-${currentDrawingType}`).classList.remove('active-tool');
        }
        activeDrawHandler = null;
        currentDrawingType = null;
    }

    // Yeni aracı etkinleştir
    currentDrawingType = drawType;
    const drawControl = drawControls[drawType];
    let handler = null;

    // Uygun çizim modunu bul ve etkinleştir
    if (drawControl._toolbars.draw._modes.marker) {
        handler = drawControl._toolbars.draw._modes.marker.handler;
    } else if (drawControl._toolbars.draw._modes.polyline) {
        handler = drawControl._toolbars.draw._modes.polyline.handler;
    } else if (drawControl._toolbars.draw._modes.polygon) {
        handler = drawControl._toolbars.draw._modes.polygon.handler;
    }

    if (handler) {
        handler.enable();
        activeDrawHandler = handler; // Aktif handler'ı sakla
        // Yeni aktif butona 'active-tool' sınıfını ekle
        document.getElementById(`draw-${drawType}`).classList.add('active-tool');
        console.log("Araç seçildi:", drawType, "Zaman:", new Date().toISOString());
    } else {
        console.error("Bu çizim türü için uygun handler bulunamadı:", drawType);
        currentDrawingType = null; // Hata durumunda sıfırla
    }
};

// --- 9. ÇİZİM ARAÇLARI VE EYLEMLERİ İÇİN DÜĞME OLAY DİNLEYİCİLERİ ---

// Çizim araçlarını etkinleştirmek/devre dışı bırakmak için HTML düğmelerine olay dinleyicileri ekle
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

let geoJSONPayloadForUpload = null; // Geçici olarak GeoJSON'u saklamak için değişken
let nasaTlxData = {}; // NASA-TLX verilerini saklamak için

/**
 * Çizimi bitirme eylemini yönetir.
 * Kullanıcıyla onaylar, endTime'ı kaydeder ve NASA-TLX modalını görüntüler.
 */
function handleFinishDrawing() {
    if (window.confirm("Alanı daha güzel hale getirmek üzeresiniz. Yollayalım mı?")) {
        endTime = new Date();
        userInfo.endTime = endTime.toISOString();
        userInfo.duration = ((endTime - startTime) / 1000).toFixed(2);

        const features = collectDrawingFeatures();
        geoJSONPayloadForUpload = createGeoJSONPayload(features); // GeoJSON'u sakla, henüz yükleme yapma

        // Geri bildirim modalı yerine NASA-TLX modalını göster
        document.getElementById('nasa-tlx-modal').style.display = 'block';
    }
}


/**
 * NASA-TLX gönderimini yönetir, veriyi GeoJSON'a ekler ve veriyi yükler.
 */
function submitNasaTlx() { // Fonksiyon adı değiştirildi
    // NASA-TLX formundan değerleri topla
    nasaTlxData = {
        mentalDemand: document.getElementById('mental-demand').value,
        physicalDemand: document.getElementById('physical-demand').value,
        temporalDemand: document.getElementById('temporal-demand').value,
        performance: document.getElementById('performance').value,
        effort: document.getElementById('effort').value,
        frustration: document.getElementById('frustration').value
    };

    if (geoJSONPayloadForUpload) {
        // --- DEĞİŞİKLİK BAŞLANGICI ---
        // Eski userFeedback yerine nasaTlx verisini GeoJSON'a ekle
        geoJSONPayloadForUpload.properties.nasaTlx = nasaTlxData;
        // Eski userFeedback satırını kaldır:
        // geoJSONPayloadForUpload.properties.userFeedback = userFeedback;
        // --- DEĞİŞİKLİK SONU ---
        uploadGeoJSONData(geoJSONPayloadForUpload); // Yükleme fonksiyonunu güncellenmiş GeoJSON ile çağır
        geoJSONPayloadForUpload = null; // Yükleme sonrası temizle
        nasaTlxData = {}; // NASA-TLX verilerini temizle
    }

    // --- DEĞİŞİKLİK BAŞLANGICI ---
    // NASA-TLX modalını kapat
    document.getElementById('nasa-tlx-modal').style.display = 'none';
    // Eski feedback modalını kapatan satırı kaldır:
    // document.getElementById('feedback-modal').style.display = 'none';
    // --- DEĞİŞİKLİK SONU ---
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
 * Belirtilen yeni yapıya göre userInfo, userEvents (yeni) ve nasaTlx içerir.
 * @param {Array<Object>} features - GeoJSON Özelliklerinin dizisi.
 * @returns {Object} - GeoJSON FeatureCollection nesnesi.
 */
function createGeoJSONPayload(features) {

    // Ana userInfo objesini (etkinlikler hariç) oluşturalım
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
        referrer: userInfo.referrer,       // Bu alan eklenmemişti, ekledim.
        touchScreen: userInfo.touchScreen   // Bu alan eklenmemişti, ekledim.
    };

    // User Events objesini oluşturalım
    const userEvents = {
        timeWindow: {
            startTime: userInfo.startTime, // userInfo objesinden alınıyor
            endTime: userInfo.endTime,     // userInfo objesinden alınıyor
            duration: userInfo.duration    // userInfo objesinden alınıyor
        },
        toolUsages: userInfo.toolUsages,   // userInfo objesinden alınıyor
        undoHistory: undoHistory,         // Global undoHistory dizisinden alınıyor
        zoomLevels: userInfo.zoomLevels,   // userInfo objesinden alınıyor
        panEvents: userInfo.panEvents     // userInfo objesinden alınıyor
    };

    return {
        type: "FeatureCollection",
        properties: {
            userInfo: userInfoDetails, // Yeniden yapılandırılmış kullanıcı detayları
            userEvents: userEvents,     // Yeni userEvents objesi
            nasaTlx: nasaTlxData        // Global nasaTlxData objesinden alınıyor
            // İsterseniz buraya creationTimestamp ve appVersion gibi ek meta verileri de ekleyebilirsiniz.
            // creationTimestamp: new Date().toISOString(),
            // appVersion: "v0.3"
        },
        features: features
    };
}

/**
 * Kullanıcı adı ve zaman damgasına göre GeoJSON dosyası için bir dosya adı oluşturur.
 * @returns {string} - Oluşturulan dosya adı.
 */
function generateFilename() {
    const timestamp = new Date().toLocaleString('tr-TR').replace(/[\/\s,:]/g, '-');
    return `sirkeci_${timestamp}.geojson`;
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
    if (drawHistory.length > 0) {
        const lastAction = drawHistory.pop();
        const { type, layer } = lastAction;
        if (drawingLayers[type]) {
            drawingLayers[type].removeLayer(layer);
            const undoTimestamp = new Date().toISOString();
            // Undo işlemini kaydet
            undoHistory.push({ tool: type, datetime: undoTimestamp });
            console.log("Undo:", undoTimestamp);
        }
    } else {
        alert("Geri alınacak işlem bulunamadı.");
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
