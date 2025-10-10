import { json, Router } from 'express'
import { response } from '../services/http/response.js'
import app from '../App.js'

const router: Router = Router()

router.get('/status', async (req, res) => {
    try {
        response.json(res, {
            status: 'ok',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            memory: process.memoryUsage(),
            version: process.version,
        })
    } catch (error) {
        response.error(res, 'Failed to get status', 500, error)
    }
})

router.get('/info', async (req, res) => {
    try {
        response.json(res, {
            name: 'Express TypeScript Boilerplate',
            version: app.getVersion(),
            description: 'A service-based Express TypeScript application',
            features: [
                'Service-based architecture',
                'Express HTTP server',
                'TypeScript support',
                'Graceful shutdown',
                'Error handling',
                'Extensible for additional services',
            ],
            endpoints: {
                health: '/health',
                root: '/',
                api: {
                    status: '/api/status',
                    info: '/api/info',
                },
            },
        })
    } catch (error) {
        response.error(res, 'Failed to get info', 500, error)
    }
})

export const api: Router = router
