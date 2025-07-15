export const bloodSwagger: Record<string, any> = {
  paths: {
    "/blood": {
      get: {
        summary: "Get all blood samples",
        tags: ["Blood"],
        responses: {
          "200": {
            description: "List of blood samples",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  example: [
                    {
                      bloodId: 1,
                      bloodType: "O+",
                      deliveryId: 42,
                    },
                    {
                      bloodId: 2,
                      bloodType: "A-",
                      deliveryId: 51,
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new blood sample",
        tags: ["Blood"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                bloodId: 1,
                bloodType: "O+",
                deliveryId: 42,
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Blood sample created",
            content: {
              "application/json": {
                example: {
                  bloodId: 1,
                  bloodType: "O+",
                  deliveryId: 42,
                },
              },
            },
          },
          "400": { description: "Invalid input" },
        },
      },
    },
    "/blood/{id}": {
      get: {
        summary: "Get a blood sample by ID",
        tags: ["Blood"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 1,
          },
        ],
        responses: {
          "200": {
            description: "Blood sample found",
            content: {
              "application/json": {
                example: {
                  id: 1,
                  bloodType: "O+",
                  deliveryId: 42,
                },
              },
            },
          },
          "404": { description: "Blood sample not found" },
        },
      },
      put: {
        summary: "Update a blood sample by ID",
        tags: ["Blood"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 1,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                bloodType: "A-",
                deliveryId: 44,
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Blood sample updated",
            content: {
              "application/json": {
                example: {
                  id: 1,
                  bloodType: "A-",
                  deliveryId: 44,
                },
              },
            },
          },
          "400": { description: "Invalid input" },
          "404": { description: "Blood sample not found" },
        },
      },
      delete: {
        summary: "Delete a blood sample by ID",
        tags: ["Blood"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 1,
          },
        ],
        responses: {
          "200": {
            description: "Blood sample deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Blood sample deleted successfully",
                    },
                  },
                },
              },
            },
          },
          "404": { description: "Blood sample not found" },
        },
      },
    },
    "/blood/delivery/{deliveryId}": {
      get: {
        summary: "Get blood samples by delivery ID",
        tags: ["Blood"],
        parameters: [
          {
            name: "deliveryId",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 42,
          },
        ],
        responses: {
          "200": {
            description: "List of blood samples for delivery",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  example: [
                    { id: 1, bloodType: "O+", deliveryId: 42 },
                    { id: 2, bloodType: "A-", deliveryId: 42 },
                  ],
                },
              },
            },
          },
          "404": { description: "Delivery not found" },
        },
      },
    },
    "/blood/type/{bloodType}": {
      get: {
        summary: "Get blood samples by type",
        tags: ["Blood"],
        parameters: [
          {
            name: "bloodType",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "O+",
          },
        ],
        responses: {
          "200": {
            description: "List of blood samples for type",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  example: [
                    { id: 1, bloodType: "O+", deliveryId: 42 },
                    { id: 3, bloodType: "O+", deliveryId: 45 },
                  ],
                },
              },
            },
          },
          "404": { description: "Blood sample not found" },
        },
      },
    },
  },
};
