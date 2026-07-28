import fastify from '../src/app.js'; // a tua instância Fastify, exportada sem .listen()
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await fastify.ready();
    fastify.server.emit('request', req, res);
}