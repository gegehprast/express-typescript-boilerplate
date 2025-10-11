import { Server as SocketIOServer } from 'socket.io'
import { Server as HttpServer } from 'http'
import { IService } from '../../types/service.js'
import { EventRegistry } from './EventRegistry.js'
import registerEvents from './event-registration.js'

export interface WebSocketServiceConfig {
    cors?: {
        origin: string | string[]
        methods: string[]
    }
}

export class WebSocketService implements IService {
    public readonly name = 'websocket'
    private io: SocketIOServer | null = null
    private httpServer: HttpServer | null = null
    private getHttpServer: () => HttpServer | null
    private config: WebSocketServiceConfig
    private eventRegistry: EventRegistry

    constructor(getHttpServer: () => HttpServer | null, config: WebSocketServiceConfig = {}) {
        this.getHttpServer = getHttpServer
        this.config = {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
                ...config.cors,
            },
        }

        this.eventRegistry = new EventRegistry()
        registerEvents(this.eventRegistry)
    }

    async start(): Promise<void> {
        let attempts = 0
        const maxAttempts = 5
        const delay = 1000 // 1 second

        while (attempts < maxAttempts) {
            this.httpServer = this.getHttpServer()
            if (this.httpServer) break
            attempts++
            await new Promise((resolve) => setTimeout(resolve, delay))
        }

        if (!this.httpServer) {
            throw new Error(
                '[WebSocket] HTTP server is not available. Make sure HTTP service is started first.',
            )
        }

        this.io = new SocketIOServer(this.httpServer, {
            cors: this.config.cors,
        })

        this.setupEventHandlers()
        console.log('[WebSocket] WebSocket server initialized')
    }

    async stop(): Promise<void> {
        if (this.io) {
            this.io.close()
            this.io = null
            console.log('[WebSocket] WebSocket server stopped')
        }
    }

    isRunning(): boolean {
        return this.io !== null
    }

    private setupEventHandlers(): void {
        if (!this.io) return

        this.io.on('connection', async (socket) => {
            await this.eventRegistry.handleConnection(socket)

            socket.on('disconnect', async (reason) => {
                await this.eventRegistry.handleDisconnection(socket, reason)
            })

            const handlers = this.eventRegistry.getHandlers()

            for (const [event, handler] of handlers) {
                socket.on(event, async (data) => {
                    await this.eventRegistry.handleEvent(socket, event, data)
                })
            }
        })
    }

    getIO(): SocketIOServer | null {
        return this.io
    }

    getEventRegistry(): EventRegistry {
        return this.eventRegistry
    }

    registerEventHandler(
        event: string,
        handler: (socket: any, data: any) => void | Promise<void>,
    ): void {
        this.eventRegistry.register({ event, handler })
    }

    getRoomList(): string[] {
        if (!this.io) return []
        
        const rooms: string[] = []
        const adapter = this.io.sockets.adapter
        
        for (const [roomName] of adapter.rooms) {
            // Filter out socket IDs (which are also stored as rooms)
            // Socket IDs are typically UUIDs, so we skip them if they look like socket IDs
            if (!roomName.match(/^[a-zA-Z0-9_-]{20,}$/)) {
                rooms.push(roomName)
            }
        }
        
        return rooms
    }

    getUsersInRoom(roomName: string): string[] {
        if (!this.io) return []
        
        const room = this.io.sockets.adapter.rooms.get(roomName)
        if (!room) return []
        
        return Array.from(room)
    }

    getRoomInfo(roomName: string): { name: string; userCount: number; users: string[] } | null {
        if (!this.io) return null
        
        const room = this.io.sockets.adapter.rooms.get(roomName)
        if (!room) return null
        
        const users = Array.from(room)
        
        return {
            name: roomName,
            userCount: users.length,
            users: users
        }
    }

    getAllRoomsInfo(): Array<{ name: string; userCount: number; users: string[] }> {
        if (!this.io) return []
        
        const roomsInfo: Array<{ name: string; userCount: number; users: string[] }> = []
        const adapter = this.io.sockets.adapter
        
        for (const [roomName, room] of adapter.rooms) {
            // Filter out socket IDs (which are also stored as rooms)
            if (!roomName.match(/^[a-zA-Z0-9_-]{20,}$/)) {
                const users = Array.from(room)
                roomsInfo.push({
                    name: roomName,
                    userCount: users.length,
                    users: users
                })
            }
        }
        
        return roomsInfo
    }
}
