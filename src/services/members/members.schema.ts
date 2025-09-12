// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { MembersService } from './members.class'

// Main data model schema
export const membersSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    chatId: Type.String(),
    userId: Type.String(),
    role: Type.Optional(Type.Union([Type.Literal('owner'), Type.Literal('member')]))
  },
  { $id: 'Members', additionalProperties: false }
)
export type Members = Static<typeof membersSchema>
export const membersValidator = getValidator(membersSchema, dataValidator)
export const membersResolver = resolve<Members, HookContext<MembersService>>({})

export const membersExternalResolver = resolve<Members, HookContext<MembersService>>({})

// Schema for creating new entries
export const membersDataSchema = Type.Pick(membersSchema, ['chatId', 'userId', 'role'], {
  $id: 'MembersData'
})
export type MembersData = Static<typeof membersDataSchema>
export const membersDataValidator = getValidator(membersDataSchema, dataValidator)
export const membersDataResolver = resolve<Members, HookContext<MembersService>>({})

// Schema for updating existing entries
export const membersPatchSchema = Type.Partial(membersSchema, {
  $id: 'MembersPatch'
})
export type MembersPatch = Static<typeof membersPatchSchema>
export const membersPatchValidator = getValidator(membersPatchSchema, dataValidator)
export const membersPatchResolver = resolve<Members, HookContext<MembersService>>({})

// Schema for allowed query properties
export const membersQueryProperties = Type.Pick(membersSchema, ['_id', 'chatId', 'userId'])
export const membersQuerySchema = Type.Intersect(
  [
    querySyntax(membersQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type MembersQuery = Static<typeof membersQuerySchema>
export const membersQueryValidator = getValidator(membersQuerySchema, queryValidator)
export const membersQueryResolver = resolve<MembersQuery, HookContext<MembersService>>({})
