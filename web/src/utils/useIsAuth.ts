import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useMeQuery } from '../generated/graphql';

export const useIsAuth = () => {
  const [{ data, fetching }] = useMeQuery();
  const router = useRouter();
  useEffect(() => {
    if (!fetching && !data?.me) {
      // this will redirect to the page previous to being redirected to the login '?next?='
      router.replace('/login?next=' + router.pathname);
    }
  }, [fetching, data, router]);
};
