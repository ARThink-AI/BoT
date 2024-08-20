import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { decrypt } from '@typebot.io/lib/api/encryption/decrypt'
import got from 'got'

export const listTicketType = authenticatedProcedure.meta({
  openapi: {
    method: 'GET',
    path: '/trudesk/tickettypes',
    protect: true,
    summary: 'List Ticket Types',
    tags: ['Trudesk'],
  },
})
  .input(
    z.object({
      credentialsId: z.string(),
      workspaceId: z.string(),
    })
  ).output(

    z.object({
      types: z.array(z.object({
        id: z.string(),
        name: z.string(),
        priorities: z.array(z.object({
          id: z.string(),
          name: z.string()
        }))
      })),
      groups: z.array(z.object({
        id: z.string(),
        name: z.string()
      })),
      users: z.array(z.object({
        id: z.string(),
        name: z.string()
      })),
      tags: z.array(z.object({
        id: z.string(),
        name: z.string(),
        normalized: z.string()
      })),
      status: z.array(z.object({
        id: z.string(),
        name: z.string()

      })),
    })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  ).query(async ({ input: { credentialsId, workspaceId }, ctx: { user } }) => {
    try {
      console.log("user", user);
      const credentials = await prisma.credentials.findUnique({
        where: {
          id: credentialsId,
          workspaceId: workspaceId
        },
      });
      if (!credentials)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No credentials found',
        })
      const data = (await decrypt(
        credentials.data,
        credentials.iv
      )) as { userName: string, password: string, baseUrl: string };

      const loginResponse = await got.post(`${data.baseUrl}/api/v1/login`, {
        json: {
          username: data?.userName,
          password: data?.password,

        }
      }).json();
      const loginData = loginResponse as {
        accessToken: string,
        success: boolean
      }

      if (loginData.success && loginData.accessToken) {
        const resData = {};
        const ticketTypesResponse = await got.get(`${data.baseUrl}/api/v1/tickets/types`, {
          headers: {
            accessToken: `${loginData.accessToken}`
          }
        }).json();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resData.types = ticketTypesResponse.map(type => {
          return {
            id: type._id,
            name: type.name,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            priorities: type.priorities.map(p => {
              return {
                id: p._id,
                name: p.name
              }
            })
          }
        })

        const ticketGroupsResponse = await got.get(`${data.baseUrl}/api/v1/groups`, {
          headers: {
            accessToken: `${loginData.accessToken}`
          }
        }).json();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resData.groups = ticketGroupsResponse.groups.map(g => {
          return {
            id: g._id,
            name: g.name
          }
        })




        const ticketUsersAndAssigneesResponse = await got.get(`${data.baseUrl}/api/v1/users/all`, {
          headers: {
            accessToken: `${loginData.accessToken}`
          }
        }).json();

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resData.users = ticketUsersAndAssigneesResponse.filter(assignee => assignee?.role?.isAgent == true).map(usr => {
          return {
            id: usr._id,
            name: usr.fullname
          }
        })

        const ticketTagsResponse = await got.get(`${data.baseUrl}/api/v1/tickets/tags`, {
          headers: {
            accessToken: `${loginData.accessToken}`
          }
        }).json();




        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resData.tags = ticketTagsResponse.tags.map(tag => {
          return {
            id: tag._id,
            name: tag.name,
            normalized: tag.normalized
          }
        })
        const ticketStatusResponse = await got.get(`${data.baseUrl}/api/v1/tickets/status`, {
          headers: {
            accessToken: `${loginData.accessToken}`
          }
        }).json();

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resData.status = ticketStatusResponse.status.map(g => {
          return {
            id: g._id,
            name: g.name
          }
        })

        return resData
      } else {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not login into trudesk',
          cause: "Incorrect credentials",
        })
      }



    } catch (e) {
      console.log("e", e);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not list ticket types',
        cause: e,
      })
    }

  })