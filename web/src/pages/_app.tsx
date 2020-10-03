import { ThemeProvider, CSSReset } from "@chakra-ui/core";
import React from "react";
import { createClient, dedupExchange, fetchExchange, Provider } from "urql";
import {
  Cache,
  cacheExchange,
  QueryInput,
} from "@urql/exchange-graphcache";
import theme from "../theme";
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from "../generated/graphql";

// exclusively for better typing and serves no other purpose
function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

// urql client
const client = createClient({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include",
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
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
    fetchExchange,
  ],
});

function MyApp({ Component, pageProps }: any) {
  return (
    <Provider value={client}>
      <ThemeProvider theme={theme}>
        <CSSReset />
        <Component {...pageProps} />
      </ThemeProvider>
    </Provider>
  );
}

export default MyApp;
