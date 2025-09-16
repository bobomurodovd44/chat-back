// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  groupsDataValidator,
  groupsPatchValidator,
  groupsQueryValidator,
  groupsResolver,
  groupsExternalResolver,
  groupsDataResolver,
  groupsPatchResolver,
  groupsQueryResolver
} from './groups.schema'

import type { Application } from '../../declarations'
import { GroupsService, getOptions } from './groups.class'
import { groupsPath, groupsMethods } from './groups.shared'
import { HookContext } from '@feathersjs/feathers'
import { BadRequest, NotFound } from '@feathersjs/errors'

export * from './groups.class'
export * from './groups.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const groups = (app: Application) => {
  // Register our service on the Feathers application
  app.use(groupsPath, new GroupsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: groupsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(groupsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(groupsExternalResolver),
        schemaHooks.resolveResult(groupsResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(groupsQueryValidator), schemaHooks.resolveQuery(groupsQueryResolver)],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(groupsDataValidator),
        schemaHooks.resolveData(groupsDataResolver),
        async (context: HookContext) => {
          const { data, app } = context
          if (!data.type) {
            data.type = 'group'
            context.data = data
          }

          return context
        }
      ],
      patch: [schemaHooks.validateData(groupsPatchValidator), schemaHooks.resolveData(groupsPatchResolver)],
      remove: [
        async (context: HookContext) => {
          const { app, id } = context

          if (!id) {
            throw new BadRequest("Id bo'lishi shart")
          }

          // Guruhni olish
          let chat
          try {
            chat = await context.service.get(id)
          } catch (error) {
            throw new NotFound('Bunaqa Chat Mavjud Emas')
          }

          // Avval unga bog‘langan message’larni o‘chirish
          await app.service('messages').remove(null, {
            query: { chatId: chat._id }
          })

          // Keyin unga bog‘langan member’larni o‘chirish
          await app.service('members').remove(null, {
            query: { chatId: chat._id }
          })

          // Oxirida group’ni o‘zi o‘chiriladi (Feathers default remove bajaradi)

          return context
        }
      ]
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [groupsPath]: GroupsService
  }
}
