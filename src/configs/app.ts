import 'dotenv/config'

export interface AppConfig {
    port: number
    host: string
    nodeEnv: string
    isDevelopment: boolean
    isProduction: boolean
}

export const config: AppConfig = {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
    isProduction: (process.env.NODE_ENV || 'development') === 'production',
}

console.log(process.env.PORT, process.env.NODE_ENV)

export default config
