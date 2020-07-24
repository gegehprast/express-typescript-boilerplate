import dotenv from 'dotenv'
dotenv.config()
import express from 'express'

const app = express()

app.get('/', (req, res) => {
    res.send('Hello world!')
})

app.listen(process.env.APP_PORT || 3000, () => console.log('Server started!'))
