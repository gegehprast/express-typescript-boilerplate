import { Router } from 'express'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { response } from '../services/http/response.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const router: Router = Router()

router.get('/test', async (req, res) => {
    try {
        const htmlPath = join(__dirname, '..', 'views', 'ws-test.html')
        const html = readFileSync(htmlPath, 'utf-8')
        
        response.view(res, html)
    } catch (error) {
        response.error(res, 'Failed to load WebSocket test page', 500, error)
    }
})

export const websocket: Router = router
