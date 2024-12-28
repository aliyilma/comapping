// ekrana mesaj çak ve nick iste
/*
setTimeout(function () {
    kullaniciadi = prompt(
        "Şu anda Sirkeci Garı'ndan Eminönü'ne kadar olan hattı keyfinize göre tasarlamak üzeresiniz. Bunu katılımcı planlama ve tasarım anlayışı ile harmanlanan bir mekânsal anket çalışması olarak düşünebilirsiniz.\n\nHarita üzerinde bulunan yardımcı butonlar vasıtası ile fikirlerinizi haritaya ekleyebilir ve hayallerinizin gerçekleşmesini umabilirsiniz. Sizin gibi diğer ziyaretçiler de bu mekânsal anketi hayalleri ile dolduruyor ve sonuçları Matrix'te yer alan çok güvenli bir sunucuya PTT ile gönderiliyor.\n\nAnkete güvenle devam edebilmeniz için annenizin evlenmeden önceki soyadı?\n\Şaka. Olmak istediğiniz kişiyi giriniz.", "white rabbit"
    );
}, 1000);
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
    return shape_obj;
}
load_shapefile().then(L.geoJson).then(map.addLayer.bind(map));

var type;

// çizim katmanlarını oluşturuyoruz
var agacGroup = new L.FeatureGroup();
var bankGroup = new L.FeatureGroup();
var heykelGroup = new L.FeatureGroup();
var yolGroup = new L.FeatureGroup();
var cafeGroup = new L.FeatureGroup();
var wcGroup = new L.FeatureGroup();
var sportGroup = new L.FeatureGroup();
var kulturGroup = new L.FeatureGroup();
var yesilGroup = new L.FeatureGroup();
var meydanGroup = new L.FeatureGroup();
map.addLayer(agacGroup);
map.addLayer(bankGroup);
map.addLayer(heykelGroup);
map.addLayer(yolGroup);
map.addLayer(cafeGroup);
map.addLayer(wcGroup);
map.addLayer(sportGroup);
map.addLayer(kulturGroup);
map.addLayer(yesilGroup);
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

// sıfırla
document.getElementById('reset').onclick = function (e) { clearDraw(); }
// geri al
document.getElementById("undo").addEventListener("click", undoDraw);
// bitir
document.getElementById("upload").addEventListener("click", finishDraw);

//----------- FONKSİYONLAR -----------------------------------------------------------------

// Emin misin sorusu
function finishDraw() {
    if (window.confirm("Gerçekten mi?")) {
        uploadGeojson();
    }
}

function uploadGeojson() {
    const groups = {
        'agac': agacGroup, 'bank': bankGroup, 'heykel': heykelGroup,
        'yol': yolGroup, 'yesil': yesilGroup, 'wc': wcGroup,
        'sport': sportGroup, 'kultur': kulturGroup, 'cafe': cafeGroup,
        'meydan': meydanGroup
    };

    // Tüm grupların GeoJSON özelliklerini birleştir
    const allFeatures = Object.entries(groups).flatMap(([type, group]) => 
        group.toGeoJSON().features.map(feature => ({
            ...feature,
            properties: { ...feature.properties, type } // Her bir özelliğe tür ekliyoruz
        }))
    );

    // GeoJSON yapısını oluştur
    const geoJSON = {
        type: "FeatureCollection",
        properties: { // Kullanıcı bilgilerini meta veri olarak ekliyoruz
            username: userInfo.username,
            age: userInfo.age,
            group: userInfo.group,
            frequency: userInfo.frequency
        },
        features: allFeatures
    };

    // GeoJSON'u bir dosya olarak kaydet
    const file = new File([JSON.stringify(geoJSON)], `${getFileName()}.geojson`);
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
        .finally(() => Object.values(groups).forEach(group => group.clearLayers()));
}

function getFileName() {
    const date = new Date().toLocaleString('tr-TR').replace(/[\/\s,:]/g, '-');
    return `map_${userInfo.username}_${date}`;
}

function undoDraw() {
    const groups = {
        'bank': bankGroup,
        'agac': agacGroup,
        'heykel': heykelGroup,
        'yol': yolGroup,
        'wc': wcGroup,
        'sport': sportGroup,
        'kultur': kulturGroup,
        'yesil': yesilGroup,
        'meydan': meydanGroup,
        'cafe': cafeGroup
    };

    if (type in groups) {
        const group = groups[type];
        group.removeLayer(group.getLayers()[group.getLayers().length - 1]);
    }
}

function clearDraw() {
    if (window.confirm("Yanlışlıkla basma diye buradayım. Emin misin?")) {
        const allGroups = [
            bankGroup, agacGroup, heykelGroup, yolGroup, 
            yesilGroup, wcGroup, sportGroup, kulturGroup, 
            cafeGroup, meydanGroup
        ];
        
        allGroups.forEach(group => group.clearLayers());
    }
}

// haritayı resize edici
$(window).on("resize", function () {
    $("#map").height($(window).height() - 100).width($(window).width() - 15);
    map.invalidateSize();
}).trigger("resize");

// ---- modal ----

let userInfo = {};

function saveAndContinue() {
    const username = document.getElementById("username").value;
    const age = document.getElementById("age").value;
    const group = document.getElementById("group").value;
    const frequency = document.getElementById("frequency").value;

    if (username && age && group && frequency) {
        userInfo = { username, age, group, frequency };
        document.getElementById("user-modal").style.display = "none"; // Modalı gizle
        alert("Kullanıcı bilgileri kaydedildi. Haritaya devam edebilirsiniz!");
    } else {
        alert("Lütfen tüm alanları doldurun.");
    }
}

// Harita yüklenirken modalın gösterilmesini sağlıyoruz
window.onload = function () {
    document.getElementById("user-modal").style.display = "block";
};
