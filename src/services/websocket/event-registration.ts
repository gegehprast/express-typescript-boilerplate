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
}

export default registerEvents
