# Express TypeScript Boilerplate

A simple service-based Express TypeScript application.

## Features

- 🏗️ **Service-based architecture** - Easy to extend with new services
- 🔌 **WebSocket support** - Real-time communication with Socket.IO
- 📝 **TypeScript** - Type safety first
- ⚙️ **Error handling** - Built-in error handling
- 🔄 **Graceful shutdown** - Proper service lifecycle management
- 📊 **Health checks** - Built-in monitoring endpoints

## Getting Started

### Development

```bash
pnpm run dev
```

### Build

```bash
pnpm run build
```

### Production

```bash
pnpm start
```

## Project Structure

```
src/
├── main.ts                 # Entry point
├── App.ts                  # Main application
├── configs/                # Configurations
│   └── app.ts
├── controllers/            # Route controllers
│   ├── app.ts
│   ├── api.ts
│   └── websocket.ts
├── core/                   # Core stuff
│   └── ServiceManager.ts
├── services/               # Service implementations
│   ├── http/               # HTTP service
│   └── websocket/          # WebSocket service
└── types/                  # Type definitions
    └── service.ts
└── views/                  # HTML templates
    └── ws-test.html        # WebSocket test interface
```

## Endpoints

- `GET /` - Application info
- `GET /ready` - Readiness check
- `GET /health` - Health check
- `GET /error` - Test error handling
- `GET /api/status` - System status
- `GET /api/info` - Application information
- `GET /ws/test` - WebSocket test page

## WebSocket

The application includes Socket.IO for real-time communication. Visit `/ws/test` to try it out.

## Adding Services

To add a new service, implement the `IService` interface and register it in `app.ts`:

```typescript
class MyService implements IService {
    public readonly name = 'my-service'

    async start(): Promise<void> {
        /* ... */
    }
    async stop(): Promise<void> {
        /* ... */
    }
    isRunning(): boolean {
        /* ... */
    }
}

// Register in app.ts
this.serviceManager.registerService(new MyService())
```

The service will automatically start/stop with the application.
