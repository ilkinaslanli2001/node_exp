const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const {limiter, chatLimiter, otpLimiter} = require('./middlewares/limiter')
const WebSockets = require('./utils/web-sockets')
const requestIp = require('request-ip');
const {Server} = require("socket.io");
const cookieParser = require("cookie-parser");
const errorMiddleware = require('./middlewares/error-middleware')
const cors = require('cors')
const path = require('path')
const app = express()

const corsConfig = {
    origin: true,
    credentials: true,

};
app.use(cors(corsConfig));
app.use(cookieParser())
app.use(requestIp.mw())
app.use(express.json({extended: true}))
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '/admin/build')))
app.use('/api/payment', [limiter], require('./routes/payment.routes'))
app.use('/api/app/auth', [limiter], require('./routes/auth.routes'))
app.use('/api/admin', [limiter], require('./routes/admin.routes'))
app.use('/api/otp', [otpLimiter], require('./routes/otp.routes'))
app.use('/api/app/faq', [limiter], require('./routes/faq.routes'))
app.use('/api/firebase', [limiter], require('./routes/firebase.routes'))
app.use('/api/app/user', [limiter], require('./routes/user.routes'))
app.use('/api/app/ride', [limiter], require('./routes/ride.routes'))
app.use('/api/app/conversation', [limiter], require('./routes/conversation.routes'))
app.use('/api/app/message', [chatLimiter], require('./routes/messages.routes'))
app.use('/api/jwt', [limiter], require('./routes/token.routes'))
app.use('/uploads', [limiter], express.static(__dirname + '/uploads'));
app.use(express.static(path.join(__dirname + '/jobs')))
app.use(errorMiddleware)
app.use(bodyParser.json({limit: '75mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '75mb'}));
// app.use(authMiddleware)
require("dotenv").config()
const PORT = process.env.PORT || 5000


// ToDo do csrf protection
async function start() {
    try {

        await mongoose.connect(process.env.MONGO_URI, {
            useUnifiedTopology: true,
        })

        const server = app.listen(PORT, () => console.log(`App has been started on porе ${PORT}`))
        global.onlineUsers = []
        global.io = new Server(server);
        global.io.on('connection', WebSockets.connection)
    } catch (e) {
        console.log('Server Error', e.message)
        process.exit(1)
    }
}

start()
