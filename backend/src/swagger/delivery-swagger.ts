export const deliverySwagger: Record<string, any> = {
  paths: {
    "/deliveries": {
      get: {
        summary: "Get all deliveries",
        tags: ["Delivery"],
        responses: {
          "200": {
            description: "List of deliveries",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  example: [
                    {
                      deliveryId: 1,
                      droneId: 3,
                      bloodId: 1,
                      hospitalId: 4,
                      centerId: 2,
                      dteDelivery: "2025-07-15T09:00:00Z",
                      dteValidation: "2025-07-15T09:30:00Z",
                      deliveryStatus: "en attente de la maison de sang",
                      deliveryUrgent: true,
                    },
                    {
                      deliveryId: 3,
                      droneId: 2,
                      bloodId: 4,
                      hospitalId: 4,
                      centerId: 4,
                      dteDelivery: "2025-07-15T12:00:00Z",
                      dteValidation: "2025-07-15T12:07:16Z",
                      deliveryStatus: "en attente de la maison de sang",
                      deliveryUrgent: false,
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new delivery",
        tags: ["Delivery"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                deliveryId: 3,
                droneId: 2,
                bloodId: 4,
                hospitalId: 4,
                centerId: 4,
                dteDelivery: "2025-07-15T12:00:00Z",
                dteValidation: "2025-07-15T12:07:16Z",
                deliveryStatus: "en attente de la maison de sang",
                deliveryUrgent: true,
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Delivery created successfully",
            content: {
              "application/json": {
                example: {
                  deliveryId: 3,
                  droneId: 2,
                  bloodId: 4,
                  hospitalId: 4,
                  centerId: 4,
                  dteDelivery: "2025-07-15T12:00:00Z",
                  dteValidation: "2025-07-15T12:07:16Z",
                  deliveryStatus: "en attente de la maison de sang",
                  deliveryUrgent: true,
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
    "/deliveries/{deliveryId}": {
      get: {
        summary: "Get delivery by ID",
        tags: ["Delivery"],
        parameters: [
          {
            name: "deliveryId",
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
            description: "Delivery details",
            content: {
              "application/json": {
                example: {
                  deliveryId: 3,
                  droneId: 2,
                  bloodId: 4,
                  hospitalId: 4,
                  centerId: 4,
                  dteDelivery: "2025-07-15T12:00:00Z",
                  dteValidation: "2025-07-15T12:07:16Z",
                  deliveryStatus: "en attente de la maison de sang",
                  deliveryUrgent: true,
                },
              },
            },
          },
          "404": {
            description: "Delivery not found",
          },
        },
      },
      put: {
        summary: "Update delivery by ID",
        tags: ["Delivery"],
        parameters: [
          {
            name: "deliveryId",
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
                deliveryId: 3,
                droneId: 2,
                bloodId: 4,
                hospitalId: 4,
                centerId: 4,
                dteDelivery: "2025-07-15T12:00:00Z",
                dteValidation: "2025-07-15T12:07:16Z",
                deliveryStatus: "en attente de la maison de sang",
                deliveryUrgent: true,
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Delivery sample updated",
            content: {
              "application/json": {
                example: {
                  deliveryId: 3,
                  droneId: 2,
                  bloodId: 4,
                  hospitalId: 4,
                  centerId: 4,
                  dteDelivery: "2025-07-15T12:00:00Z",
                  dteValidation: "2025-07-15T12:07:16Z",
                  deliveryStatus: "en attente de la maison de sang",
                  deliveryUrgent: true,
                },
              },
            },
          },
          "400": { description: "Invalid input" },
          "404": { description: "Delivery not found" },
        },
      },
      delete: {
        summary: "Delete delivery by ID",
        tags: ["Delivery"],
        parameters: [
          {
            name: "deliveryId",
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
            description: "Delivery deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Delivery deleted successfully",
                    },
                  },
                },
              },
            },
          },
          "404": { description: "Delivery not found" },
        },
      },
    },
    "/deliveries/participation": {
      post: {
        summary: "Create a new delivery participation",
        tags: ["Delivery"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                deliveryId: 3,
                userId: 2,
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Delivery participation created successfully",
            content: {
              "application/json": {
                example: {
                  deliveryId: 3,
                  userId: 2,
                },
              },
            },
          },
          "400": {
            description: "Invalid input",
          },
        },
      },
      delete: {
        summary: "Delete delivery by ID",
        tags: ["Delivery"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                deliveryId: 3,
                userId: 2,
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Delivery participation deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Delivery participation deleted successfully",
                    },
                  },
                },
              },
            },
          },
          "404": { description: "Delivery or user not found" },
        },
      },
    },
    "/deliveries/drone/{droneId}": {
      get: {
        summary: "Get delivery (and user associated) by drone ID",
        tags: ["Delivery"],
        parameters: [
          {
            name: "droneId",
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
            description: "Delivery details",
            content: {
              "application/json": {
                example: {
                  deliveryId: 10,
                  droneId: 1,
                  bloodId: null,
                  hospitalId: 5,
                  centerId: 1,
                  dteDelivery: "2025-07-08T19:21:55.189Z",
                  dteValidation: null,
                  deliveryStatus: "en attente du droniste",
                  deliveryUrgent: true,
                  participants: [],
                },
              },
            },
          },
          "404": {
            description: "Drone not found",
          },
        },
      },
    },
    
  },
};
