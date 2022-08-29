import { Server } from 'http'
import express from 'express'
import initHTTP from './http/http'

class App {
    public httpServer!: Server
    public expressApp!: express.Express

    public start = async () => {
        const { server, app } = await initHTTP()
        this.httpServer = server
        this.expressApp = app
    }

    public stop = async () => {
        //
    }
}

export default new App()
