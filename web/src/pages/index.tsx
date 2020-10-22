import { Link } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import Layout from '../components/Layout';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link';

const index = () => {
  const [{ data }] = usePostsQuery({
    variables: { limit: 10 },
  });
  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>create post</Link>
      </NextLink>
      <br />
      {
        // if there is no data display loading...
        !data ? (
          <div>loading...</div>
        ) : (
          // else map through the array creating a div per post
          data.posts.map((post) => <div key={post.id}>{post.title}</div>)
        )
      }
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(index);
