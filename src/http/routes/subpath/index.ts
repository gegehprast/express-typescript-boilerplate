import { RequestHandler } from 'express'

const handler: RequestHandler = async (req, res) => {
    res.send('Hello world! This is the INDEX route inside subpath.')
}

export default handler
