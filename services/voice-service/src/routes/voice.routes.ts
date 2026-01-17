import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth.middleware';
import { validate, synthesizeSchema, transcribeSchema } from '../utils/validation';
import { listVoices, synthesizeSpeech, transcribeSpeech, streamSynthesizeSpeech } from '../services/voice.service';

const voiceTags = ['Voice'];
const errorResponseSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    code: { type: 'string' },
    details: { type: 'object' },
  },
};
const voiceInfoSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
  },
  required: ['id', 'name'],
};

/**
 * Register voice routes
 */
export async function registerVoiceRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('onRequest', authenticate);

  fastify.get(
    '/voice/voices',
    {
      schema: {
        tags: voiceTags,
        summary: 'List available voices',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              voices: { type: 'array', items: voiceInfoSchema },
            },
            required: ['voices'],
          },
          401: errorResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const voices = await listVoices();
      return reply.send({ voices });
    }
  );

  fastify.post(
    '/voice/synthesize',
    {
      schema: {
        tags: voiceTags,
        summary: 'Synthesize speech',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['text'],
          properties: {
            text: { type: 'string' },
            voiceId: { type: 'string' },
            speed: { type: 'number' },
          },
        },
        response: {
          200: { type: 'string', format: 'binary' },
          400: errorResponseSchema,
          401: errorResponseSchema,
          503: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const data = validate(synthesizeSchema, request.body);
      const result = await synthesizeSpeech(data);
      reply.header('Content-Type', result.contentType);
      return reply.send(result.buffer);
    }
  );

  fastify.post(
    '/voice/synthesize/stream',
    {
      schema: {
        tags: voiceTags,
        summary: 'Stream synthesized speech',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['text'],
          properties: {
            text: { type: 'string' },
            voiceId: { type: 'string' },
            speed: { type: 'number' },
          },
        },
        response: {
          200: { type: 'string', format: 'binary' },
          400: errorResponseSchema,
          401: errorResponseSchema,
          503: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
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
    }
  );

  fastify.post(
    '/voice/transcribe',
    {
      schema: {
        tags: voiceTags,
        summary: 'Transcribe speech to text',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['audioBase64'],
          properties: {
            audioBase64: { type: 'string' },
            filename: { type: 'string' },
            contentType: { type: 'string' },
            language: { type: 'string' },
          },
        },
        response: {
          200: { type: 'object' },
          400: errorResponseSchema,
          401: errorResponseSchema,
          503: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const data = validate(transcribeSchema, request.body);
      const result = await transcribeSpeech(data);
      return reply.send(result);
    }
  );
}
