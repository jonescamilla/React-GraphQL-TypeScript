import { Box, Button } from "@chakra-ui/core";
import { query } from "@urql/exchange-graphcache";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import React from "react";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import { toErrorMap } from "../../utils/toErrorMap";
import login from "../login";

interface tokenProps {
  token: string;
}

const ChangePassword: NextPage<tokenProps> = ({ token }) => {
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setErrors }) => {}}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="new password"
              label="New Password"
              type="password"
            />
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

export default ChangePassword;
