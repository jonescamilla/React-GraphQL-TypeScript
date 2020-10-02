import { Box, Flex, Link } from "@chakra-ui/core";
import React from "react";
// for client side routing
import NextLink from "next/link";

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  return (
    <Flex bg="tomato" p={4} ml={"auto"}>
      <Box ml={"auto"}>
        <NextLink href="/login">
          <Link mr={2} color="white">
            Login
          </Link>
        </NextLink>
        <NextLink href="/login">
          <Link color="white">Register</Link>
        </NextLink>
      </Box>
    </Flex>
  );
};

export default NavBar;
