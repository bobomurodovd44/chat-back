// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { GroupsService } from './groups.class'

// Main data model schema
export const groupsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.Optional(Type.String()),
    type: Type.Optional(Type.Union([Type.Literal('private'), Type.Literal('group')]))
  },
  { $id: 'Groups', additionalProperties: false }
)
export type Groups = Static<typeof groupsSchema>
export const groupsValidator = getValidator(groupsSchema, dataValidator)
export const groupsResolver = resolve<Groups, HookContext<GroupsService>>({
  _id: async value => value?.toString()
})

export const groupsExternalResolver = resolve<Groups, HookContext<GroupsService>>({
  _id: async value => value?.toString()
})

// Schema for creating new entries
export const groupsDataSchema = Type.Pick(groupsSchema, ['name', 'type'], {
  $id: 'GroupsData'
})
export type GroupsData = Static<typeof groupsDataSchema>
export const groupsDataValidator = getValidator(groupsDataSchema, dataValidator)
export const groupsDataResolver = resolve<Groups, HookContext<GroupsService>>({})

// Schema for updating existing entries
export const groupsPatchSchema = Type.Partial(groupsSchema, {
  $id: 'GroupsPatch'
})
export type GroupsPatch = Static<typeof groupsPatchSchema>
export const groupsPatchValidator = getValidator(groupsPatchSchema, dataValidator)
export const groupsPatchResolver = resolve<Groups, HookContext<GroupsService>>({})

// Schema for allowed query properties
export const groupsQueryProperties = Type.Pick(groupsSchema, ['_id', 'name', 'type'])
export const groupsQuerySchema = Type.Intersect(
  [
    querySyntax(groupsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type GroupsQuery = Static<typeof groupsQuerySchema>
export const groupsQueryValidator = getValidator(groupsQuerySchema, queryValidator)
export const groupsQueryResolver = resolve<GroupsQuery, HookContext<GroupsService>>({})
