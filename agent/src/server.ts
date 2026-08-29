import 'dotenv/config'
import { Hono } from 'hono'
import { stream } from 'hono/streaming'
import { serve } from '@hono/node-server'
import { supabase } from './data/supabase.ts';
import { AskMoniqRequestSchema } from './types.ts';
import { runAskMoniq } from './run.ts';

const app = new Hono();

app.post('/ask-moniq', async (ctx) => {
        const authHeader = ctx.req.header('Authorization');
        if (!authHeader) return ctx.json({error: 'Missing authentication'}, 401)
    
        const { data, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
        if (!data.user) return ctx.json({error: `Unauthorized error: ${error}`}, 401);
    
        const validationResult = AskMoniqRequestSchema.safeParse(ctx.req.json());
        if (!validationResult.success) return ctx.json({message: 'Invalid shape of the payload'}, 400)
    
        const result = runAskMoniq(data.user.id, validationResult.data.messages, validationResult.data.today)
        ctx.header('Content-Type', 'application/json');
    
        return stream(ctx, async (s) => {
            try {
                for await (const part of result.stream) {
                    if (part.type === 'text-delta') {
                        await s.writeln(JSON.stringify({type: 'text', text: part.text}))
                    } else if (part.type === 'tool-call') {
                        await s.writeln(JSON.stringify({type: 'tool', toolName: part.toolName}))
                    } else if (part.type === 'error') {
                        await s.writeln(JSON.stringify({type: 'error'}))
                    }
                }
            } catch (e) {
                console.error(`Error during stream call: ${e}`);
                throw new Error('An error occured during the stream')
            }
        });
})

serve({
    fetch: app.fetch,
    port: Number(process.env.HONO_SERVER_LOCAL_PORT ?? 3060)
}, () => console.log("Running server on localhost:3060"));