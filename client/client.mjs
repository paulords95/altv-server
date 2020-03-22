import * as alt from 'alt';
import * as native from 'natives'
import * as chat from 'chat'

let view = new alt.WebView("http://resource/client/html/index.html")
let speedoShown = false
let playerVehicle = false

alt.setInterval(() => {
    if (!playerVehicle) return
    if (speedoShown) {
        view.emit('drawSpeedo', playerVehicle.speed, playerVehicle.gear, playerVehicle.rpm)
    }
}, 1)


let blips = {}
let myID = 0

alt.onServer('myID', playerID => {
    myID = playerID
})

alt.onServer('createPlayerBlip', (playerID, playerName, pos) => {
    if (myID == playerID) {
        return
    }

    if (blips[playerID] !== undefined) {
        return
    }

    blips[playerID] = new alt.PointBlip(pos.x, pos.y, pos.z)
    blips[playerID].sprite = 286
    blips[playerID].color = 47
    blips[playerID].name = playerName

})

alt.onServer('deletePlayerBlip', playerID => {
    if (blips[playerID] !== undefined) {
        blips[playerID].destroy()
        delete blips[playerID]
    }
})

alt.onServer('updatePlayerBlip', (playerID, pos) => {
    if (blips[playerID] !== undefined) {
        blips[playerID].pos = pos
    }
})

view.on('speedoLoaded', () => {
    speedoShown = true
})

view.on('speedoUnloaded', () => {
    speedoShown = false
})

alt.onServer("playerEnterVehicle", (vehicle, seat) => {
    playerVehicle = vehicle;
    if (seat == 1) { //driver
        if (!speedoShown) {
            view.emit('showSpeedo', true)
        }
    }
})

alt.onServer("playerLeftVehicle", (seat) => {
    playerVehicle = false;
    if (seat == 1) { //driver
        if (speedoShown) {
            view.emit('showSpeedo', false)
        }
    }
})

alt.onServer("playerChangedVehicleSeat", (vehicle, seat) => {
    playerVehicle = vehicle;
    if (seat == 1) { //driver
        if (!speedoShown) {
            view.emit('showSpeedo', true)
        }
    }
})

alt.onServer("enterCarro", (vehicle, name) => {
    let loaded = false
    let hash = native.getHashKey(name)
    let interval = null
    const localPlayer = alt.Player.local.scriptID;
    interval = alt.setInterval(() => {
        if (native.hasModelLoaded(hash)) {
            alt.clearInterval(interval)

            alt.nextTick(() => {
                native.setPedIntoVehicle(localPlayer, vehicle.scriptID, -1)
            });
        }
    }, 50)
})

let menuOpen = false
let menu = null

alt.on('keydown', (key) => {


    if (key == 114) {
        let player = native.playerId()
        let playerPos = native.getOffsetFromEntityInWorldCoords(player, 0, 5, 2)
        alt.log(playerPos.x)
    }

    if (key == 115) {
        let player = native.playerId()
        let hash = native.getHashKey('a_m_y_acult_01')

        native.requestModel(hash)
        if (native.hasModelLoaded(hash)) {
            native.setPlayerModel(player, hash)
        }
    }


    if (key === 112) {
        if (!menuOpen) {
            alt.showCursor(true)
            // http://resource/client/html/menu.html
            menu = new alt.WebView("https://google.com.br", true)
            menu.on('rmv', () => {
                alt.emitServer('rmv')
            })
        } else {
            alt.showCursor(false)
            menu.destroy()
        }

        menuOpen = !menuOpen
    }
});

alt.onServer('posResponse', pos => {
    let hash = native.getHashKey('infernus')
    native.requestModel(hash)
    if (native.hasModelLoaded(hash)) {
        native.createVehicle(hash, pos.x, pos.y, pos.z, 0, true, false, false)
    }
})



alt.onServer('player:position', position => {
    alt.log(`Position=${position.x}, ${position.y}, ${position.z}`)
    alt.log(`/tp ${position.x} ${position.y}`)
});



alt.onServer('fix', vehicle => {
    if (vehicle !== null) {
        native.setVehicleFixed(vehicle.scriptID)
    }
})


alt.onServer('obj', pos =>{
    let obj = native.getHashKey('apa_prop_flag_brazil');
    native.createObject(obj, pos.x, pos.y, pos.z, true, false, false);
})


alt.onServer('hora', hour => {
    if (hour >= 24) {
        hour = 23
    }

    if (hour <= 0) {
        hour = 0
    }

    native.setClockTime(hour, 1, 1)
})


native.requestIpl('hei_carrier')

native.requestIpl('ex_dt1_11_office_02b')