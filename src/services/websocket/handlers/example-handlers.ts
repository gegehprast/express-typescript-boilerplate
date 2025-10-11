import { createEventHandler } from '../EventRegistry.js'
import { IEventHandler } from '../types.js'

/**
 * Example handler: Reverses a text string
 * Event: 'reverse_text'
 * Input: { text: string }
 * Output: 'text_reversed' event with { original: string, reversed: string }
 */
export const reverseTextHandler: IEventHandler = createEventHandler('reverse_text', (socket, data: { text: string }) => {
    console.log(`[WebSocket] Reverse text request from ${socket.id}:`, data)
    
    if (typeof data.text !== 'string') {
        socket.emit('reverse_text_error', {
            error: 'Invalid input',
            message: 'Text must be a string',
            received: data,
            timestamp: new Date().toISOString()
        })
        return
    }
    
    const reversed = data.text.split('').reverse().join('')
    
    socket.emit('text_reversed', {
        original: data.text,
        reversed: reversed,
        timestamp: new Date().toISOString()
    })
    
    console.log(`[WebSocket] Text reversed: "${data.text}" -> "${reversed}"`)
})

/**
 * Example handler: Generates a random number within a range
 * Event: 'random_number'
 * Input: { min: number, max: number }
 * Output: 'number_generated' event with { min: number, max: number, result: number }
 */
export const randomNumberHandler: IEventHandler = createEventHandler('random_number', (socket, data: { min: number, max: number }) => {
    console.log(`[WebSocket] Random number request from ${socket.id}:`, data)
    
    if (typeof data.min !== 'number' || typeof data.max !== 'number') {
        socket.emit('random_number_error', {
            error: 'Invalid input',
            message: 'Both min and max must be numbers',
            received: data,
            timestamp: new Date().toISOString()
        })
        return
    }
    
    if (data.min >= data.max) {
        socket.emit('random_number_error', {
            error: 'Invalid range',
            message: 'Min must be less than max',
            received: data,
            timestamp: new Date().toISOString()
        })
        return
    }
    
    const result = Math.floor(Math.random() * (data.max - data.min + 1)) + data.min
    
    socket.emit('number_generated', {
        min: data.min,
        max: data.max,
        result: result,
        timestamp: new Date().toISOString()
    })
    
    console.log(`[WebSocket] Random number generated: ${result} (range: ${data.min}-${data.max})`)
})
