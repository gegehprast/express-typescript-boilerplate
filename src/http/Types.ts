import express from 'express'

export type RouteHandler = (router: express.Router) => void
