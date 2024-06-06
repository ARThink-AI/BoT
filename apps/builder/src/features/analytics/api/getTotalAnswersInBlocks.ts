import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { PublicTypebot } from '@typebot.io/schemas'
import { z } from 'zod'
import { canReadTypebots } from '@/helpers/databaseRules'
import {
  totalAnswersInBlock,
  totalContentInBlock,
  totalRatingInput,
  totalTextInput,
} from '@typebot.io/schemas/features/analytics'
import { id } from 'date-fns/locale'

export const getTotalAnswersInBlocks = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots/{typebotId}/analytics/totalAnswersInBlocks',
      protect: true,
      summary: 'List total answers in blocks',
      tags: ['Analytics'],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
    })
  )
  .output(
    z.object({
      totalAnswersInBlocks: z.array(totalAnswersInBlock),
      // totalContentInBlock: z.array(totalContentInBlock),
      // totalTextInput: z.array(totalTextInput),
      // totalRatingInput: z.array(totalRatingInput),
    })
  )
  .query(async ({ input: { typebotId }, ctx: { user } }) => {
    const typebot = await prisma.typebot.findFirst({
      where: canReadTypebots(typebotId, user),
      select: { publishedTypebot: true },
    })
    if (!typebot?.publishedTypebot)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Published typebot not found',
      })

    const publishedTypebot = typebot.publishedTypebot as PublicTypebot

    const totalAnswersPerBlock = await prisma.answer.groupBy({
      by: ['itemId', 'blockId'],
      where: {
        result: {
          typebotId: typebot.publishedTypebot.typebotId,
        },
        blockId: {
          in: publishedTypebot.groups.flatMap((group) =>
            group.blocks.map((block) => block.id)
          ),
        },
      },

      _count: { _all: true },
    })

    //   const groups = publishedTypebot.groups

    //   const fetchAnswers = async () => {
    //     const answers = await prisma.answer.findMany()
    //     return answers
    //   }

    //   const processGroups = (groups) => {
    //     return groups.map((group) => {
    //       return {
    //         id: group.id,
    //         title: group.title,
    //         blocks: group.blocks.map((block) => {
    //           if (block.type === 'choice input') {
    //             return {
    //               id: block.id,
    //               groupId: block.groupId,
    //               type: block.type,
    //               options: block.items.map((item) => ({
    //                 id: item.id,
    //                 content: item.content,
    //                 count: 0, // Initialize the count
    //               })),
    //               variableId: block.options.variableId,
    //             }
    //           } else {
    //             return {
    //               id: block.id,
    //               groupId: block.groupId,
    //               type: block.type,
    //               content: block.content,
    //             }
    //           }
    //         }),
    //       }
    //     })
    //   }

    //   const groupBy = (array, key) => {
    //     return array.reduce((result, currentValue) => {
    //       ;(result[currentValue[key]] = result[currentValue[key]] || []).push(
    //         currentValue
    //       )
    //       return result
    //     }, {})
    //   }

    //   const countOptions = (block, answers) => {
    //     const counts = {}
    //     block.options.forEach((option) => {
    //       counts[option.id] = 0
    //     })

    //     answers.forEach((answer) => {
    //       if (answer.blockId && counts.hasOwnProperty(answer.blockId)) {
    //         counts[answer.blockId]++
    //       }
    //     })

    //     return block.options.map((option) => ({
    //       ...option,
    //       count: counts[option.id],
    //     }))
    //   }

    //   const correlateAnswersWithGroups = (groups, answers) => {
    //     return groups.map((group) => {
    //       return {
    //         ...group,
    //         blocks: group.blocks.map((block) => {
    //           const blockAnswers = answers[block.id] || []
    //           if (block.type === 'choice input') {
    //             return {
    //               ...block,
    //               options: countOptions(block, blockAnswers),
    //               // answers: blockAnswers,
    //               answerCount: blockAnswers.length,
    //             }
    //           } else {
    //             return {
    //               ...block,
    //               answers: blockAnswers,
    //               answerCount: blockAnswers.length,
    //             }
    //           }
    //         }),
    //       }
    //     })
    //   }

    //   const main = async () => {
    //     const answers = await fetchAnswers()
    //     const groupedAnswers = groupBy(answers, 'blockId')
    //     const processedGroups = processGroups(groups)
    //     const finalResult = correlateAnswersWithGroups(
    //       processedGroups,
    //       groupedAnswers
    //     )

    //     console.log(JSON.stringify(finalResult, null, 2))
    //   }
    //  console.log("test", main() )

    const groups = typebot.publishedTypebot.groups
    const edges = typebot.publishedTypebot.edges

    // const analytic = () => {
    //   publishedTypebot.groups.map((group) => {
    //     edge.map((id) => {
    //       if (id.groupId == group.id) {
    //         const data = {
    //           groupId: group.id,
    //           title: group.title,
    //           coordinates: group.graphCoordinates,
    //           inputs: group.blocks.map((block) => {
    //             const inputEntry = {
    //               blockId: block.id,
    //               type: block.type,
    //               content: block.content || {},
    //               options: block.options || {},
    //               total: {},
    //             }

    //             // Find the matching answer count
    //             const matchedCount = totalAnswersPerBlock.find(
    //               (count) => count.blockId === block.id
    //             )
    //             if (matchedCount) {
    //               inputEntry.total = matchedCount._count._all
    //             }

    //             return inputEntry
    //           }),
    //         }

    //         return  data
    //       }
    //     })
    //   })
    // }

    // for rating answer and total
    const totalAnswersPerInputRating = await prisma.answer.groupBy({
      by: ['blockId', 'content'], // Group by blockId and content
      where: {
        result: {
          typebotId: typebot.publishedTypebot.typebotId,
        },
        blockId: {
          in: publishedTypebot.groups.flatMap((group) =>
            group.blocks
              .filter((block) => block.type === 'rating input')
              .map((block) => block.id)
          ),
        },
      },
      _count: {
        _all: true,
        // Count the number of answers
      },
    })

    // for input choice answer and total
    const totalAnswersPerContent = await prisma.answer.groupBy({
      by: ['blockId', 'content'],
      where: {
        content: {
          notIn: ['Hi!'],
        },
        result: {
          typebotId: typebot.publishedTypebot.typebotId,
        },
        blockId: {
          in: publishedTypebot.groups.flatMap((group) =>
            group.blocks
              .filter((block) => block.type === 'choice input')
              .map((block) => block.id)
          ),
        },
      },
      _count: {
        _all: true,
        // Count the number of answers
      },
    })

    const graphs = publishedTypebot.groups.map((group) => ({
      groupId: group.id,
      title: group.title,
      coordinates: group.graphCoordinates,
      inputs: group.blocks.map((block) => {
        const inputEntry = {
          blockId: block.id,
          type: block.type,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          content: block.content || {},
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          items: block.items || {},
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          options: block.options || {},
          total: [],
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        function getInputRatingTotalCounts(totalAnswersPerInputRating) {
          const blockIdTotals = {}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          totalAnswersPerInputRating.forEach((item) => {
            const contents = item.content
              .split(',')
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              .map((content) => content.trim())
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (!blockIdTotals[item.blockId]) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              blockIdTotals[item.blockId] = {}
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            contents.forEach((content) => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              if (!blockIdTotals[item.blockId][content]) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                blockIdTotals[item.blockId][content] = 0
              }
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              blockIdTotals[item.blockId][content] += item._count._all
            })
          })

          const totalRatingInput = Object.keys(blockIdTotals).flatMap(
            (blockId) =>
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore

              Object.keys(blockIdTotals[blockId]).map((content) => ({
                blockId,
                rating: content,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                total: blockIdTotals[blockId][content],
              }))
          )

          return totalRatingInput
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore

        if (block.type === 'rating input') {
          const blockTotal = getInputRatingTotalCounts(
            totalAnswersPerInputRating
          )
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // inputEntry.total.push(blockTotal)
          // console.log('called', blockTotal)
          const data = blockTotal
            .map((block) => {
              if (block.blockId == inputEntry.blockId) {
                return {
                  blockId: inputEntry.blockId,
                  rating: block.rating,
                  total: block.total,
                }
              }
            })
            .filter((item) => item !== undefined)

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore

          inputEntry.total.push(data)
          // console.log('test dataaaa', inputEntry.total)
        }
        const multipleSelect = totalAnswersPerContent
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        function getTotalCounts(multipleSelect) {
          const contentTotals = {}

          if (multipleSelect) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            multipleSelect.forEach((item) => {
              const blockId = item.blockId
              const contents = item.content
                .split(',')
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                .map((content) => content.trim())

              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              contents.forEach((content) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (!contentTotals[content]) {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  contentTotals[content] = {}
                }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (!contentTotals[content][blockId]) {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  contentTotals[content][blockId] = 0
                }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                contentTotals[content][blockId] += item._count._all
              })
            })
          }

          // Convert object to array of objects with content, blockId, and total
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const totalCountsArray = []

          Object.keys(contentTotals).forEach((content) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            Object.keys(contentTotals[content]).forEach((blockId) => {
              totalCountsArray.push({
                content: content,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                blockId: blockId,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                total: contentTotals[content][blockId],
              })
            })
          })
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return totalCountsArray
        }

        if (block.type === 'choice input') {
          const dataMultipleSelectWise = getTotalCounts(multipleSelect)

          const inputChoice = dataMultipleSelectWise
            .map((block) => {
              if (block.blockId == inputEntry.blockId) {
                return {
                  blockId: inputEntry.blockId,
                  content: block.content,
                  total: block.total,
                }
              }
            })
            .filter((item) => item !== undefined)
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          inputEntry.total.push(inputChoice)
        }

        // Find the matching answer count
        const matchedCount = totalAnswersPerBlock.find(
          (count) => count.blockId === block.id
        )

        // if (matchedCount) {
        //   inputEntry.total = matchedCount._count._all
        // }

        return inputEntry
      }),
    }))

    const getGroupSequence = (edges, targetGroupId) => {
      const sequence = []
      const visited = new Set()
      const groupEdgesMap = {}

      // Create a map of edges for quick lookup
      edges.forEach((edge) => {
        if (!groupEdgesMap[edge.to.groupId]) {
          groupEdgesMap[edge.to.groupId] = []
        }
        groupEdgesMap[edge.to.groupId].push(edge.from.groupId)
      })

      const traverse = (currentGroupId) => {
        if (visited.has(currentGroupId)) return
        visited.add(currentGroupId)

        const incomingEdges = groupEdgesMap[currentGroupId] || []
        incomingEdges.forEach((groupId) => traverse(groupId))

        sequence.push(currentGroupId)
      }

      // Start traversal from each group that has incoming edges
      Object.keys(groupEdgesMap).forEach(traverse)

      return sequence // Reverse to get the correct order
    }

    const orderedGroupIds = getGroupSequence(edges)

    const orderedGroups = orderedGroupIds
      .map((groupId) => {
        const group = publishedTypebot.groups.find((g) => g.id === groupId)
        return group
          ? {
              groupId: group.id,
              title: group.title,
              coordinates: group.graphCoordinates,
              inputs: group.blocks.map((block) => {
                const inputEntry = {
                  blockId: block.id,
                  type: block.type,
                  content: block.content || {},
                  items: block.items || {},
                  options: block.options || {},
                  total: [],
                }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                function getInputRatingTotalCounts(totalAnswersPerInputRating) {
                  const blockIdTotals = {}
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  totalAnswersPerInputRating.forEach((item) => {
                    const contents = item.content
                      .split(',')
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      .map((content) => content.trim())
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    if (!blockIdTotals[item.blockId]) {
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      blockIdTotals[item.blockId] = {}
                    }
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    contents.forEach((content) => {
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      if (!blockIdTotals[item.blockId][content]) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        blockIdTotals[item.blockId][content] = 0
                      }
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      blockIdTotals[item.blockId][content] += item._count._all
                    })
                  })

                  const totalRatingInput = Object.keys(blockIdTotals).flatMap(
                    (blockId) =>
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore

                      Object.keys(blockIdTotals[blockId]).map((content) => ({
                        blockId,
                        rating: content,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        total: blockIdTotals[blockId][content],
                      }))
                  )

                  return totalRatingInput
                }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore

                if (block.type === 'rating input') {
                  const blockTotal = getInputRatingTotalCounts(
                    totalAnswersPerInputRating
                  )
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  // inputEntry.total.push(blockTotal)
                  // console.log('called', blockTotal)
                  const data = blockTotal
                    .map((block) => {
                      if (block.blockId == inputEntry.blockId) {
                        return {
                          blockId: inputEntry.blockId,
                          rating: block.rating,
                          total: block.total,
                        }
                      }
                    })
                    .filter((item) => item !== undefined)

                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore

                  inputEntry.total.push(data)
                  // console.log('test dataaaa', inputEntry.total)
                }
                const multipleSelect = totalAnswersPerContent
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                function getTotalCounts(multipleSelect) {
                  const contentTotals = {}

                  if (multipleSelect) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    multipleSelect.forEach((item) => {
                      const blockId = item.blockId
                      const contents = item.content
                        .split(',')
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        .map((content) => content.trim())

                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      contents.forEach((content) => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        if (!contentTotals[content]) {
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-ignore
                          contentTotals[content] = {}
                        }
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        if (!contentTotals[content][blockId]) {
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-ignore
                          contentTotals[content][blockId] = 0
                        }
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        contentTotals[content][blockId] += item._count._all
                      })
                    })
                  }

                  // Convert object to array of objects with content, blockId, and total
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  const totalCountsArray = []

                  Object.keys(contentTotals).forEach((content) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    Object.keys(contentTotals[content]).forEach((blockId) => {
                      totalCountsArray.push({
                        content: content,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        blockId: blockId,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        total: contentTotals[content][blockId],
                      })
                    })
                  })
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  return totalCountsArray
                }

                if (block.type === 'choice input') {
                  const dataMultipleSelectWise = getTotalCounts(multipleSelect)

                  const inputChoice = dataMultipleSelectWise
                    .map((block) => {
                      if (block.blockId == inputEntry.blockId) {
                        return {
                          blockId: inputEntry.blockId,
                          content: block.content,
                          total: block.total,
                        }
                      }
                    })
                    .filter((item) => item !== undefined)
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  inputEntry.total.push(inputChoice)
                }

                // Find the matching answer count
                const matchedCount = totalAnswersPerBlock.find(
                  (count) => count.blockId === block.id
                )

                // Functions for processing input types (rating input, choice input) omitted for brevity

                return inputEntry
              }),
            }
          : null
      })
      .filter((group) => group !== null)

    console.log('groups', JSON.stringify(orderedGroups))

    // const inputs = graphs.map((input) => input.inputs)
    // const content = inputs.map((content) => content)

    // console.log('content', JSON.stringify(content))

    // console.log('groupss', JSON.stringify(graphs))

    // const input = graphs.map((inp) => inp.inputs.map((get) => get.total))
    // // const total = input.total.map((total)=>total)
    // console.log('inp', inputs)
    // console.log('group', groups)
    // console.log('inputs', inputs)
    //

    // const totalAnswersPerContent = await prisma.answer.groupBy({
    //   by: ['blockId', 'content'],
    //   where: {
    //     content: {
    //       notIn: ['Hi!'],
    //     },
    //     result: {
    //       typebotId: typebot.publishedTypebot.typebotId,
    //     },
    //     blockId: {
    //       in: publishedTypebot.groups.flatMap((group) =>
    //         group.blocks
    //           .filter((block) => block.type === 'choice input')
    //           .map((block) => block.id)
    //       ),
    //     },
    //   },
    //   _count: {
    //     _all: true,
    //     // Count the number of answers
    //   },
    // })

    // const aggregations = await prisma.answer.aggregate({
    //   where: {
    //     result: {
    //       typebotId: typebot.publishedTypebot.typebotId,
    //     },
    //     blockId: {
    //       in: publishedTypebot.groups.flatMap((group) =>
    //         group.blocks
    //           .filter((block) => block.type === 'choice input')
    //           .map((block) => block.id)
    //       ),
    //     },
    //   },
    //   _count: {
    //     _all: true,
    //   },
    // })
    // console.log('count aggregations', totalAnswersPerContent)

    // console.log('answer content', totalAnswersPerContent)

    // function getTotalCounts(data) {
    //   const contentTotals = {}

    //   data.forEach((item) => {
    //     const contents = item.content
    //       .split(',')
    //       .map((content) => content.trim())

    //     contents.forEach((content) => {
    //       if (!contentTotals[content]) {
    //         contentTotals[content] = 0
    //       }
    //       contentTotals[content] += item._count._all
    //     })
    //   })

    //   return contentTotals
    // }

    // // Get the total counts for each unique content type
    // const totalCounts = getTotalCounts(totalAnswersPerContent)

    // console.log(totalCounts)

    // const inputType = [
    //   // 'choice input',
    //   // 'number input',
    //   // 'email input',
    //   // 'date input',
    //   // 'phone number input',
    //   'text input',
    //   // 'url input',
    //   'rating input',
    //   // 'card input',
    // ]

    // const totalAnswersPerInputTypes = await prisma.answer.groupBy({
    //   by: ['blockId', 'content'], // Group by blockId and content
    //   where: {
    //     result: {
    //       typebotId: typebot.publishedTypebot.typebotId,
    //     },
    //     blockId: {
    //       in: publishedTypebot.groups.flatMap((group) =>
    //         group.blocks
    //           .filter((block) => block.type === 'text input')
    //           .map((block) => block.id)
    //       ),
    //     },
    //   },
    //   _count: {
    //     _all: true,
    //     // Count the number of answers
    //   },
    // })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // function getTotalCounts(totalAnswersPerInputTypes) {
    //   const contentTotals = {}
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-ignore
    //   totalAnswersPerInputTypes.forEach((item) => {
    //     const contents = item.content
    //       .split(',')
    //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //       // @ts-ignore
    //       .map((content) => content.trim())
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     // @ts-ignore
    //     contents.forEach((content) => {
    //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //       // @ts-ignore
    //       if (!contentTotals[content]) {
    //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //         // @ts-ignore
    //         contentTotals[content] = 0
    //       }
    //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //       // @ts-ignore
    //       contentTotals[content] += item._count._all
    //     })
    //   })

    //   const totalInp = Object.keys(contentTotals).map((type) => ({
    //     text: type,
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     // @ts-ignore
    //     total: contentTotals[type], // Corrected this line
    //   }))

    //   return totalInp
    // }

    // Get the total counts for each unique content type
    // const totalCounts = getTotalCounts(totalAnswersPerInputTypes)

    // console.log('base on type', totalCounts)

    // rating count calculation
    // const totalAnswersPerInputRating = await prisma.answer.groupBy({
    //   by: ['blockId', 'content'], // Group by blockId and content
    //   where: {
    //     result: {
    //       typebotId: typebot.publishedTypebot.typebotId,
    //     },
    //     blockId: {
    //       in: publishedTypebot.groups.flatMap((group) =>
    //         group.blocks
    //           .filter((block) => block.type === 'rating input')
    //           .map((block) => block.id)
    //       ),
    //     },
    //   },
    //   _count: {
    //     _all: true,
    //     // Count the number of answers
    //   },
    // })
    // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // // @ts-ignore
    // function getInputRatingTotalCounts(totalAnswersPerInputRating) {
    //   const contentTotals = {}
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-ignore
    //   totalAnswersPerInputRating.forEach((item) => {
    //     const contents = item.content
    //       .split(',')
    //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //       // @ts-ignore
    //       .map((content) => content.trim())
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     // @ts-ignore
    //     contents.forEach((content) => {
    //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //       // @ts-ignore
    //       if (!contentTotals[content]) {
    //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //         // @ts-ignore
    //         contentTotals[content] = 0
    //       }
    //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //       // @ts-ignore
    //       contentTotals[content] += item._count._all
    //     })
    //   })

    //   const totalRatingInput = Object.keys(contentTotals).map((type) => ({
    //     rating: type,
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     // @ts-ignore
    //     total: contentTotals[type],
    //   }))

    //   return totalRatingInput
    // }

    // // Get the total counts for each unique content type
    // const inputRatingTotalCounts = getInputRatingTotalCounts(
    //   totalAnswersPerInputRating
    // )

    // console.log('rating', checkrating)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    //     function getInputRatingTotalCounts(totalAnswersPerInputRating) {
    //       const blockIdTotals = {}
    //      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //           // @ts-ignore
    //       totalAnswersPerInputRating.forEach((item) => {
    //         const contents = item.content
    //           .split(',')
    //           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //           // @ts-ignore
    //           .map((content) => content.trim())
    //           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //           // @ts-ignore
    //         if (!blockIdTotals[item.blockId]) {
    //           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //           // @ts-ignore
    //           blockIdTotals[item.blockId] = {}
    //         }
    // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //           // @ts-ignore
    //         contents.forEach((content) => {
    //           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //           // @ts-ignore
    //           if (!blockIdTotals[item.blockId][content]) {
    //             // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //           // @ts-ignore
    //             blockIdTotals[item.blockId][content] = 0
    //           }
    //           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //           // @ts-ignore
    //           blockIdTotals[item.blockId][content] += item._count._all
    //         })
    //       })

    //       const totalRatingInput = Object.keys(blockIdTotals).flatMap((blockId) =>
    //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //           // @ts-ignore
    //         Object.keys(blockIdTotals[blockId]).map((content) => ({
    //           blockId,
    //           rating: content,
    //           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //           // @ts-ignore
    //           total: blockIdTotals[blockId][content],
    //         }))
    //       )

    //       return totalRatingInput
    //     }

    // Get the total counts for each unique content type and blockId
    // const inputRatingTotalCounts = getInputRatingTotalCounts(
    //   totalAnswersPerInputRating
    // )

    // console.log(inputRatingTotalCounts)

    return {
      totalAnswersInBlocks: totalAnswersPerBlock.map((answer) => ({
        blockId: answer.blockId,
        itemId: answer.itemId ?? undefined,
        total: answer._count._all,
      })),
      // totalContentInBlock: totalAnswersPerContent.map((answer) => ({
      //   blockId: answer.blockId,
      //   content: answer.content,
      //   total: answer._count._all,
      // })),
      // totalTextInput: totalCounts,
      // totalRatingInput: inputRatingTotalCounts,
      // totalRatingInput: graphs,
    }
  })
