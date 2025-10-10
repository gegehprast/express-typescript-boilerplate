import { Server as SocketIOServer } from 'socket.io'
import { Server as HttpServer } from 'http'
import { IService } from '../../types/service.js'

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

    constructor(getHttpServer: () => HttpServer | null, config: WebSocketServiceConfig = {}) {
        this.getHttpServer = getHttpServer
        this.config = {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
                ...config.cors,
            },
        }
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

        this.io.on('connection', (socket) => {
            console.log(`[WebSocket] Client connected: ${socket.id}`)

            socket.on('disconnect', () => {
                console.log(`[WebSocket] Client disconnected: ${socket.id}`)
            })

            socket.on('message', (data) => {
                console.log(`[WebSocket] Message from ${socket.id}:`, data)
                // Echo the message back
                socket.emit('message', {
                    echo: data,
                    timestamp: new Date().toISOString(),
                })
            })

            // Ping/Pong for connection health
            socket.on('ping', () => {
                socket.emit('pong', { timestamp: new Date().toISOString() })
            })

            // Broadcast message to all clients
            socket.on('broadcast', (data) => {
                console.log(`[WebSocket] Broadcasting message from ${socket.id}:`, data)
                socket.broadcast.emit('broadcast', {
                    from: socket.id,
                    message: data,
                    timestamp: new Date().toISOString(),
                })
            })
        })
    }

    getIO(): SocketIOServer | null {
        return this.io
    }
}
