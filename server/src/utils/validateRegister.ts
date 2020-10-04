import { UserNamePasswordInput } from "src/resolvers/UserNamePasswordInput";

export const validateRegister = (options: UserNamePasswordInput) => {
  if (options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "must be a valid email",
      },
    ];
  }
  
  if (options.username.length <= 2) {
    return [
      {
        field: "username",
        message: "length must be greater than 2",
      },
    ];
  }

  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "username must not include an @",
      },
    ];
  }

  if (options.password.length <= 2) {
    return [
      {
        field: "password",
        message: "length must be greater than 2",
      },
    ];
  }

  return null;
};
