import { Router } from 'express'
import os from 'os'
import { response } from '../services/http/response.js'
import app from '../App.js'

const router = Router()

router.get('/', async (req, res) => {
    try {
        response.json(res, {
            message: 'Express TypeScript Boilerplate',
            version: app.getVersion(),
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
            services: app
                .getServiceManager()
                .getAllServices()
                .map((s) => s.name),
            endpoints: {
                health: '/health',
                healthDetailed: '/health/detailed',
                ready: '/ready',
                api: '/api/*',
                websocketTest: '/ws-test',
            },
        })
    } catch (error) {
        response.error(res, 'Failed to get root info', 500, error)
    }
})

router.get('/health', async (req, res) => {
    try {
        const services = app.getServiceManager().getAllServices()
        const serviceDetails = services.map((service) => {
            const isRunning = service.isRunning()
            return {
                name: service.name,
                status: isRunning ? 'healthy' : 'unhealthy',
                running: isRunning,
            }
        })

        const allHealthy = serviceDetails.every((s) => s.running)
        const overallStatus = allHealthy ? 'healthy' : 'degraded'
        const statusCode = allHealthy ? 200 : 503

        const detailedHealth = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            version: app.getVersion(),
            uptime: {
                seconds: process.uptime(),
                human: formatUptime(process.uptime()),
            },
            environment: process.env.NODE_ENV || 'development',
            services: serviceDetails,
            system: {
                memory: {
                    ...process.memoryUsage(),
                    freeMemory: os.freemem(),
                    totalMemory: os.totalmem(),
                },
                cpu: {
                    loadAverage: os.loadavg(),
                    cpuCount: os.cpus().length,
                },
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                hostname: os.hostname(),
            },
        }

        response.json(res, detailedHealth, statusCode)
    } catch (error) {
        response.error(res, 'Detailed health check failed', 503, error)
    }
})

// Helper function to format uptime
function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m ${secs}s`
    } else if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`
    } else {
        return `${secs}s`
    }
}

router.get('/ready', async (req, res) => {
    try {
        const services = app.getServiceManager().getAllServices()
        const allRunning = services.every((service) => service.isRunning())
        
        if (allRunning) {
            response.json(res, { status: 'ready', timestamp: new Date().toISOString() }, 200)
        } else {
            response.json(res, { status: 'not ready', timestamp: new Date().toISOString() }, 503)
        }
    } catch (error) {
        response.json(res, { status: 'not ready', timestamp: new Date().toISOString() }, 503)
    }
})

router.get('/error', async (req, res) => {
    throw new Error('This is a test error from /error endpoint')
})

export const appRoutes: Router = router
