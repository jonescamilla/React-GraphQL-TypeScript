import { withUrqlClient } from 'next-urql';
import NavBar from '../components/NavBar';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <NavBar />
      <div> Hello World </div>
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
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(index);
