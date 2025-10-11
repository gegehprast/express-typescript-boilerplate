import { Socket } from 'socket.io'
import { createEventHandler } from '../EventRegistry.js'
import { IEventHandler } from '../types.js'

/**
 * Get list of all active rooms
 * Event: 'get_rooms'
 * Input: {} (no data needed)
 * Output: 'rooms_list' event with { rooms: string[] }
 */
export const getRoomsHandler: IEventHandler = createEventHandler('get_rooms', (socket: Socket) => {
    console.log(`[WebSocket] Get rooms request from ${socket.id}`)
    
    const adapter = socket.nsp.adapter
    const rooms: string[] = []
    
    for (const [roomName] of adapter.rooms) {
        // Filter out socket IDs (which are also stored as rooms)
        // Socket IDs are typically long alphanumeric strings
        if (!roomName.match(/^[a-zA-Z0-9_-]{20,}$/)) {
            rooms.push(roomName)
        }
    }
    
    socket.emit('rooms_list', {
        rooms: rooms,
        count: rooms.length,
        timestamp: new Date().toISOString()
    })
    
    console.log(`[WebSocket] Sent rooms list: ${rooms.length} rooms`)
})

/**
 * Get users in a specific room
 * Event: 'get_room_users'
 * Input: { room: string }
 * Output: 'room_users' event with { room: string, users: string[], count: number }
 */
export const getRoomUsersHandler: IEventHandler = createEventHandler('get_room_users', (socket: Socket, data: { room: string }) => {
    console.log(`[WebSocket] Get room users request from ${socket.id}:`, data)
    
    if (!data.room || typeof data.room !== 'string') {
        socket.emit('room_users_error', {
            error: 'Invalid input',
            message: 'Room name must be provided as a string',
            received: data,
            timestamp: new Date().toISOString()
        })
        return
    }
    
    const adapter = socket.nsp.adapter
    const room = adapter.rooms.get(data.room)
    
    if (!room) {
        socket.emit('room_users', {
            room: data.room,
            users: [],
            count: 0,
            exists: false,
            timestamp: new Date().toISOString()
        })
        return
    }
    
    const users = Array.from(room) as string[]
    
    socket.emit('room_users', {
        room: data.room,
        users: users,
        count: users.length,
        exists: true,
        timestamp: new Date().toISOString()
    })
    
    console.log(`[WebSocket] Sent users for room "${data.room}": ${users.length} users`)
})

/**
 * Get detailed information about all rooms
 * Event: 'get_rooms_info'
 * Input: {} (no data needed)
 * Output: 'rooms_info' event with detailed room data
 */
export const getRoomsInfoHandler: IEventHandler = createEventHandler('get_rooms_info', (socket: Socket) => {
    console.log(`[WebSocket] Get rooms info request from ${socket.id}`)
    
    const adapter = socket.nsp.adapter
    const roomsInfo: Array<{ name: string; userCount: number; users: string[] }> = []
    
    for (const [roomName, room] of adapter.rooms) {
        // Filter out socket IDs (which are also stored as rooms)
        if (!roomName.match(/^[a-zA-Z0-9_-]{20,}$/)) {
            const users = Array.from(room) as string[]
            roomsInfo.push({
                name: roomName,
                userCount: users.length,
                users: users
            })
        }
    }
    
    socket.emit('rooms_info', {
        rooms: roomsInfo,
        totalRooms: roomsInfo.length,
        totalUsers: roomsInfo.reduce((sum, room) => sum + room.userCount, 0),
        timestamp: new Date().toISOString()
    })
    
    console.log(`[WebSocket] Sent detailed rooms info: ${roomsInfo.length} rooms`)
})
