import { RequestHandler } from 'express'

const handler: RequestHandler = async (req, res) => {
    res.send('Hello world! This is the HELLO route.')
}

export default handler
