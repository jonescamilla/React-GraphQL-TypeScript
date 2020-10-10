import { Box, Button, Flex, Link } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { useState } from 'react';
import InputField from '../../components/InputField';
import Wrapper from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';
import NextLink from 'next/link';

interface tokenProps {
  token: string;
}

const ChangePassword: NextPage<tokenProps> = ({ token }) => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('');
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            token,
            newPassword: values.newPassword,
          });
          // if there is an error use custom error map to handle token errors
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ('token' in errorMap) {
              // pass in the token error
              setTokenError(errorMap.token);
            }
            setErrors(errorMap);
            // if the user exits then redirect
          } else if (response.data?.changePassword.user) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="new password"
              label="New Password"
              type="password"
            />
            {tokenError ? (
              <Flex justify="space-between">
                <Box mr={2} color="red.500">
                  {tokenError}
                </Box>
                <NextLink href="/forgot-password">
                  <Link> Get New Password </Link>
                </NextLink>
              </Flex>
            ) : null}
            <Button
              mt={4}
              isLoading={isSubmitting}
              type="submit"
              variantColor="teal"
            >
              Set New Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};
// special next.js function that allows getting any query parameters and pass it to a function
ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

// set ssr to false because getInitialProps may set ssr on
export default withUrqlClient(createUrqlClient, { ssr: false })(ChangePassword);
