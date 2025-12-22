import { type FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

async function memoryTestPlugin(fastify: FastifyInstance, options: any) {
  // Global holder so memory is NOT garbage collected
  const memoryHolder = []

  fastify.get('/test/memory', async (request, reply) => {
    const sizeMB = Number(50)

    // Allocate memory (Buffer = native memory, very visible in RSS)
    const buffer = Buffer.alloc(sizeMB * 1024 * 1024, 'a')

    // Keep reference so GC can't free it
    memoryHolder.push(buffer)

    return {
      allocatedMB: sizeMB,
      totalChunks: memoryHolder.length,
      note: 'Memory allocated and retained'
    }
  })

  fastify.get('/test/memory/clear', async () => {
    memoryHolder.length = 0

    return {
      message: 'References cleared (GC may or may not return memory to OS)'
    }
  })
}


export default fastifyPlugin(memoryTestPlugin);