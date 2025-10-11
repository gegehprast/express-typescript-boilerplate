import { Socket } from 'socket.io'
import { IConnectionHandler } from '../types.js'

export const defaultConnectionHandler: IConnectionHandler = {
    async onConnect(socket: Socket) {
        console.log(`[WebSocket] Client connected: ${socket.id}`)
        
        socket.emit('connected', {
            message: 'Welcome to the WebSocket server!',
            clientId: socket.id,
            timestamp: new Date().toISOString()
        })
        
        socket.join('general')
        
        socket.broadcast.emit('user_connected', {
            userId: socket.id,
            timestamp: new Date().toISOString()
        })
    },

    async onDisconnect(socket: Socket, reason: string) {
        console.log(`[WebSocket] Client disconnected: ${socket.id}, reason: ${reason}`)
        
        socket.broadcast.emit('user_disconnected', {
            userId: socket.id,
            reason,
            timestamp: new Date().toISOString()
        })
    }
}
