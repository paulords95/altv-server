import * as alt from 'alt'
import * as chat from 'chat'
import peds  from '../client/peds.js'
import vehicles from '../client/vehicles.js'

let globalCars = {}

const positions = {
    'default': [-1062.4483642578125, -2985.73193359375, 13.17138671875],
    'pallets': [824.2417602539062, -809.3406372070312, 26.5164794921875],
    'praia_zancudo': [-2818.4833984375, 3603.6923828125, -0.4769287109375],
    'aeroporto': [-1062.4483642578125, -2985.73193359375, 13.17138671875],
    'altoagua' : [4081.7802734375, -2030.3077392578125, 2431.27197265625],
    'altocidade': [690.5538330078125, -1043.6043701171875, 2246.766357421875]
}

const weaponList = {
    // melee
    'unarmed': -1569615261,
    'knife': -1716189206,
    'nightstick': 1737195953,
    'hammer': 1317494643,
    'bat': -1786099057,
    'crowbar': -2067956739,
    'golfclub': 1141786504,
    'bottle': -102323637,
    'dagger': -1834847097,
    'hatchet': -102973651,
    'knuckleduster': -656458692,
    'machete': -581044007,
    'flashlight': -1951375401,
    'switchblade': -538741184,
    'poolcue': -1810795771,
    'wrench': 419712736,
    'battleaxe': -853065399,
    // pistols
    'pistol': 453432689,
    'pistolmk2': 3219281620,
    'combatpistol': 1593441988,
    'pistol50': -1716589765,
    'snspistol': -1076751822,
    'heavypistol': -771403250,
    'vintagepistol': 137902532,
    'marksmanpistol': -598887786,
    'revolver': -1045183535,
    'appistol': 584646201,
    'stungun': 911657153,
    'flaregun': 1198879012,
    // machine guns
    'microsmg': 324215364,
    'machinepistol': -619010992,
    'smg': 736523883,
    'smgmk2': 2024373456,
    'assaultsmg': -270015777,
    'combatpdw': 171789620,
    'mg': -1660422300,
    'combatmg': 2144741730,
    'combatmgmk2': 3686625920,
    'gusenberg': 1627465347,
    'minismg': -1121678507,
    // assault rifles
    'assaultrifle': -1074790547,
    'assaultriflemk2': 961495388,
    'carbinerifle': -2084633992,
    'carbineriflemk2': 4208062921,
    'advancedrifle': -1357824103,
    'specialcarbine': -1063057011,
    'bullpuprifle': 2132975508,
    'compactrifle': 1649403952,
    // snipers
    'sniperrifle': 100416529,
    'heavysniper': 205991906,
    'heavysnipermk2': 177293209,
    'marksmanrifle': -952879014,
    // shotguns
    'pumpshotgun': 487013001,
    'sawnoffshotgun': 2017895192,
    'bullpupshotgun': -1654528753,
    'assaultshotgun': -494615257,
    'musket': -1466123874,
    'heavyshotgun': 984333226,
    'doublebarrelshotgun': -275439685,
    'autoshotgun': 317205821,
    // heavy weapons
    'grenadelauncher': -1568386805,
    'rpg': -1312131151,
    'minigun': 1119849093,
    'firework': 2138347493,
    'railgun': 1834241177,
    'hominglauncher': 1672152130,
    'grenadelaunchersmoke': 1305664598,
    'compactlauncher': 125959754,
    // thrown
    'grenade': -1813897027,
    'widowmaker': 0xB62D1F67,
    'stickybomb': 741814745,
    'proximitymine': -1420407917,
    'bzgas': -1600701090,
    'molotov': 615608432,
    'fireextinguisher': 101631238,
    'petrolcan': 883325847,
    'flare': 1233104067,
    'ball': 600439132,
    'snowball': 126349499,
    'smokegrenade': -37975472,
    'pipebomb': -1169823560,
    // utility
    'parachute': -72657034,
    'carro': 2741846334,
    'porrada': 2725352035,
}

alt.onClient('pos', (player, data) => {
    alt.emitClient(player, 'posResponse', player.pos)
})

chat.registerCmd('pos', (player, args) => {
    chat.broadcast(`${player.name}: X=${player.pos.x}, Y=${player.pos.y}, Z=${player.pos.z}`)
    alt.emitClient(player, 'player:position', player.pos)
})

alt.on('playerConnect', (player) => {
    globalCars[player.id] = []
    chat.broadcast(`${player.name} conectado`)

    const pedArr = Object.keys(peds)
    let arrLen = pedArr.length
    let ped = pedArr[Math.floor(Math.random() * arrLen)]

    player.model = ped
    player.spawn(positions.default[0], positions.default[1], positions.default[2], 1000)
})

alt.on('playerDisconnect', (player, reason) => {
    chat.broadcast(`${player.name} desconectado`)
    if (globalCars[player.id] !== undefined) {
        for (let v of globalCars[player.id]) {
            v.destroy()
        }
        globalCars[player.id] = [];
    }
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

chat.registerCmd('todasarmas',(player) => {
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
        globalCars[player.id].push(v)
        alt.emitClient(player, 'enterCarro', v, vehicle)
})



chat.registerCmd('tp', (player, args) => {
    if (args.length === 0) {
        chat.send(player, `Você deve informar a posição, jogador ou cordenadas`)
        chat.send(player, `Exemplos:`)
        chat.send(player, `/tp the4fun`)
        chat.send(player, `/tp pallets`)
        chat.send(player, `/tp 813 -279`)
        return
    }

    if (args.length === 1) {
        for (let p of alt.Player.all) {
            if (p.name.toLowerCase() === args[0].toLowerCase()) {
                player.spawn(p.pos.x, p.pos.y, p.pos.z)
                chat.broadcast(`${player.name}: /tp ${args[0]}`)
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
})

chat.registerCmd('rmv', (player) => {
    if (globalCars[player.id] !== undefined) {
        for (let v of globalCars[player.id]) {
            v.destroy()
        }
        globalCars[player.id] = [];
    }

    chat.send(player, `Carros removidos`)
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

chat.registerCmd('skin', (player, args) => {
    if (args.length === 0) {
        chat.send(player, `Você deve informar o nome da skin`)
        chat.send(player, `Exemplo:`)
        chat.send(player, `/skin Business02AFM`)
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
