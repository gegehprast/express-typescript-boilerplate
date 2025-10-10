import { Express } from 'express'
import { appRoutes } from '../../controllers/app.js'
import { api } from '../../controllers/api.js'
import { websocket } from '../../controllers/websocket.js'

const routes = (app: Express): void => {
    app.use('/', appRoutes)
    app.use('/api', api)
    app.use('/ws', websocket)
}

export default routes
