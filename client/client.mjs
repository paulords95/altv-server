import * as alt from 'alt';
import * as chat from 'chat'
import * as native from 'natives'
import { ENTITY_STREAM_IN_EVENT, ENTITY_STREAM_OUT_EVENT } from './shared.mjs'

let myID = 0
let blips = {}
let ped = null
// native.setPedInfiniteAmmoClip(ped, true)

alt.onServer('playerConnect', player => {
    myID = player.id

    alt.nextTick(() => {
        ped = native.getPlayerPed(player);
        native.setPedInfiniteAmmoClip(ped, true);
    })
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
                native.setVehicleRocketBoostRefillTime(vehicle.scriptID, 0.01);
                native.setVehicleBoostActive(vehicle.scriptID, true);

            });
        }
    }, 50)
})

let menuOpen = false
let menu = null

alt.on('keydown', (key, vehicle) => {


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

    if (key == 104) {
       alt.emitServer('forkLiftEnable')
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
    let value = 0.0
    if (vehicle !== null) {
        native.setVehicleFixed(vehicle.scriptID)

        let interval = alt.setInterval(() => {
            value += 0.005

            if (value >= 1.0) {
                alt.clearInterval(value)
            }
            native.setForkliftForkHeight(vehicle.scriptID, value)
        }, 50)
    }
})

alt.onServer('obj', pos => {
    let obj = native.getHashKey('apa_prop_flag_brazil')
    native.createObject(obj, pos.x, pos.y, pos.z, true, false, false)
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


alt.onServer('setColete', playerID => {
    let ped = native.getPlayerPed(playerID)
    native.setPedArmour(ped, 150)
})

alt.onServer('tag', player => {
    let ped = native.getPlayerPed(player)
    let name = native.getPlayerName(player)
    let gamerTagID = native.createMpGamerTagWithCrewColor(ped, name, true, false, 'Armario', 0, 145, 35, 223)
    native.setMpGamerTagVisibility(gamerTagID, 0, true, 2)
    alt.log(gamerTagID)
})

function drawText3d(msg, posX, posY, posZ, scale, fontType, r, g, b, a, useOutline = true, useDropShadow = true) {
    const entity = alt.Player.local.vehicle ? alt.Player.local.vehicle.scriptID : alt.Player.local.scriptID;
    const vector = native.getEntityVelocity(entity);
    const frameTime = native.getFrameTime();
    native.setDrawOrigin(posX + (vector.x * frameTime), posY + (vector.y * frameTime), posZ + (vector.z * frameTime), 0);
    native.beginTextCommandDisplayText('STRING');
    native.addTextComponentSubstringPlayerName(msg);
    native.setTextFont(fontType);
    native.setTextScale(1, scale);
    native.setTextWrap(0.0, 1.0);
    native.setTextCentre(true);
    native.setTextColour(r, g, b, a);

    if (useOutline) native.setTextOutline();
    if (useDropShadow) native.setTextDropShadow();

    native.endTextCommandDisplayText(0, 0);
    native.clearDrawOrigin();
}

// Notification Handle Doesn't work with advanced notifications
// Duration Multiplier is really weird, seems than 1 is default value, 5 show it for an eternity
function showNotification(message, backgroundColor = null, notifImage = null, iconType = 0, title = "Title", subtitle = "subtitle", durationMult = 1) {
    native.setNotificationTextEntry('STRING');
    native.addTextComponentSubstringPlayerName(message);
    if (backgroundColor != null)
        native.setNotificationBackgroundColor(backgroundColor);
    if (notifImage != null)
        native.setNotificationMessage4(notifImage, notifImage, false, iconType, title, subtitle, durationMult);
    return native.drawNotification(false, true);
}



alt.onServer('noty', pos => {
    // alt.log('tesassssssssssssssssssssssssssssssssssssssssssssssssst')
    // drawText3d('mesnagxzccccccccccccccccccccccccem teste', pos.x, pos.y, pos.z, 3, 244, 233, 255, 155, true, true)

    let notifHandle = showNotification("My Cool RP Message With ~g~Co~o~lo~y~urs ~n~With Multilines and ~h~ Bold Text", null, "CHAR_CALL911", 0, "The title", "My Cool RP Notif", 1);

    // adiciona tatuagem
    // native.addPedDecorationFromHashes(alt.Player.local.scriptID, native.getHashKey('mpbiker_overlays'), native.getHashKey('MP_MP_Biker_Tat_000_M'));
})


native.requestIpl('hei_carrier')

native.requestIpl('ex_dt1_11_office_02b')





// enable cassino
// native.requestIpl('hei_dlc_windows_casino')
// native.requestIpl('hei_dlc_casino_door')
// native.requestIpl('vw_dlc_casino_door')
// native.requestIpl('hei_dlc_casino_aircon')
// native.requestIpl('vw_casino_main')
// native.requestIpl('vw_casino_garage')
// native.requestIpl('vw_casino_carpark')
// native.requestIpl('vw_casino_penthouse')
// let phPropList = [
//     "Set_Pent_Tint_Shell",
//     "Set_Pent_Pattern_01",
//     "Set_Pent_Spa_Bar_Open",
//     "Set_Pent_Media_Bar_Open",
//     "Set_Pent_Dealer",
//     "Set_Pent_Arcade_Retro",
//     "Set_Pent_Bar_Clutter",
//     "Set_Pent_Clutter_01",
//     "set_pent_bar_light_01",
//     "set_pent_bar_party_0"
// ];

// for (const propName of phPropList) {
//     native.enableInteriorProp(274689, propName);
//     native.setInteriorPropColor(274689, propName, 1)
// }

// native.refreshInterior(274689)

// native.setNotificationTextEntry("STRING");
// native.addTextComponentSubstringPlayerName("This is a notification. \r\n Nice.");
// native.setNotificationMessageClanTag("CHAR_SOCIAL_CLUB", "CHAR_SOCIAL_CLUB", 1, 7, "~c~ Test", 1, "___DEV", 8);
// native.drawNotification(false, false);

alt.onServer('tpToWayPoint', () => {
    let waypoint = native.getFirstBlipInfoId(8);

    if (native.doesBlipExist(waypoint)) {
        let coords = native.getBlipInfoIdCoord(waypoint)
        alt.emitServer('setPos', coords)
    }
})


alt.on('update', () => {
    alt.log('updatedCalled')
})

// alt.onServer('forkLiftTrigger', vehicle => {
//     try {
//         let value = 0.0
//         if (vehicle !== null) {
//             let interval = alt.setInterval(() => {
//                 value += 0.005
//                 if (value >= 1.0) {
//                     alt.clearInterval(value)
//                 }
//                 native.setForkliftForkHeight(vehicle.scriptID, value)
//             }, 50)
//         }
//     } catch(e) {}
// })
// 

alt.onServer('tellHeading', objName => {
    let heading = native.getEntityHeading(alt.getLocalPlayer().scriptID)
    let forwardVector = native.getEntityForwardVector(alt.getLocalPlayer().scriptID)
    alt.log(`Heading ${heading} ForwardVector x=${forwardVector.x} y=${forwardVector.y} z=${forwardVector.z}`)
    alt.emitServer('responseHeading', objName, heading, forwardVector)
})

let nearbyItems = {};
let nearbyItemsProp = {};

alt.onServer(
    ENTITY_STREAM_IN_EVENT,
    (entity) => {
        if(entity.data.type === 'DROPPED_ITEM') {
            alt.log("Item should be spawned. (TODO)")

            nearbyItems[entity.id] = {
                entity: entity
            }
            
            let obj = native.createObject(native.getHashKey(entity.data.prop), entity.pos.x, entity.pos.y, entity.pos.z, false, false, false)
            native.placeObjectOnGroundProperly(obj)
            native.setEntityCollision(obj, true, true)
            // O 90.0 deixa na frente do servidor
            native.setEntityHeading(obj, entity.data.heading + 90.0);
            nearbyItemsProp[entity.id] = {
                obj: obj
            }
        }
    }
)

alt.onServer(
    ENTITY_STREAM_OUT_EVENT,
    (entity) => {
        if(entity.data.type === 'DROPPED_ITEM') {
            alt.log("Item should be despawned. (TODO)")
            native.deleteObject(nearbyItemsProp[entity.id].obj)
            delete nearbyItemsProp[entity.id]
        }
    }
)

// remover objetos
// alt.on('disconnect', () => {
//     for (let ) {

//     }
//     native.deleteObject(nearbyItemsProp[entity.id].obj)
// })