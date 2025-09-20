// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { MessageService } from './messages.class'
import type { UserService } from '../users/users.class'
import { userSchema } from '../users/users.schema'

// Main data model schema
export const messageSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    text: Type.Optional(Type.String()),
    senderId: ObjectIdSchema(),
    chatId: ObjectIdSchema(),
    fileUrl: Type.Optional(Type.String()),
    fileType: Type.Optional(Type.String()),
    fileSize: Type.Optional(Type.Number()),
    fileName: Type.Optional(Type.String()),
    senderEmail: Type.Optional(Type.String()),
    senderUserId: Type.Optional(Type.String()),
    senderFullName: Type.Optional(Type.String()),
    createdAt: Type.Number(),
    updatedAt: Type.Number()
  },
  { $id: 'Message', additionalProperties: false }
)
export type Message = Static<typeof messageSchema>
export const messageValidator = getValidator(messageSchema, dataValidator)
export const messageResolver = resolve<Message, HookContext<MessageService>>({})

export const messageExternalResolver = resolve<Message, HookContext<MessageService>>({})

// Schema for creating new entries
export const messageDataSchema = Type.Pick(
  messageSchema,
  ['text', 'senderId', 'chatId', 'fileUrl', 'fileSize', 'fileName', 'fileType'],
  {
    $id: 'MessageData'
  }
)
export type MessageData = Static<typeof messageDataSchema>
export const messageDataValidator = getValidator(messageDataSchema, dataValidator)
export const messageDataResolver = resolve<Message, HookContext<MessageService>>({
  createdAt: async () => Date.now(),
  updatedAt: async () => Date.now()
})

// Schema for updating existing entries
export const messagePatchSchema = Type.Partial(messageSchema, {
  $id: 'MessagePatch'
})
export type MessagePatch = Static<typeof messagePatchSchema>
export const messagePatchValidator = getValidator(messagePatchSchema, dataValidator)
export const messagePatchResolver = resolve<Message, HookContext<MessageService>>({
  updatedAt: async () => Date.now()
})

// Schema for allowed query properties
export const messageQueryProperties = Type.Pick(messageSchema, [
  '_id',
  'text',
  'senderId',
  'chatId',
  'createdAt',
  'updatedAt'
])
export const messageQuerySchema = Type.Intersect(
  [
    querySyntax(messageQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type MessageQuery = Static<typeof messageQuerySchema>
export const messageQueryValidator = getValidator(messageQuerySchema, queryValidator)
export const messageQueryResolver = resolve<MessageQuery, HookContext<MessageService>>({})
