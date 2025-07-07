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
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
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
                                telNumber: 123456789
                            }
                        }
                    }
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
                                }
                            }
                        }
                    },
                    "400": {
                        description: "Invalid input"
                    }
                }
            }
        }
    }
}
