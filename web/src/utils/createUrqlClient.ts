import { cacheExchange } from "@urql/exchange-graphcache";
import { dedupExchange, fetchExchange } from "urql";
import {
  LoginMutation,
  MeQuery,
  MeDocument,
  RegisterMutation,
  LogoutMutation,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    // made const for index.tsx / typing where everything else needs to be read only
    credentials: "include" as const,
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
    ssrExchange,
    fetchExchange,
  ],
});
