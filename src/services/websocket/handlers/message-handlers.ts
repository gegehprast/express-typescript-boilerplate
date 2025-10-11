import { Socket } from 'socket.io'
import { IEventHandler } from '../types.js'
import { createEventHandler } from '../EventRegistry.js'

// Message handler - echo messages back to sender
export const messageHandler: IEventHandler = createEventHandler('message', (socket: Socket, data: any) => {
    console.log(`[WebSocket] Message from ${socket.id}:`, data)
    
    socket.emit('message', {
        echo: data,
        timestamp: new Date().toISOString(),
        from: 'server'
    })
})

// Broadcast handler - send message to all other clients
export const broadcastHandler: IEventHandler = createEventHandler('broadcast', (socket: Socket, data: any) => {
    console.log(`[WebSocket] Broadcasting message from ${socket.id}:`, data)
    
    socket.broadcast.emit('broadcast', {
        from: socket.id,
        message: data,
        timestamp: new Date().toISOString(),
    })
    
    socket.emit('broadcast_sent', {
        message: 'Message broadcasted successfully',
        timestamp: new Date().toISOString()
    })
})

// Join room handler
export const joinRoomHandler: IEventHandler = createEventHandler('join_room', (socket: Socket, data: { room: string }) => {
    const { room } = data
    
    if (!room) {
        socket.emit('error', { message: 'Room name is required' })
        return
    }
    
    socket.join(room)
    console.log(`[WebSocket] Socket ${socket.id} joined room: ${room}`)
    
    socket.emit('room_joined', { 
        room, 
        message: `Successfully joined room: ${room}`,
        timestamp: new Date().toISOString()
    })
    
    // Notify others in the room
    socket.to(room).emit('user_joined', {
        userId: socket.id,
        room,
        timestamp: new Date().toISOString()
    })
})

// Leave room handler
export const leaveRoomHandler: IEventHandler = createEventHandler('leave_room', (socket: Socket, data: { room: string }) => {
    const { room } = data
    
    if (!room) {
        socket.emit('error', { message: 'Room name is required' })
        return
    }
    
    socket.leave(room)
    console.log(`[WebSocket] Socket ${socket.id} left room: ${room}`)
    
    socket.emit('room_left', { 
        room, 
        message: `Successfully left room: ${room}`,
        timestamp: new Date().toISOString()
    })
    
    // Notify others in the room
    socket.to(room).emit('user_left', {
        userId: socket.id,
        room,
        timestamp: new Date().toISOString()
    })
})
