import { ServiceManager } from './core/ServiceManager.js'
import { HttpService } from './services/http/Http.js'
import { WebSocketService } from './services/websocket/Websocket.js'
import { config } from './configs/app.js'
import pkg from '../package.json' with { type: 'json' }

class App {
    private serviceManager: ServiceManager
    private isInitialized = false
    private version = pkg.version

    constructor() {
        this.serviceManager = new ServiceManager()
        this.version = pkg.version
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            throw new Error('App is already initialized')
        }

        console.log('[App] Initializing application...')

        // Register services
        this.registerServices()

        this.isInitialized = true
        console.log('[App] Application initialized')
    }

    private registerServices(): void {
        // Register HTTP service
        const httpService = new HttpService({
            port: config.port,
            host: config.host,
        })
        this.serviceManager.registerService(httpService)

        // Register WebSocket service
        const wsService = new WebSocketService(() => httpService.getServer(), {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        })
        this.serviceManager.registerService(wsService)
    }

    public async start(): Promise<void> {
        if (!this.isInitialized) {
            await this.initialize()
        }

        console.log('[App] Starting application...')
        await this.serviceManager.startAll()
        console.log('[App] Application started successfully')
    }

    public async stop(): Promise<void> {
        console.log('[App] Stopping application...')
        await this.serviceManager.stopAll()
        console.log('[App] Application stopped')
    }

    public getServiceManager(): ServiceManager {
        return this.serviceManager
    }

    public getVersion(): string {
        return this.version
    }
}

const app: App = new App()

export default app
