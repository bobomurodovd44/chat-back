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
        text: Type.String(),
        userId: ObjectIdSchema(),
        createdAt: Type.Number(),
        updatedAt: Type.Number()
    },
    { $id: 'Message', additionalProperties: false }
)
export type Message = Static<typeof messageSchema>
export const messageValidator = getValidator(messageSchema, dataValidator)
export const messageResolver = resolve<Message, HookContext<MessageService>>({})

// External schema that includes the populated user
export const messageExternalSchema = Type.Intersect([
    messageSchema,
    Type.Object({
        user: Type.Optional(userSchema)
    })
], { $id: 'MessageExternal' })
export type MessageExternal = Static<typeof messageExternalSchema>

export const messageExternalResolver = resolve<MessageExternal, HookContext<MessageService>>({
    // Populate user information
    user: async (value, message, context) => {
        if (message.userId) {
            try {
                const userService = context.app.service('users') as UserService
                return await userService.get(message.userId as string)
            } catch (error) {
                console.error('Error populating user for message:', error)
                return undefined
            }
        }
        return undefined
    }
})

// Schema for creating new entries
export const messageDataSchema = Type.Pick(messageSchema, ['text'], {
    $id: 'MessageData'
})
export type MessageData = Static<typeof messageDataSchema>
export const messageDataValidator = getValidator(messageDataSchema, dataValidator)
export const messageDataResolver = resolve<Message, HookContext<MessageService>>({
    createdAt: async () => Date.now(),
    updatedAt: async () => Date.now(),
    userId: async (value, user, context) => {
        if (context.params.user) {
            return context.params.user._id
        }

        return value
    }
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
export const messageQueryProperties = Type.Pick(messageSchema, ['_id', 'text', 'userId', 'createdAt', 'updatedAt'])
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
