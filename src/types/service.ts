export interface IService {
    name: string
    start(): Promise<void>
    stop(): Promise<void>
    isRunning(): boolean
}

export interface IServiceManager {
    registerService(service: IService): void
    startAll(): Promise<void>
    stopAll(): Promise<void>
    getService<T extends IService>(name: string): T | undefined
    getAllServices(): IService[]
}
