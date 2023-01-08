import { RequestHandler } from 'express'

const handler: RequestHandler = async (req, res) => {
    res.send(`Hello world! This is the dynamic route inside subpath. You provide: ${req.params.dynamic}`)
}

export default handler
