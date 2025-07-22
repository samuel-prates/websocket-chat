const cluster = require('cluster');
const os = require('os');
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');

// Casos de Uso
const UserUseCases = require('./application/usecases/UserUseCases');
const MessageUseCases = require('./application/usecases/MessageUseCases');

// Adaptadores de Persistência (MongoDB)
const MongooseUserRepository = require('./infrastructure/adapters/persistence/mongodb/repositories/MongooseUserRepository');
const MongooseMessageRepository = require('./infrastructure/adapters/persistence/mongodb/repositories/MongooseMessageRepository');

// Adaptadores de Autenticação
const AuthAdapter = require('./infrastructure/adapters/auth/AuthAdapter');
const PassportConfig = require('./infrastructure/adapters/auth/passport/PassportConfig');

// Adaptador de Tempo Real
const SocketIOAdapter = require('./infrastructure/adapters/realtime/SocketIOAdapter');

// Rotas HTTP
const usersRoutes = require('./infrastructure/adapters/http/routes/users');
const messagesRoutes = require('./infrastructure/adapters/http/routes/messages');

const numCPUs = os.cpus().length;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    pingTimeout: 30000,
    pingInterval: 10000,
    transports: ['websocket', 'polling'],
    connectTimeout: 10000,
    maxHttpBufferSize: 1e8,
    allowEIO3: true,
    // Improved reconnection settings
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5
});

// Setup for both test and non-test environments
let pubClient, subClient;
let authAdapter, mongooseUserRepository, mongooseMessageRepository, socketIOAdapter;
let userUseCases, messageUseCases;

// Setup for test environment
if (process.env.NODE_ENV === 'test') {
    // Mock Redis clients for testing
    pubClient = { 
        connect: () => Promise.resolve(true), 
        duplicate: () => ({ connect: () => Promise.resolve(true), on: () => {} }), 
        on: () => {}, 
        isReady: true, 
        set: () => Promise.resolve(), 
        del: () => Promise.resolve() 
    };
    subClient = { connect: () => Promise.resolve(true), on: () => {} };

    // Setup MongoDB connection (using in-memory server in tests)
    if (process.env.MONGO_URI) {
        mongoose.connect(process.env.MONGO_URI)
            .catch(err => console.error('MongoDB connection error:', err));
    }

    // Instantiate adapters and repositories
    authAdapter = new AuthAdapter();
    mongooseUserRepository = new MongooseUserRepository();
    mongooseMessageRepository = new MongooseMessageRepository();
    socketIOAdapter = new SocketIOAdapter(io);

    // Instantiate use cases
    userUseCases = new UserUseCases(mongooseUserRepository, authAdapter);
    messageUseCases = new MessageUseCases(mongooseMessageRepository, socketIOAdapter);

    // Configure Express app
    app.use(cors());
    app.use(express.json());

    app.use(
        session({
            secret: 'secret',
            resave: true,
            saveUninitialized: true
        })
    );

    // Configure Passport.js
    PassportConfig(passport);
    app.use(passport.initialize());
    app.use(passport.session());

    // In test environment, don't set up routes here as they're mocked in the tests
    // The routes will be set up by the tests themselves

    // Configure Socket.IO
    io.on('connection', socket => {
        const clientId = socket.id;
        
        // Handle chat messages with error handling and acknowledgment
        socket.on('chat message', async (msg, callback) => {
            try {
                await messageUseCases.sendMessage(msg.from, msg.to, msg.message);
                
                // Send acknowledgment if callback is provided
                if (typeof callback === 'function') {
                    callback({ status: 'success', timestamp: new Date().toISOString() });
                }
            } catch (error) {
                console.error('Error sending message:', error);
                
                // Send error if callback is provided
                if (typeof callback === 'function') {
                    callback({ status: 'error', message: 'Failed to send message' });
                } else {
                    // Otherwise emit error event
                    socket.emit('error', { message: 'Failed to send message' });
                }
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${clientId}`);
        });
    });
}

// Export configured objects
module.exports = { app, server, io };

// Production environment setup
if (process.env.NODE_ENV !== 'test') {
    if (cluster.isMaster) {
        console.log(`Master ${process.pid} is running`);

        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
            cluster.fork(); // Garante que um novo worker seja iniciado se um morrer
        });
    } else {
        // Conexão com Redis para Socket.IO Adapter com estratégia de reconexão aprimorada
        const pubClient = createClient({
            url: "redis://redis:6379",
            socket: {
                reconnectStrategy: (retries) => {
                    // Exponential backoff with max delay of 10 seconds
                    const delay = Math.min(Math.pow(2, retries) * 100, 10000);
                    console.log(`Redis reconnecting in ${delay}ms (attempt ${retries})`);
                    return delay;
                },
                connectTimeout: 10000,
                keepAlive: 5000
            },
            // Automatically reconnect indefinitely
            autoReconnect: true,
            maxRetriesPerRequest: 3
        });

        const subClient = pubClient.duplicate();

        // Function to setup Redis adapter
        const setupRedisAdapter = async () => {
            try {
                await Promise.all([
                    pubClient.connect().catch(err => {
                        console.error("Redis pub client connection error:", err);
                        throw err;
                    }),
                    subClient.connect().catch(err => {
                        console.error("Redis sub client connection error:", err);
                        throw err;
                    })
                ]);

                io.adapter(createAdapter(pubClient, subClient));
                console.log("Redis adapter connected for Socket.IO");

                return true;
            } catch (err) {
                console.error("Redis connection error:", err);
                console.log("Using in-memory adapter as fallback");
                return false;
            }
        };

        // Initial setup
        setupRedisAdapter();

        // Monitor Redis events for both clients
        pubClient.on('error', (err) => {
            console.error('Redis pub client error:', err);
        });

        pubClient.on('reconnecting', () => {
            console.log('Redis pub client reconnecting...');
        });

        pubClient.on('ready', () => {
            console.log('Redis pub client ready');
        });

        subClient.on('error', (err) => {
            console.error('Redis sub client error:', err);
        });

        subClient.on('reconnecting', () => {
            console.log('Redis sub client reconnecting...');
        });

        subClient.on('ready', () => {
            console.log('Redis sub client ready');
        });

        // Conexão com MongoDB
        const db = require('./config/database').mongoURI;
        mongoose.connect(db)
            .then(() => console.log('MongoDB Connected'))
            .catch(err => console.log(err));

        // Instanciar Adaptadores e Repositórios
        const authAdapter = new AuthAdapter();
        const mongooseUserRepository = new MongooseUserRepository();
        const mongooseMessageRepository = new MongooseMessageRepository();
        const socketIOAdapter = new SocketIOAdapter(io);

        // Instanciar Casos de Uso
        const userUseCases = new UserUseCases(mongooseUserRepository, authAdapter);
        const messageUseCases = new MessageUseCases(mongooseMessageRepository, socketIOAdapter);

        app.use(cors());
        app.use(express.json());

        app.use(
            session({
                secret: 'secret',
                resave: true,
                saveUninitialized: true
            })
        );

        // Configurar Passport.js
        PassportConfig(passport);
        app.use(passport.initialize());
        app.use(passport.session());

        // Injetar casos de uso nas rotas
        app.use('/api/users', usersRoutes(userUseCases));
        app.use('/api/messages', messagesRoutes(messageUseCases));

        const PORT = process.env.PORT || 5000;

        // Improved socket.io event handling with error handling and reconnection support
        io.on('connection', socket => {
            const clientId = socket.id;
            console.log(`New client connected: ${clientId}, Worker: ${process.pid}`);

            // Store socket info in Redis for cross-worker access
            if (pubClient.isReady) {
                pubClient.set(`socket:${clientId}`, JSON.stringify({
                    connected: true,
                    workerId: process.pid,
                    connectedAt: new Date().toISOString()
                })).catch(err => console.error('Error storing socket info:', err));
            }

            // Handle user online status with error handling
            socket.on('user online', async (userId) => {
                try {
                    await userUseCases.updateUserOnlineStatus(userId, true);
                    // Associate userId with socket.id for easier tracking
                    if (pubClient.isReady) {
                        await pubClient.set(`user:${userId}:socket`, clientId);
                    }
                    console.log(`User ${userId} is online (socket: ${clientId})`);
                } catch (error) {
                    console.error(`Error setting user ${userId} online:`, error);
                    // Notify client of the error
                    socket.emit('error', { message: 'Failed to update online status' });
                }
            });

            // Handle user offline status with error handling
            socket.on('user offline', async (userId) => {
                try {
                    await userUseCases.updateUserOnlineStatus(userId, false);
                    // Remove userId to socket.id association
                    if (pubClient.isReady) {
                        await pubClient.del(`user:${userId}:socket`);
                    }
                    console.log(`User ${userId} is offline (socket: ${clientId})`);
                } catch (error) {
                    console.error(`Error setting user ${userId} offline:`, error);
                    // Notify client of the error
                    socket.emit('error', { message: 'Failed to update offline status' });
                }
            });

            // Handle chat messages with error handling and acknowledgment
            socket.on('chat message', async (msg, callback) => {
                try {
                    // O sendMessage já emite a mensagem via realtimeService
                    await messageUseCases.sendMessage(msg.from, msg.to, msg.message);

                    // Send acknowledgment if callback is provided
                    if (typeof callback === 'function') {
                        callback({ status: 'success', timestamp: new Date().toISOString() });
                    }
                } catch (error) {
                    console.error('Error sending message:', error);

                    // Send error if callback is provided
                    if (typeof callback === 'function') {
                        callback({ status: 'error', message: 'Failed to send message' });
                    } else {
                        // Otherwise emit error event
                        socket.emit('error', { message: 'Failed to send message' });
                    }
                }
            });

            // Handle ping to keep connection alive
            socket.on('ping', (callback) => {
                if (typeof callback === 'function') {
                    callback({ status: 'success', timestamp: new Date().toISOString() });
                }
            });

            // Handle reconnection events
            socket.on('reconnect_attempt', (attemptNumber) => {
                console.log(`Client ${clientId} reconnection attempt #${attemptNumber}`);
            });

            socket.on('reconnect', (attemptNumber) => {
                console.log(`Client ${clientId} reconnected after ${attemptNumber} attempts`);
            });

            // Handle disconnection with cleanup
            socket.on('disconnect', (reason) => {
                console.log(`Client disconnected: ${clientId}, Reason: ${reason}, Worker: ${process.pid}`);

                // Clean up Redis data
                if (pubClient.isReady) {
                    pubClient.del(`socket:${clientId}`).catch(err =>
                        console.error('Error cleaning up socket info:', err)
                    );
                }
            });

            // Handle errors
            socket.on('error', (error) => {
                console.error(`Socket error for client ${clientId}:`, error);
            });
        });

        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

        console.log(`Worker ${process.pid} started`);
    }
}