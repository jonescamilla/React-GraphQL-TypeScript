import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import { dedupExchange, fetchExchange, stringifyVariables } from 'urql';
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from '../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';
import Router from 'next/router';

// error global handling
import { pipe, tap } from 'wonka';
import { Exchange } from 'urql';

const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      // if the OperationResult has an error send a request to sentry
      if (error?.message.includes('not authenticated')) {
        Router.replace('/login');
      }
    })
  );
};

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;

    if (size === 0) return undefined;

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    // check cache
    const isInCache = cache.resolve(
      cache.resolveFieldByKey(entityKey, fieldKey) as string,
      'posts'
    );
    // pass boolean to info.partial based on cache check above
    info.partial = !isInCache;
    // initialize variable with default as true
    let hasMore = true;

    // combine the results
    const results = fieldInfos.reduce((acc: string[], fi) => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
      // receive the sting array
      const data = cache.resolve(key, 'posts') as string[];
      // receive the bool
      const serverHasMore = cache.resolve(key, 'hasMore');
      // if serverHasMore = false then update passing hasMore
      if (!serverHasMore) hasMore = serverHasMore as boolean;
      acc.push(...data);
      return acc;
    }, []);

    return {
      // required or else error
      __typename: 'PaginatedPosts',
      hasMore,
      posts: results,
    };
  };
};

export const createUrqlClient = (ssrExchange: any) => ({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    // made const for index.tsx / typing where everything else needs to be read only
    credentials: 'include' as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          // login
          login: (result_, _args, cache, _info) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result_,
              (result, query) => {
                // if there was an error return the current query
                if (result.login.errors) return query;
                // else return the user
                else return { me: result.login.user };
              }
            );
          },
          // register
          register: (result_, _args, cache, _info) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result_,
              (result, query) => {
                // if there was an error return the current query
                if (result.register.errors) return query;
                // else return the user
                else return { me: result.register.user };
              }
            );
          },
          // logout
          logout: (result_, _args, cache, _info) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result_,
              () => ({ me: null })
            );
          },
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});
