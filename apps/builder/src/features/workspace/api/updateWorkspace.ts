import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { workspaceSchema } from '@typebot.io/schemas'
import { z } from 'zod'
import { isAdminWriteWorkspaceForbidden } from '../helpers/isAdminWriteWorkspaceForbidden'

export const updateWorkspace = authenticatedProcedure
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/workspaces/{workspaceId}',
      protect: true,
      summary: 'Update workspace',
      tags: ['Workspace'],
    },
  })
  .input(
    z.object({
      name: z.string().optional(),
      icon: z.string().optional(),
      workspaceId: z.string(),
      twilioId : z.string().optional().nullable(),
      twilioPhoneNumber: z.string().optional().nullable()
    })
  )
  .output(
    z.object({
      workspace: workspaceSchema,
    })
  )
  .mutation(async ({ input: { workspaceId, ...updates }, ctx: { user } }) => {
    await prisma.workspace.updateMany({
      where: { members: { some: { userId: user.id } }, id: workspaceId },
      data: updates,
    })

    const workspace = await prisma.workspace.findFirst({
      where: { members: { some: { userId: user.id } }, id: workspaceId },
      include: { members: true },
    })

    if (!workspace)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })

    if (isAdminWriteWorkspaceForbidden(workspace, user))
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not allowed to update this workspace',
      })

    return {
      workspace,
    }
  })
