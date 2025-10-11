import { Socket } from 'socket.io'

export interface IEvent<T = any> {
    event: string
    data: T
}

export interface IEventHandler {
    event: string
    handler: (socket: Socket, data: any) => void | Promise<void>
}

export interface IEventRegistry {
    register(handler: IEventHandler): void
    registerMultiple(handlers: IEventHandler[]): void
    getHandlers(): Map<string, IEventHandler['handler']>
    handleEvent(socket: Socket, event: string, data: any): Promise<void>
}

export interface IConnectionHandler {
    onConnect?(socket: Socket): void | Promise<void>
    onDisconnect?(socket: Socket, reason: string): void | Promise<void>
}
