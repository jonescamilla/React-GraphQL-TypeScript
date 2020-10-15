import { Box, Button, Flex, Link } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useLoginMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';
import NextLink from 'next/link';

interface loginProps {}

const Login: React.FC<loginProps> = ({}) => {
  // next.js router
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);
          // if there is an error use the error map util to format for formik
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
            // if the user exits then redirect
          } else if (response.data?.login.user) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="username or email"
              label="Username or Email"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
              <Flex justify="flex-end">
                <NextLink href="/forgot-password">
                  <Link mt={2}> Forgot Password? </Link>
                </NextLink>
              </Flex>
            </Box>
            <Button
              mt={4}
              isLoading={isSubmitting}
              type="submit"
              variantColor="teal"
            >
              login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};
// wapping in urql client in order to call the mutation
export default withUrqlClient(createUrqlClient)(Login);
