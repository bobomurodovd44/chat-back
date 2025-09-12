// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Groups, GroupsData, GroupsPatch, GroupsQuery, GroupsService } from './groups.class'

export type { Groups, GroupsData, GroupsPatch, GroupsQuery }

export type GroupsClientService = Pick<GroupsService<Params<GroupsQuery>>, (typeof groupsMethods)[number]>

export const groupsPath = 'groups'

export const groupsMethods: Array<keyof GroupsService> = ['find', 'get', 'create', 'patch', 'remove']

export const groupsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(groupsPath, connection.service(groupsPath), {
    methods: groupsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [groupsPath]: GroupsClientService
  }
}
