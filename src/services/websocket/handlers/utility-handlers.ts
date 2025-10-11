import { Socket } from 'socket.io'
import { IEventHandler } from '../types.js'
import { createEventHandler } from '../EventRegistry.js'

// Ping handler for connection health checks
export const pingHandler: IEventHandler = createEventHandler('ping', (socket: Socket, data: any) => {
    socket.emit('pong', { 
        timestamp: new Date().toISOString(),
        latency: data.timestamp ? Date.now() - data.timestamp : null
    })
})

// Get server info handler
export const serverInfoHandler: IEventHandler = createEventHandler('server_info', (socket: Socket) => {
    socket.emit('server_info', {
        serverId: process.env.SERVER_ID || 'default',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || 'unknown'
    })
})

// Get client info handler  
export const clientInfoHandler: IEventHandler = createEventHandler('client_info', (socket: Socket) => {
    const rooms = Array.from(socket.rooms).filter(room => room !== socket.id)
    
    socket.emit('client_info', {
        clientId: socket.id,
        joinedRooms: rooms,
        timestamp: new Date().toISOString()
    })
})
