import { password } from "bun";

export const userSwagger: Record<string, any> = {
  paths: {
    "/users": {
      get: {
        summary: "Get all users",
        tags: ["User"],
        responses: {
          "200": {
            description: "List of users",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  example: [
                    {
                      userId: 1,
                      email: "user1@example.com",
                      password: "hashed_password_1",
                      userName: "User One",
                      userFirstname: "First",
                      dteCreate: "2023-10-01T12:00:00Z",
                      telNumber: 123456789,
                      userStatus: "active",
                      tempPasswordToken: "temp_token_1",
                      tempPasswordExpires: "2023-11-01T12:00:00Z",
                      urlUsed: false,
                      resetPasswordToken: "reset_token_1",
                      resetPasswordExpires: "2023-11-02T12:00:00Z",
                    },
                    {
                      userId: 2,
                      email: "user2@example.com",
                      password: "hashed_password_2",
                      userName: "User Two",
                      userFirstname: "Second",
                      dteCreate: "2023-10-02T12:00:00Z",
                      telNumber: 987654321,
                      userStatus: "inactive",
                      tempPasswordToken: "temp_token_2",
                      tempPasswordExpires: "2023-11-02T12:00:00Z",
                      urlUsed: true,
                      resetPasswordToken: "reset_token_2",
                      resetPasswordExpires: "2023-11-03T12:00:00Z",
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new user",
        tags: ["User"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                email: "user@example.com",
                password: "hashed_password",
                userName: "User Name",
                userFirstname: "User Firstname",
                telNumber: 123456789,
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User created successfully",
            content: {
              "application/json": {
                example: {
                  userId: 3,
                  email: "user@example.com",
                  password: "hashed_password",
                  userName: "User Name",
                  userFirstname: "User Firstname",
                  dteCreate: "2023-10-03T12:00:00Z",
                  telNumber: 123456789,
                  userStatus: "active",
                  tempPasswordToken: null,
                  tempPasswordExpires: null,
                  urlUsed: false,
                  resetPasswordToken: null,
                  resetPasswordExpires: null,
                },
              },
            },
          },
          "400": {
            description: "Invalid input",
          },
        },
      },
    },
    "/users/{userId}": {
      get: {
        summary: "Get user by ID",
        tags: ["User"],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        responses: {
          "200": {
            description: "User details",
            content: {
              "application/json": {
                example: {
                  userId: 1,
                  email: "user@example.com",
                  password: "hashed_password",
                  userName: "User Name",
                  userFirstname: "User Firstname",
                  dteCreate: "2023-10-03T12:00:00Z",
                  telNumber: 123456789,
                  userStatus: "active",
                  tempPasswordToken: null,
                  tempPasswordExpires: null,
                  urlUsed: false,
                  resetPasswordToken: null,
                  resetPasswordExpires: null,
                },
              },
            },
          },
        },
      },
      put: {
        summary: "Update user by ID",
        tags: ["User"],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                email: "userUpdated@example.com",
                userName: "User Updated Name",
                userFirstname: "User Updated Firstname",
                telNumber: 987654321,
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete user by ID",
        tags: ["User"],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
      },
    },
    "/users/donation-centers": {
      get: {
        summary: "Get all user donation centers",
        tags: ["User"],
        responses: {
          "200": {
            description: "List of user donation centers",
            content: {
              "application/json": {
                example: [
                  {
                    userId: 1,
                    centerId: 1,
                    admin: false,
                    info: "Regular donor",
                  },
                  {
                    userId: 2,
                    centerId: 2,
                    admin: true,
                    info: "Admin at this center",
                  },
                ],
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new user donation center",
        tags: ["User"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  user: {
                    type: "object",
                    properties: {
                      email: {
                        type: "string",
                        format: "email",
                        example: "support@bloodsky.fr",
                      },
                      password: { type: "string", example: "$2b$10$..." },
                      userName: { type: "string", example: "support" },
                      userFirstname: { type: "string", example: "center" },
                      telNumber: { type: ["integer", "null"], example: null },
                      userStatus: {
                        type: "string",
                        enum: ["active", "pending", "suspended"],
                        example: "active",
                      },
                    },
                    required: [
                      "email",
                      "password",
                      "userName",
                      "userFirstname",
                      "userStatus",
                    ],
                  },
                  info: {
                    type: "string",
                    example: "info du user donation",
                  },
                },
                required: ["user", "info"],
              },
              example: {
                user: {
                  userId: 3,
                  email: "support@bloodsky.fr",
                  password: "mot de passe haché",
                  userName: "support",
                  userFirstname: "center",
                  telNumber: null,
                  userStatus: "active",
                },
                info: "info du user donation",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User donation center created successfully",
            content: {
              "application/json": {
                example: {
                  userId: 3,
                  centerId: 1,
                  admin: false,
                  info: "info du user donation",
                },
              },
            },
          },
          "400": {
            description: "Invalid input",
          },
        },
      },
    },
    "users/dronist": {
      get: {
        summary: "Get all user dronists",
        tags: ["User"],
        responses: {
          "200": {
            description: "List of user donation centers",
            content: {
              "application/json": {
                example: [
                  {
                    userId: 1,
                    info: "info du user dronist",
                  },
                ],
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new user dronist",
        tags: ["User"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  info: { type: "string", example: "info du user dronist" },
                },
                required: ["info"],
              },
              example: {
                userId: 3,
                info: "New dronist info",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User dronist created successfully",
            content: {
              "application/json": {
                example: {
                  userId: 3,
                  info: "info du user dronist",
                },
              },
            },
          },
          "400": {
            description: "Invalid input",
          },
        },
      },
    },
    "users/support-center": {
      get: {
        summary: "Get all user support center",
        tags: ["User"],
        responses: {
          "200": {
            description: "List of user support centers",
            content: {
              "application/json": {
                example: [
                  {
                    userId: 1,
                    info: "info du user support center"
                  }
                ]
              }
            }
          }
        }
      },
      post: {
        summary: "Create a new user support center",
        tags: ["User"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  info: {type: "string", example: "info du user support center" },
                },
                required: ["info"],
              },
              example: {
                userId: 5,
                info: "New support center user info"
              }
            }
          }
        },
        responses: {
          "201": {
            description: "User support center created successfully",
            content: {
              "application/json": {
                example: {
                  userId: 5,
                  info: "info du user support center"
                }
              }
            }
          },
          "400": {
            description: "Invalid input",
          }
        }
      }
    }
  },
};
