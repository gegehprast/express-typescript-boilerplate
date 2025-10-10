import 'dotenv/config'
import App from './App.js'

// Global state
let isShuttingDown = false

const handleError = (error: Error, source: string): void => {
    console.log(`[APP] ${source}:`, error.stack || error.message)

    if (!isShuttingDown) {
        console.log('[APP] Fatal error detected, initiating shutdown...')
        gracefulShutdown(1)
    }
}

const gracefulShutdown = async (exitCode: number = 0): Promise<void> => {
    if (isShuttingDown) {
        console.log('[APP] Shutdown already in progress...')
        return
    }

    isShuttingDown = true
    console.log('[APP] Initiating graceful shutdown...')

    try {
        // Give the application time to finish processing
        const shutdownTimeout = setTimeout(() => {
            console.error('[APP] Graceful shutdown timed out, forcing exit')
            process.exit(1)
        }, 60000) // 60 second timeout

        // Stop the application if it exists
        await App.stop()

        clearTimeout(shutdownTimeout)

        console.log('[APP] Graceful shutdown completed')
        process.exit(exitCode)
    } catch (error) {
        console.error('[APP] Error during graceful shutdown:', error)
        process.exit(1)
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
    const error = reason instanceof Error ? reason : new Error(String(reason))
    handleError(error, 'Unhandled Promise Rejection')
})

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error, origin: string) => {
    handleError(error, `Uncaught Exception (${origin})`)
})

// Handle termination signals for graceful shutdown
const terminationSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT']

terminationSignals.forEach((signal) => {
    process.on(signal, () => {
        console.log(`[APP] Received ${signal}`)
        gracefulShutdown(0)
    })
})

// Handle process warnings
process.on('warning', (warning) => {
    console.warn('[APP] Process Warning:', warning.name, warning.message)
    if (warning.stack) {
        console.warn(warning.stack)
    }
})

// Application startup
async function main(): Promise<void> {
    try {
        console.log('[APP] Starting Express TypeScript Boilerplate...')

        await App.start()

        console.log('[APP] Application is running!')
    } catch (error) {
        handleError(error as Error, 'Application Startup')
    }
}

// Start the application
main().catch((error) => {
    handleError(error, 'Main Function')
})
