import * as alt from 'alt';
import * as chat from 'chat'
import * as native from 'natives'

let myID = 0
let blips = {}
let ped = null
native.setPedInfiniteAmmoClip(ped, true)

alt.onServer('playerConnect', player => {
    myID = player.id
   
    native.setPlayerInvincible(player, true);
    let ped = native.getPlayerPed(player);
    alt.log(player)

    native.setPlayerParachuteTintIndex(ped, 3);
    native.setPedInfiniteAmmoClip(ped, true);
    alt.log(ped)
})


let view = new alt.WebView("http://resource/client/html/index.html")
let speedoShown = false
let playerVehicle = false

alt.setInterval(() => {
    if (!playerVehicle) return
    if (speedoShown) {
        view.emit('drawSpeedo', playerVehicle.speed, playerVehicle.gear, playerVehicle.rpm)
    }
}, 1)




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
    // native.createObject(obj, pos.x, pos.y, pos.z, true, false, false);
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


alt.onServer('god', playerID => {
    native.setPlayerInvincible(playerID, true);
    let ped = native.getPlayerPed(playerID);
    alt.log(playerID)

    native.setPlayerParachuteTintIndex(ped, 3);
    native.setPedInfiniteAmmoClip(ped, true);
    alt.log(ped)
})

alt.onServer('godoff', playerID => {
    native.setPlayerInvincible(playerID, false);
    alt.log(playerID)
})

alt.onServer('setColete', playerID => {
    let ped = native.getPlayerPed(playerID);
    native.setPedArmour(ped, 150);
})

alt.onServer('tag', player => {
    let ped = native.getPlayerPed(player);
    let name = native.getPlayerName(player);
    let gamerTagID = native.createMpGamerTagWithCrewColor(ped, name, true, false, 'Armario', 0, 145, 35, 223);
    native.setMpGamerTagVisibility(gamerTagID, 0, true, 2);
    alt.log(gamerTagID)
})


native.requestIpl('hei_carrier')

native.requestIpl('ex_dt1_11_office_02b')
