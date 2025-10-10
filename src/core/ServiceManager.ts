import { IService, IServiceManager } from '../types/service.js'

export class ServiceManager implements IServiceManager {
    private services: Map<string, IService> = new Map()

    registerService(service: IService): void {
        if (this.services.has(service.name)) {
            throw new Error(`Service '${service.name}' is already registered`)
        }

        this.services.set(service.name, service)
        console.log(`[ServiceManager] Registered service: ${service.name}`)
    }

    async startAll(): Promise<void> {
        console.log('[ServiceManager] Starting all services...')

        const startPromises = Array.from(this.services.values()).map(async (service) => {
            try {
                await service.start()
                console.log(`[ServiceManager] Started service: ${service.name}`)
            } catch (error) {
                console.error(`[ServiceManager] Failed to start service '${service.name}':`, error)
                throw error
            }
        })

        await Promise.all(startPromises)
        console.log('[ServiceManager] All services started successfully')
    }

    async stopAll(): Promise<void> {
        console.log('[ServiceManager] Stopping all services...')

        const stopPromises = Array.from(this.services.values())
            .reverse() // Stop in reverse order
            .map(async (service) => {
                try {
                    if (service.isRunning()) {
                        await service.stop()
                        console.log(`[ServiceManager] Stopped service: ${service.name}`)
                    }
                } catch (error) {
                    console.error(
                        `[ServiceManager] Error stopping service '${service.name}':`,
                        error,
                    )
                    // Don't throw here, we want to try stopping all services
                }
            })

        await Promise.all(stopPromises)
        console.log('[ServiceManager] All services stopped')
    }

    getService<T extends IService>(name: string): T | undefined {
        return this.services.get(name) as T | undefined
    }

    getAllServices(): IService[] {
        return Array.from(this.services.values())
    }
}
