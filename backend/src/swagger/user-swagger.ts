
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
                userId: 3,
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
          "404": {
            description: "User not found",
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
                userId: 1,
                email: "userUpdated@example.com",
                password: "hashed_password",
                userName: "User Updated Name",
                userFirstname: "User Updated Firstname",
                dteCreate: "2023-10-03T12:00:00Z",
                telNumber: 987654321,
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
        responses: {
          "200": {
            description: "User sample updated",
            content: {
              "application/json": {
                example: {
                  userId: 1,
                  email: "userUpdated@example.com",
                  password: "hashed_password",
                    userName: "User Updated Name",
                  userFirstname: "User Updated Firstname",
                  dteCreate: "2023-10-03T12:00:00Z",
                  telNumber: 987654321,
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
          "400": { description: "Invalid input" },
          "404": { description: "User not found" },
        },
      },
      delete: {
        summary:
          "Delete user by ID and cascade delete from related user tables",
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
            description: "User deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "User deleted successfully",
                    },
                  },
                },
              },
            },
          },
          "404": { description: "User not found" },
        },
      },
    },
    "/users/donation-centers": {
      get: {
        summary: "Get all user donation centers",
        tags: ["User"],
        responses: {
          "200": {
            description: "List of donation centers users",
            content: {
              "application/json": {
                example: [
                  {
                    userId: 1,
                    centerId: 1,
                    admin: false,
                    info: "Regular employee",
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
                        example: "donation-center@bloodsky.fr",
                      },
                      password: { type: "string", example: "$2b$10$..." },
                      userName: { type: "string", example: "donation" },
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
                  email: "donation-center@bloodsky.fr",
                  userName: "donation",
                  userFirstname: "center",
                  telNumber: null,
                  userStatus: "active",
                },
                centerId: 3,
                admin: true,
                info: "info du user donation",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Donation center user created successfully",
            content: {
              "application/json": {
                example: {
                  userId: 3,
                  centerId: 1,
                  admin: false,
                  info: "info du donation user",
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
    "/users/dronist": {
      get: {
        summary: "Get all dronists users",
        tags: ["User"],
        responses: {
          "200": {
            description: "List of dronists users",
            content: {
              "application/json": {
                example: [
                  {
                    userId: 1,
                    info: "info du dronist user",
                  },
                ],
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new dronist user",
        tags: ["User"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  info: { type: "string", example: "info du dronist user" },
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
            description: "Dronist user created successfully",
            content: {
              "application/json": {
                example: {
                  userId: 3,
                  info: "info du dronist user",
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
    "/users/support-center": {
      get: {
        summary: "Get all support centers users",
        tags: ["User"],
        responses: {
          "200": {
            description: "List of support centers users",
            content: {
              "application/json": {
                example: [
                  {
                    userId: 1,
                    info: "info du support center user",
                  },
                ],
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new support center user",
        tags: ["User"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  info: {
                    type: "string",
                    example: "info du support center user",
                  },
                },
                required: ["info"],
              },
              example: {
                userId: 5,
                info: "New support center user info",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Support center user created successfully",
            content: {
              "application/json": {
                example: {
                  userId: 5,
                  info: "info du support center user",
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
    "/users/hospital": {
      get: {
        summary: "Get all hospitals users",
        tags: ["User"],
        responses: {
          "200": {
            description: "List of hospital users",
            content: {
              "application/json": {
                example: [
                  {
                    userId: 10,
                    hospitalId: 10,
                    admin: false,
                    info: "Regular employee",
                  },
                  {
                    userId: 11,
                    hospitalId: 11,
                    admin: true,
                    info: "admin at this hospital",
                  },
                ],
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new hospital user",
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
                        example: "hospital@bloodsky.fr",
                      },
                      password: { type: "string", example: "$2b$10$..." },
                      userName: { type: "string", example: "hospital" },
                      userFirstname: { type: "string", example: "latipsoh" },
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
                    example: "info du user hospital",
                  },
                },
                required: ["user", "info"],
              },
              example: {
                user: {
                  userId: 10,
                  email: "hospital@bloodsky.fr",
                  userName: "hospital",
                  userFirstname: "latipsoh",
                  telNumber: null,
                  userStatus: "active",
                },
                hospitalId: 4,
                admin: true,
                info: "info du user hospital",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Hospital user created successfully",
            content: {
              "application/json": {
                example: {
                  userId: 10,
                  hospitalId: 10,
                  admin: false,
                  info: "Regular employee",
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
    "/users/email/{email}": {
      get: {
        summary: "Get all users by email",
        tags: ["User"],
        parameters: [
          {
            name: "email",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "email",
            },
            example: "user@example.com",
          },
        ],
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
                      email: "user@example.com",
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
                      email: "user@example.com",
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
          "404": {
            description: "No user found with this email",
          },
        },
      },
    },
    "/users/name/{userName}": {
      get: {
        summary: "Get all users by userName",
        tags: ["User"],
        parameters: [
          {
            name: "userName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            example: "mark",
          },
        ],
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
                      userName: "mark",
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
                      userName: "mark",
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
          "404": {
            description: "No user found with this name",
          },
        },
      },
    },
    "/users/donation-center/{centerId}": {
      get: {
        summary: "Get users from a donation center",
        tags: ["User"],
        parameters: [
          {
            name: "centerId",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 2,
          },
        ],
        responses: {
          "200": {
            description: "List of users in this donation center",
            content: {
              "application/json": {
                example: [
                  {
                    userId: 1,
                    centerId: 1,
                    admin: false,
                    info: "Regular employee",
                  },
                  {
                    userId: 2,
                    centerId: 1,
                    admin: true,
                    info: "Admin at this center",
                  },
                ],
              },
            },
          },
          "404": {
            description: "Center not found",
          },
        },
      },
    },
    "/users/donation-center/{centerId}/admins": {
      get: {
        summary: "Get admin users from a donation center",
        tags: ["User"],
        parameters: [
          {
            name: "centerId",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 2,
          },
        ],
        responses: {
          "200": {
            description: "List of admin users in this donation center",
            content: {
              "application/json": {
                example: [
                  {
                    userId: 1,
                    centerId: 1,
                    admin: true,
                    info: "Admin at this center",
                  },
                  {
                    userId: 2,
                    centerId: 1,
                    admin: true,
                    info: "Other admin at this center",
                  },
                ],
              },
            },
          },
          "404": {
            description: "Center not found",
          },
        },
      },
    },
    "/users/hospital/{hospitalId}": {
      get: {
        summary: "Get users from a hospital",
        tags: ["User"],
        parameters: [
          {
            name: "hospitalId",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 2,
          },
        ],
        responses: {
          "200": {
            description: "List of users in this hospital",
            content: {
              "application/json": {
                example: [
                  {
                    userId: 1,
                    hospitalId: 1,
                    admin: false,
                    info: "Regular employee",
                  },
                  {
                    userId: 2,
                    hospitalId: 1,
                    admin: true,
                    info: "Admin at this hospital",
                  },
                ],
              },
            },
          },
          "404": {
            description: "Hospital not found",
          },
        },
      },
    },
    "/users/hospital/{hospitalId}/admins": {
      get: {
        summary: "Get admin users from a hospital",
        tags: ["User"],
        parameters: [
          {
            name: "hospitalId",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 2,
          },
        ],
        responses: {
          "200": {
            description: "List of admin users in this hospital",
            content: {
              "application/json": {
                example: [
                  {
                    userId: 1,
                    hospitalId: 1,
                    admin: true,
                    info: "Admin at this hospital",
                  },
                  {
                    userId: 2,
                    hospitalId: 1,
                    admin: true,
                    info: "Other admin at this hospital",
                  },
                ],
              },
            },
          },
          "404": {
            description: "Hospital not found",
          },
        },
      },
    },
    "/users/{userId}/deliveries": {
      get: {
        summary: "Get deliveries participation associated with user Id",
        tags: ["User"],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 3,
          },
        ],
        responses: {
          "200": {
            description: "List of deliveries participation with this user Id",
            content: {
              "application/json": {
                example: [
                  {
                    deliveryId: 1,
                    userId: 1,
                  },
                  {
                    deliveryId: 18,
                    userId: 1,
                  },
                ],
              },
            },
          },
          "404": {
            description: "User not found",
          },
        },
      },
    },
    "/users/donation-center/{userId}": {
      put: {
        summary: "Update user then user in donation center",
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
                user: {
                  userId: 1,
                  email: "donation-centerUpdated@bloodsky.fr",
                  userName: "DONATION",
                  userFirstname: "CENTER",
                  telNumber: null,
                  userStatus: "active",
                },
                centerId: 1,
                admin: true,
                info: "nouvelles infos du user donation",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "User sample updated",
            content: {
              "application/json": {
                example: {
                  user: {
                    userId: 1,
                    email: "donation-centerUpdated@bloodsky.fr",
                      userName: "DONATION",
                    userFirstname: "CENTER",
                    telNumber: null,
                    userStatus: "active",
                  },
                  centerId: 1,
                  admin: true,
                  info: "nouvelles infos du user donation",
                },
              },
            },
          },
          "400": { description: "Invalid input" },
          "404": { description: "User not found" },
        },
      },
    },
    "/users/hospital/{userId}": {
      put: {
        summary: "Update user then user in hospital",
        tags: ["User"],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 2,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                user: {
                  userId: 2,
                  email: "hospitalUpdated@bloodsky.fr",
                  userName: "HOSPI",
                  userFirstname: "TAL",
                  telNumber: null,
                  userStatus: "active",
                },
                hospitalId: 3,
                admin: true,
                info: "nouvelles infos du user hospital",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "User sample updated",
            content: {
              "application/json": {
                example: {
                  user: {
                    userId: 2,
                    email: "hospitalUpdated@bloodsky.fr",
                      userName: "HOSPI",
                    userFirstname: "TAL",
                    telNumber: null,
                    userStatus: "active",
                  },
                  hospitalId: 3,
                  admin: true,
                  info: "nouvelles infos du user hospital",
                },
              },
            },
          },
          "400": { description: "Invalid input" },
          "404": { description: "User not found" },
        },
      },
    },
    "/users/dronist/{userId}": {
      put: {
        summary: "Update user then user in dronist",
        tags: ["User"],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 3,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                user: {
                  userId: 3,
                  email: "dronistUpdated@bloodsky.fr",
                  userName: "dron",
                  userFirstname: "iste",
                  telNumber: null,
                  userStatus: "active",
                },
                info: "nouvelles infos du user dronist",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "User sample updated",
            content: {
              "application/json": {
                example: {
                  user: {
                    userId: 3,
                    email: "dronistUpdated@bloodsky.fr",
                      userName: "dron",
                    userFirstname: "iste",
                    telNumber: null,
                    userStatus: "active",
                  },
                  info: "nouvelles infos du user dronist",
                },
              },
            },
          },
          "400": { description: "Invalid input" },
          "404": { description: "User not found" },
        },
      },
    },
    "/users/support-center/{userId}": {
      put: {
        summary: "Update user then user in support-center",
        tags: ["User"],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 4,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                user: {
                  userId: 4,
                  email: "support-centerUpdated@bloodsky.fr",
                  userName: "support",
                  userFirstname: "center",
                  telNumber: null,
                  userStatus: "active",
                },
                info: "nouvelles infos du user support-center",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "User sample updated",
            content: {
              "application/json": {
                example: {
                  user: {
                    userId: 4,
                    email: "support-centerUpdated@bloodsky.fr",
                      userName: "support",
                    userFirstname: "center",
                    telNumber: null,
                    userStatus: "active",
                  },
                  info: "nouvelles infos du user support-center",
                },
              },
            },
          },
          "400": { description: "Invalid input" },
          "404": { description: "User not found" },
        },
      },
    },
    "/users/role": {
      get: {
        summary: "Obtenir le rôle de l'utilisateur connecté",
        description: "Retourne le rôle de l'utilisateur actuellement connecté",
        tags: ["User"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Rôle utilisateur récupéré avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    role: {
                      type: "string",
                      enum: ["user", "admin", "dronist", "hospital_admin", "donation_center_admin", "super_admin"],
                      example: "dronist"
                    },
                    userId: {
                      type: "integer",
                      example: 123
                    }
                  }
                }
              }
            }
          },
          "401": {
            description: "Token d'authentification manquant ou invalide"
          }
        }
      }
    },
  },
};
