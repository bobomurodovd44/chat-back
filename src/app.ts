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
import fs from 'fs'

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

const uploadsPath = path.resolve(__dirname, '..', 'uploads')

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true })
}

// static qilib ulash
app.use(mount('/uploads', serveStatic(uploadsPath)))
// ✅ Express app yaratish
const expressApp = express()

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'audio/mpeg', // mp3
  'audio/wav', // wav
  'audio/ogg' // ogg
]
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Faqat JPG, PNG, GIF, PDF va audio fayllarga ruxsat beriladi!'))
    }
    cb(null, true)
  },
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 MB max (audio uchun biroz katta)
  }
})

// ✅ Upload route
expressApp.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file
  if (!file) return res.status(400).send('No file uploaded')

  res.status(201).json({
    fileUrl: `http://localhost:3030/uploads/${file.filename}`,
    fileName: file.originalname,
    fileSize: file.size,
    fileType: file.mimetype
  })
})

// Feathers Koa app ichiga Expressni ulash
app.use(mount('/express', convert(expressApp as any)))

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
