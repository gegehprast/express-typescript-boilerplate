import express, { Express, Request, Response } from 'express'
import { Server } from 'http'
import { IService } from '../../types/service.js'
import { config } from '../../configs/app.js'
import { setupMiddleware, setupRoutes } from './bootstrap.js'

export interface HttpServiceConfig {
    port?: number
    host?: string
}

export class HttpService implements IService {
    public readonly name = 'http'
    private expressApp: Express
    private server: Server | null = null
    private config: Required<HttpServiceConfig>

    constructor(serviceConfig: HttpServiceConfig = {}) {
        this.config = {
            port: serviceConfig.port || config.port,
            host: serviceConfig.host || config.host,
        }

        this.expressApp = express()

        setupMiddleware(this.expressApp)
        setupRoutes(this.expressApp)
    }

    async start(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.expressApp.listen(this.config.port, this.config.host, () => {
                    console.log(
                        `[HTTP] Server running on http://${this.config.host}:${this.config.port}`,
                    )
                    resolve()
                })

                this.server.on('error', (error) => {
                    console.error('[HTTP] Server error:', error)
                    reject(error)
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    async stop(): Promise<void> {
        if (!this.server) {
            return
        }

        return new Promise((resolve, reject) => {
            this.server!.close((error) => {
                if (error) {
                    console.error('[HTTP] Error stopping server:', error)
                    reject(error)
                } else {
                    console.log('[HTTP] Server stopped')
                    this.server = null
                    resolve()
                }
            })
        })
    }

    isRunning(): boolean {
        return this.server !== null && this.server.listening
    }

    getApp(): Express {
        return this.expressApp
    }

    getServer(): Server | null {
        return this.server
    }
}
