import express, { Express, Request, Response } from 'express'
import config from '../../configs/app.js'
import routes from './routes.js'
import { response } from './response.js'

export function setupMiddleware(app: Express): void {
    // Basic middleware setup
    app.use(express.json({ limit: '10mb' }))
    app.use(express.urlencoded({ extended: true, limit: '10mb' }))

    // Request logging
    app.use((req: Request, res: Response, next) => {
        console.log(`[HTTP] ${req.method} ${req.url}`)
        next()
    })
}

export function setupRoutes(app: Express): void {
    routes(app)

    // 404 handler - catch all unmatched routes
    app.use((req: Request, res: Response, next) => {
        response.error(res, 'Not Found', 404, {
            method: req.method,
            url: req.originalUrl,
            timestamp: new Date().toISOString(),
        })
    })

    // Error handler
    app.use((error: any, req: Request, res: Response, next: any) => {
        console.error('[HTTP] Error:', error)

        const status = error.status || error.statusCode || 500
        const message = error.message || 'Internal Server Error'

        response.error(res, message, status, {
            method: req.method,
            url: req.originalUrl,
            timestamp: new Date().toISOString(),
            ...(config.isDevelopment && { stack: error.stack }),
        })
    })
}
