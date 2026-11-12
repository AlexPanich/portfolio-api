import { join } from 'node:path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import type { Request } from 'express';
import { AppConfig } from '../config/app-config.service.js';
import type { GraphQLContext } from './graphql-context.js';
import { EXAMPLE_QUERY } from './example-query.js';
import { LoadersFactory } from './loaders.factory.js';
import { LoadersModule } from './loaders.module.js';

@Module({
  imports: [
    NestGraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [LoadersModule],
      inject: [AppConfig, LoadersFactory],
      useFactory: (config: AppConfig, loaders: LoadersFactory) => ({
        path: '/graphql',
        // Code-first: the SDL is derived from TypeScript classes. Outside
        // production it is also written to disk so schema changes show up
        // in code review.
        autoSchemaFile: config.isProduction
          ? true
          : join(process.cwd(), 'schema.gql'),
        sortSchema: true,
        // This is a public business card: introspection and the Sandbox
        // are the product, so both stay enabled in production.
        introspection: true,
        graphiql: false,
        plugins: [
          ApolloServerPluginLandingPageLocalDefault({
            embed: true,
            document: EXAMPLE_QUERY,
          }),
        ],
        includeStacktraceInErrorResponses: !config.isProduction,
        context: ({ req }: { req: Request }): GraphQLContext => ({
          req,
          loaders: loaders.create(),
        }),
      }),
    }),
  ],
})
export class GraphQLModule {}
