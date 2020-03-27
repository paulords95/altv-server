import * as alt from 'alt'
import * as chat from 'chat'
import peds from './peds.js'
import vehicles from './vehicles.js'
import weaponList from './weapons.js'
import { createEntity, destroyEntity } from './streamer.mjs'


let globalCars = {}
let globalPlayerPos = {}
const entityIds = [];

const positions = {
    'default': [-1062.4483642578125, -2985.73193359375, 13.17138671875],
    'pallets': [824.2417602539062, -809.3406372070312, 26.5164794921875],
    'praia_zancudo': [-2818.4833984375, 3603.6923828125, -0.4769287109375],
    'aeroporto': [-1062.4483642578125, -2985.73193359375, 13.17138671875],
    'altoagua': [4081.7802734375, -2030.3077392578125, 2431.27197265625],
    'altocidade': [-774.7780151367188, -1226.123046875, 2511.56103515625],
    'portaaviao': [3084.73, -4770.709, 15.26167],
    'mazebank' : [-75.8466, -826.9893, 243.3859],
}

alt.onClient('pos', (player, data) => {
    alt.emitClient(player, 'posResponse', player.pos)
})

chat.registerCmd('pos', (player, args) => {
    chat.broadcast(`${player.name}: X=${player.pos.x}, Y=${player.pos.y}, Z=${player.pos.z}`)
    alt.emitClient(player, 'player:position', player.pos)
})

function registerPlayersBlips() {
    for (let p of alt.Player.all) {
        alt.emitClient(null, 'createPlayerBlip', p.id, p.name, p.pos)
    }
}

function removePlayerBlips() {
    for (let p of alt.Player.all) {
        alt.emitClient(null, 'deletePlayerBlip', p.id)
    }
}

alt.on('keydown', (player, vehicle) => {
    alt.emitClient(player, 'keydown', vehicle)
})

alt.on('playerConnect', (player) => {
    alt.emitClient(player, 'playerConnect', player)


    globalCars[player.id] = []
    chat.broadcast(`${player.name} conectado`)

    const pedArr = Object.keys(peds)
    let arrLen = pedArr.length
    let ped = pedArr[Math.floor(Math.random() * arrLen)]

    player.model = ped
    for (let key in weaponList) {
        player.giveWeapon(weaponList[key], 1000, true)
    }

    if (globalPlayerPos[player.socialId] !== undefined) {
        player.spawn(globalPlayerPos[player.socialId].x, globalPlayerPos[player.socialId].y, globalPlayerPos[player.socialId].z, 1000)
    } else {
        player.spawn(positions.default[0], positions.default[1], positions.default[2], 1000)
    }

    registerPlayersBlips()
})

alt.setInterval(() => {
    for (let p of alt.Player.all) {
        globalPlayerPos[p.socialId] = p.pos
        alt.emitClient(null, 'updatePlayerBlip', p.id, p.pos)
    }
}, 500)

alt.on('playerDisconnect', (player, reason) => {
    chat.broadcast(`${player.name} desconectado`)
    globalPlayerPos[player.socialId] = player.pos

    if (globalCars[player.id] !== undefined) {
        for (let v of globalCars[player.id]) {
            v.destroy()
        }
        globalCars[player.id] = []
    }

    removePlayerBlips()
})

alt.on('playerDeath', (player, killer, weapon) => {
    chat.broadcast(`${player.name} morreu!`)
    player.spawn(player.pos.x, player.pos.y, player.pos.z, 1000)
})


chat.registerCmd('arma', (player, args) => {
    if (args.length === 0) {
        chat.send(player, `Você deve informar o nome de uma arma`)
        chat.send(player, `Exemplo:`)
        chat.send(player, `/arma smg`)
        return
    }

    try {
        player.giveWeapon(weaponList[args[0]], 1000, true)
        chat.broadcast(`${player.name}: /arma ${args[0]}`)
    } catch (e) {
        chat.send(player, `Não foi possível encontrar a arma`)
    }
})

chat.registerCmd('todasarmas', (player) => {
    for (let key in weaponList) {
        player.giveWeapon(weaponList[key], 1000, true)
    }
});

chat.registerCmd('veh', (player, args) => {
    if (args.length === 0) {
        chat.send(player, `Você deve informar o nome do carro`)
        chat.send(player, `Exemplo:`)
        chat.send(player, `/veh infernus`)
        return
    }

    try {
        chat.broadcast(`${player.name}: /veh ${args[0]}`)
        let v = new alt.Vehicle(args[0], player.pos.x + 3, player.pos.y, player.pos.z, 0, 0, 0)
        let c1 = Math.floor(Math.random() * 158)
        let c2 = Math.floor(Math.random() * 158)
        v.primaryColor = c1
        v.secondaryColor = c2
        globalCars[player.id].push(v)
        alt.emitClient(player, 'enterCarro', v, args[0])
    } catch (e) {
        chat.send(player, `Não foi possível encontrar o veículo`)
    }
})


chat.registerCmd('anyveh', (player) => {
    chat.broadcast(`${player.name}: /anyveh`)

    const vehArr = Object.keys(vehicles)
    let vehArrLen = vehArr.length
    let vehicle = vehArr[Math.floor(Math.random() * vehArrLen)]
    let v = new alt.Vehicle(vehicle, player.pos.x + 3, player.pos.y, player.pos.z, 0, 0, 0)
    let c1 = Math.floor(Math.random() * 158)
    let c2 = Math.floor(Math.random() * 158)
    v.primaryColor = c1
    v.secondaryColor = c2
    globalCars[player.id].push(v)
    chat.broadcast(`${player.name}: Carro ${vehicle}`)
    alt.emitClient(player, 'enterCarro', v, vehicle)
})

chat.registerCmd('tp', (player, args) => {
    if (args.length === 0) {
        alt.emitClient(player, 'tpToWayPoint')
        // chat.send(player, `Você deve informar a posição, jogador ou cordenadas`)
        // chat.send(player, `Exemplos:`)
        // chat.send(player, `/tp the4fun`)
        // chat.send(player, `/tp pallets`)
        // chat.send(player, `/tp 813 -279`)
        return
    }

    if (args.length === 1) {
        for (let p of alt.Player.all) {
            if (p.name.toLowerCase() === args[0].toLowerCase()) {
                player.spawn(p.pos.x, p.pos.y, p.pos.z)
                chat.broadcast(`{00FF00}${player.name}: /tp ${args[0]}`)
                return;
            }
        }

        for (let p in positions) {
            if (p.toLowerCase() === args[0].toLowerCase()) {
                player.spawn(positions[p][0], positions[p][1], positions[p][2], 1000)
                chat.broadcast(`${player.name}: /tp ${args[0]}`)
                return
            }
        }

        chat.send(player, `Não foi possível encontrar a posição ou jogador`)
        return
    }

    if (args.length === 2) {
        player.spawn(args[0], args[1], 100, 1000)
        chat.broadcast(`${player.name}: /tp ${args[0]} ${args[1]}`)
    }

    if (args.length === 3) {
        player.spawn(args[0], args[1],args[2], 1000)
        chat.broadcast(`${player.name}: /tp ${args[0]} ${args[1]} ${args[2]}`)
    }
})

chat.registerCmd('rmv', (player) => {
    if (globalCars[player.id] !== undefined) {
        for (let v of globalCars[player.id]) {
            v.destroy()
        }
        globalCars[player.id] = []
    }

    chat.send(player, `Carros removidos`)
})

alt.on('resourceStop', () => {
    alt.log('Yes, stopped')

    for (let playerID in globalCars) {
        for (let v of globalCars[playerID]) {
            v.destroy()
        }

        delete globalCars[playerID]
    }

    for (let id in entityIds) {
       destroyEntity(id)
    }
})

alt.onClient('rmv', (player) => {
    if (globalCars[player.id] !== undefined) {
        for (let v of globalCars[player.id]) {
            v.destroy()
        }
        globalCars[player.id] = [];
    }

    chat.send(player, `Carros removidos`)
})

alt.onClient('setPos', (player, pos) => {
    pos.z = 1000
    player.pos = pos
})

chat.registerCmd('skin', (player, args) => {
    if (args.length === 0) {
        chat.send(player, `Você deve informar o nome da skin`)
        chat.send(player, `Exemplo:`)
        chat.send(player, `/skin ig_abigail`)
        chat.send(player, `Sua skin atual: ${player.model}`)
        return
    }

    try {
        player.model = args[0]
        player.spawn(player.pos.x, player.pos.y, player.pos.z, 1000)
    } catch (e) {
        chat.send(player, `Não foi possível encontrar a skin`)
    }
})

alt.on('playerEnteredVehicle', (player, vehicle, seat) => {
    alt.emitClient(player, 'playerEnterVehicle', vehicle, seat)
})

alt.on('playerLeftVehicle', (player, vehicle, seat) => {
    alt.emitClient(player, 'playerLeftVehicle', seat)
})

alt.on('playerChangedVehicleSeat', (player, vehicle, oldSeat, newSeat) => {
    alt.emitClient(player, 'playerChangedVehicleSeat', vehicle, newSeat)
})

chat.registerCmd('fix', (player) => {
    alt.emitClient(player, 'fix', player.vehicle)
})

const weather = {
    'sol': 0,
    'claro': 1,
    'nuvens': 2,
    'poluicao': 3,
    'neblina': 4,
    'nublado': 5,
    'chuva': 6,
    'tempestade': 7,
    'chuvafraca': 8,
    'poluicaochuvafraca': 9,
    'nevefraca': 10,
    'nevevento': 11,
    'neve': 12,
};

const weatherNames = Object.keys(weather)

chat.registerCmd('tempo', (player, args) => {
    if (args.length === 0) {
        chat.send(player, `Você deve informar o nome do tempo`)
        chat.send(player, `Exemplo:`)
        chat.send(player, `/tempo sol`)
        chat.send(player, `Valores: ${weatherNames.join(', ')}`)
        return
    }
    
    try {
        for (let p of alt.Player.all) {
            p.setWeather(weather[args[0]])
        }
        chat.broadcast(`${player.name}: /tempo ${args[0]}`)
    } catch (e) {
        chat.send(player, `Não foi possível encontrar o tempo`)
    }
})

chat.registerCmd('hora', (player, args) => {
    if (args.length === 0) {
        chat.send(player, `Você deve informar a hora`)
        chat.send(player, `Exemplo:`)
        chat.send(player, `/hora 10`)
        return
    }
    
    chat.broadcast(`${player.name}: /hora ${args[0]}`)
    alt.emitClient(null, 'hora', args[0])
})

chat.registerCmd('colete', (player) => {
    alt.emitClient(null, 'setColete', player)
})

chat.registerCmd('obj', (player, args) => {
    if (args.length === 0) {
        chat.send(player, `Você deve informar o nome do objeto`)
        chat.send(player, `Exemplo:`)
        chat.send(player, `/obj stt_prop_ramp_jump_xl`)
        return
    }

    // alt.emitClient(null, 'noty', player.pos)
    alt.emitClient(player, 'tellHeading', args[0])
})



alt.onClient('responseHeading', (player, obj, heading, forwardVector) => {
    try {
        let distance = 15

        const id = createEntity(
            {
                x: player.pos.x + forwardVector.x  * distance,
                y: player.pos.y + forwardVector.y  * distance,
                z: player.pos.z + forwardVector.z  * distance
            },
            {
                type: "DROPPED_ITEM",
                prop: obj,
                name: obj,
                heading: heading
            }
        )

        entityIds.push(id)
    } catch (e) {}
})


chat.registerCmd('rmo', (player) => {
    if (entityIds.length === 0) {
        chat.send(player, `Sem objetos irmão!! Endoidou?`)
        return
    }

    const id = entityIds.pop()
    destroyEntity(id)
})



alt.onClient('forkLiftEnable', player => {
    alt.emitClient(player, 'forkLiftTrigger',  player.vehicle)
})

