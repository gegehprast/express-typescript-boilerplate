import { EventRegistry } from './EventRegistry.js'

import { sumHandler } from './handlers/math-handlers.js'
import { reverseTextHandler, randomNumberHandler } from './handlers/example-handlers.js'
import {
    broadcastHandler,
    joinRoomHandler,
    leaveRoomHandler,
    messageHandler,
} from './handlers/message-handlers.js'
import { clientInfoHandler, pingHandler, serverInfoHandler } from './handlers/utility-handlers.js'
import { defaultConnectionHandler } from './handlers/connection-handlers.js'
import { getRoomsHandler, getRoomUsersHandler, getRoomsInfoHandler } from './handlers/room-info-handlers.js'

const registerEvents = (eventRegistry: EventRegistry): void => {
    // Register connection handlers. REQUIRED!
    eventRegistry.registerConnectionHandler(defaultConnectionHandler)

    // Register core message handlers
    eventRegistry.registerMultiple([
        messageHandler,
        broadcastHandler,
        joinRoomHandler,
        leaveRoomHandler,
        pingHandler,
        serverInfoHandler,
        clientInfoHandler,
    ])

    // Register math operation handlers
    eventRegistry.registerMultiple([sumHandler])

    // Register example handlers
    eventRegistry.registerMultiple([reverseTextHandler, randomNumberHandler])

    // Register room info handlers
    eventRegistry.registerMultiple([getRoomsHandler, getRoomUsersHandler, getRoomsInfoHandler])
}

export default registerEvents
