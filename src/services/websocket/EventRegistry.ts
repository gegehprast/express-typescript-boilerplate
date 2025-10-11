import { Socket } from 'socket.io'
import { IEventHandler, IEventRegistry, IConnectionHandler } from './types.js'

export class EventRegistry implements IEventRegistry {
    private handlers = new Map<string, IEventHandler['handler']>()
    private connectionHandlers: IConnectionHandler[] = []

    register(handler: IEventHandler): void {
        if (this.handlers.has(handler.event)) {
            console.warn(`[WebSocket] Handler for event '${handler.event}' already exists. Overwriting.`)
        }
        this.handlers.set(handler.event, handler.handler)
        console.log(`[WebSocket] Registered handler for event: ${handler.event}`)
    }

    registerMultiple(handlers: IEventHandler[]): void {
        handlers.forEach(handler => this.register(handler))
    }

    registerConnectionHandler(handler: IConnectionHandler): void {
        this.connectionHandlers.push(handler)
    }

    getHandlers(): Map<string, IEventHandler['handler']> {
        return this.handlers
    }

    async handleEvent(socket: Socket, event: string, data: any): Promise<void> {
        const handler = this.handlers.get(event)
        if (handler) {
            try {
                await handler(socket, data)
            } catch (error) {
                console.error(`[WebSocket] Error handling event '${event}':`, error)
                socket.emit('error', {
                    event,
                    message: 'Error processing event',
                    timestamp: new Date().toISOString()
                })
            }
        } else {
            console.warn(`[WebSocket] No handler found for event: ${event}`)
        }
    }

    async handleConnection(socket: Socket): Promise<void> {
        for (const handler of this.connectionHandlers) {
            try {
                await handler.onConnect?.(socket)
            } catch (error) {
                console.error('[WebSocket] Error in connection handler:', error)
            }
        }
    }

    async handleDisconnection(socket: Socket, reason: string): Promise<void> {
        for (const handler of this.connectionHandlers) {
            try {
                await handler.onDisconnect?.(socket, reason)
            } catch (error) {
                console.error('[WebSocket] Error in disconnection handler:', error)
            }
        }
    }
}

// Helper function to create event handlers
export function createEventHandler(
    event: string,
    handler: (socket: Socket, data: any) => void | Promise<void>,
): IEventHandler {
    return { event, handler }
}
