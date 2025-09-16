// src/app.ts
import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import { koa, rest, bodyParser, errorHandler, parseAuthentication, cors, serveStatic } from '@feathersjs/koa'
import socketio from '@feathersjs/socketio'
import express from 'express' // 👈 Bu joyda import qilinishi kerak
import mount from 'koa-mount'
import convert from 'koa-connect'

import { configurationValidator } from './configuration'
import type { Application } from './declarations'
import { logError } from './hooks/log-error'
import { mongodb } from './mongodb'
import { authentication } from './authentication'
import { services } from './services/index'
import { channels } from './channels'
import multer from 'multer'
import path from 'path'

const app: Application = koa(feathers())

// Load our app configuration (see config/ folder)
app.configure(configuration(configurationValidator))

// Set up Koa middleware
app.use(cors())
app.use(serveStatic(app.get('public')))
app.use(errorHandler())
app.use(parseAuthentication())
app.use(bodyParser())

// Configure services and transports
app.configure(rest())
app.configure(
  socketio({
    cors: {
      origin: app.get('origins')
    }
  })
)
app.configure(mongodb)
app.configure(authentication)
app.configure(services)
app.configure(channels)

app.use(mount('/uploads', serveStatic(path.join(__dirname, '../uploads'))))

// ✅ Express app yaratish
const expressApp = express()

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
const upload = multer({ storage })

// ✅ Upload route
expressApp.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file
  if (!file) return res.status(400).send('No file uploaded')

  res.json({
    fileUrl: `/uploads/${file.filename}`,
    fileName: file.originalname,
    fileSize: file.size,
    fileType: file.mimetype
  })
})

// Feathers Koa app ichiga Expressni ulash
app.use(mount('/express', convert(expressApp)))

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [logError]
  },
  before: {},
  after: {},
  error: {}
})

// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: []
})

export { app }
