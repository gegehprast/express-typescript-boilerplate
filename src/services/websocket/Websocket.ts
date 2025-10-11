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
}
