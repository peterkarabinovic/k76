import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import mercurius from 'mercurius';
import { DbClient } from "../exchange-database"
import { typeDefs } from './graphql-schema';
import { resolvers, loaders } from './graphql-resolvers';

type Props = {
    port: number;
    db: DbClient;
    onStop?: () => Promise<void>;
};

declare module 'mercurius' {
    interface MercuriusContext {  db: DbClient }
}


export async function startGraphQLServer({ port, db, onStop }: Props) {

    const fastify = Fastify();


    fastify.register(mercurius, {
        schema: typeDefs,
        resolvers,
        loaders,
        graphiql: true,
        context: () => ({ db }),
        cache: false
    });

    fastify.addHook('onClose', async () => onStop?.() );

    await fastify
        .listen({ host: '0.0.0.0', port })
        .then((address) => console.log(`
            GraphQL Server runs on ${address}
            GraphiQL is available at ${address}/graphiql
        `))
        .catch((error) => console.error(error));

    const terminate = () => {
        fastify.log.info('${SERVICE_NAME} shutting down...');
        fastify
            .close()
            .then(() => {
                process.exit(0);
            })
            .catch((er) => {
                fastify.log.error(er);
                process.exit(1);
            });
    };
    process.on('SIGINT', terminate);
    process.on('SIGTERM', terminate);

}

