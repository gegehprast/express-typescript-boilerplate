import path from 'path'
import express, { RequestHandler } from 'express'
import getAllFiles from '../lib/getAllFiles'

interface PathObject {
    path: string
    handler: RequestHandler
    segLn: number
    isDynamic: boolean
}

const ROUTER = express.Router()
const ROUTE_PATH = './routes'
const ROUTE_DIR = path.join(__dirname, ROUTE_PATH)

const routes = async () => {
    const files = getAllFiles(ROUTE_DIR).filter((file) => file.endsWith('.js') || file.endsWith('.ts'))
    const correctPaths: PathObject[] = []

    for (const file of files) {
        const handler = (await import(file)).default as RequestHandler
        const path = file.replace(ROUTE_DIR, '').replaceAll('\\', '/').replace('.ts', '').replace('.js', '')
        const segments = path.split('/')
        let isDynamic = false

        segments.forEach((segment, index) => {
            if (segment.startsWith('[') && segment.endsWith(']')) {
                isDynamic = true
                segments[index] = `:${segment.replace('[', '').replace(']', '')}`
            }
        })

        if (segments[segments.length - 1] === 'index') {
            segments.pop()
        }

        correctPaths.push({
            path: segments.join('/'),
            handler: handler,
            segLn: segments.length,
            isDynamic: isDynamic,
        })
    }

    correctPaths.sort((a, b) => {
        if (a.segLn < b.segLn) {
            return -1
        }

        if (a.segLn > b.segLn) {
            return 1
        }

        if (a.isDynamic && !b.isDynamic) {
            return 1
        }

        if (!a.isDynamic && b.isDynamic) {
            return -1
        }

        return 0
    })

    correctPaths.forEach((correctPath) => {
        ROUTER.get(correctPath.path, correctPath.handler)
        ROUTER.post(correctPath.path, correctPath.handler)
        ROUTER.put(correctPath.path, correctPath.handler)
        ROUTER.delete(correctPath.path, correctPath.handler)
    })

    return ROUTER
}

export default routes
