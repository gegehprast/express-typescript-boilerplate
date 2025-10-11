import { Socket } from 'socket.io'
import { IEventHandler } from '../types.js'
import { createEventHandler } from '../EventRegistry.js';

// Sum handler - adds two numbers and returns the result
export const sumHandler: IEventHandler = createEventHandler('sum', (socket: Socket, data: { a: number; b: number }) => {
    console.log(`[WebSocket] Sum request from ${socket.id}:`, data)
    
    if (typeof data.a !== 'number' || typeof data.b !== 'number') {
        socket.emit('sum_error', {
            error: 'Invalid input',
            message: 'Both "a" and "b" must be numbers',
            received: data,
            timestamp: new Date().toISOString()
        })
        return
    }
    
    const result = data.a + data.b
    
    socket.emit('sum_result', {
        a: data.a,
        b: data.b,
        result: result,
        timestamp: new Date().toISOString()
    })
    
    console.log(`[WebSocket] Sum calculation: ${data.a} + ${data.b} = ${result}`)
})
