import { Box, Button, Flex, Heading, Link, Stack, Text } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import Layout from '../components/Layout';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link';
import React, { useState } from 'react';

const index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    // variables set to variables from above
    variables,
  });
  // if we are not loading and we did not receive any data
  if (!fetching && !data) return <div>query failed</div>;

  return (
    <Layout>
      <Flex align="center">
        <Heading>LiReddit</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">create post</Link>
        </NextLink>
      </Flex>
      <br />
      {
        // if there is no data display loading...
        !data && fetching ? (
          <div>loading...</div>
        ) : (
          // else map through the array creating a div per post
          <Stack spacing={8}>
            {data!.posts.map((post) => (
              // <div key={post.id}>{post.title}</div>
              <Box key={post.id} p={5} shadow="md" borderWidth="1px">
                <Heading fontSize="xl">{post.title}</Heading>
                <Text mt={4}>{post.textSnippet}</Text>
              </Box>
            ))}
          </Stack>
        )
      }
      {data ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                // grab the latest post and use its createdAt as a cursor position
                cursor: data.posts[data.posts.length - 1].createdAt,
              });
            }}
            isLoading={fetching}
            m="auto"
            my={4}
          >
            Load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(index);
