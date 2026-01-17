import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth.middleware';
import { validate, synthesizeSchema, transcribeSchema } from '../utils/validation';
import { listVoices, synthesizeSpeech, transcribeSpeech, streamSynthesizeSpeech } from '../services/voice.service';

/**
 * Register voice routes
 */
export async function registerVoiceRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onRequest', authenticate);

  fastify.get('/voice/voices', async (_request, reply) => {
    const voices = await listVoices();
    return reply.send({ voices });
  });

  fastify.post('/voice/synthesize', async (request, reply) => {
    const data = validate(synthesizeSchema, request.body);
    const result = await synthesizeSpeech(data);
    reply.header('Content-Type', result.contentType);
    return reply.send(result.buffer);
  });

  fastify.post('/voice/synthesize/stream', async (request, reply) => {
    const data = validate(synthesizeSchema, request.body);
    const result = await streamSynthesizeSpeech(data);
    reply.raw.writeHead(200, {
      'Content-Type': result.contentType,
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    await new Promise<void>((resolve, reject) => {
      result.stream.pipe(reply.raw);
      result.stream.on('end', resolve);
      result.stream.on('error', reject);
    });
  });

  fastify.post('/voice/transcribe', async (request, reply) => {
    const data = validate(transcribeSchema, request.body);
    const result = await transcribeSpeech(data);
    return reply.send(result);
  });
}
