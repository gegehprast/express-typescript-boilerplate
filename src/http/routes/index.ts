import { RouteHandler } from "../Types"

const handler: RouteHandler = (router) => {
    router.get('/', async (req, res) => {
        res.send('Hello world')
    })
}

export default handler
