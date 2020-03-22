import * as alt from 'alt';
import * as native from 'natives'
import * as chat from 'chat'

let view = new alt.WebView("http://resource/client/html/index.html");
let speedoShown = false;
let playerVehicle = false;

alt.setInterval(() => {
    if (!playerVehicle) return;
    if (speedoShown) {
        view.emit('drawSpeedo', playerVehicle.speed, playerVehicle.gear, playerVehicle.rpm)
    }
}, 1);


native.unlockMinimapPosition()


view.on('speedoLoaded', () => {
    speedoShown = true;
});

view.on('speedoUnloaded', () => {
    speedoShown = false;
})

alt.onServer("playerEnterVehicle", (vehicle, seat) => {
    playerVehicle = vehicle;
    if (seat == 1) { //driver
        if (!speedoShown) {
            view.emit('showSpeedo', true);
        }
    }
})

alt.onServer("playerLeftVehicle", (seat) => {
    playerVehicle = false;
    if (seat == 1) { //driver
        if (speedoShown) {
            view.emit('showSpeedo', false);
        }
    }
})

alt.onServer("playerChangedVehicleSeat", (vehicle, seat) => {
    playerVehicle = vehicle;
    if (seat == 1) { //driver
        if (!speedoShown) {
            view.emit('showSpeedo', true);
        }
    }
})

alt.onServer("enterCarro", (vehicle, name) => {
    let loaded = false
    let hash = native.getHashKey(name);
    let interval = null
    const localPlayer = alt.Player.local.scriptID;
  interval = alt.setInterval(() => {
        if(native.hasModelLoaded(hash)) {
            alt.clearInterval(interval)

            alt.nextTick(() => {
                native.setPedIntoVehicle(localPlayer, vehicle.scriptID, -1);
                let c1 = Math.floor(Math.random() * 158);
                let c2 = Math.floor(Math.random() * 158);
                native.setVehicleColours(vehicle.scriptID, c1, c2);
            });
        }
   }, 50)
   
})







let menuOpen = false;
let menu = null;

alt.on('keydown', (key) => {


    if (key == 114) {
        let player = native.playerId()
        let playerPos = native.getOffsetFromEntityInWorldCoords(player, 0, 5, 2);
        alt.log(playerPos.x)
    }

    if (key == 115) {
        let player = native.playerId()
        let hash = native.getHashKey('a_m_y_acult_01')
     
        native.requestModel(hash);
        if (native.hasModelLoaded(hash)) {
            native.setPlayerModel(player, hash);
        }
    }

    if (key === 112) {
        if (!menuOpen) {
            alt.showCursor(true)
            // http://resource/client/html/menu.html
            menu = new alt.WebView("https://google.com.br", true);
            menu.on('rmv', () => {
                alt.emitServer('rmv')
            })
        } else {
            alt.showCursor(false)
            menu.destroy();
        }

        menuOpen = !menuOpen
    }
});

alt.onServer('posResponse', pos => {
    let hash = native.getHashKey('infernus');
    native.requestModel(hash);
    if(native.hasModelLoaded(hash)){
        native.createVehicle(hash, pos.x, pos.y, pos.z, 0, true, false, false);
    }
})



alt.onServer('player:position', position => {
    alt.log(`Position=${position.x}, ${position.y}, ${position.z}`);
    alt.log(`/tp ${position.x} ${position.y}`);
});



const weather = {
    ExtraSunny: 0,
    Clear: 1,
    Clouds: 2,
    Overcast: 5,
    Rain: 6,
    Thunder: 7,
    LightRain: 8,
};

alt.setWeatherSyncActive(true);
