// blood-swagger.ts

export const bloodSwagger: { paths: Record<string, any> } = {
  paths: {
    "/blood": {
      get: {
        summary: "Get all blood samples",
        tags: ["Blood"],
        responses: {
          "200": {
            description: "List of blood samples",
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
              schema: {
                type: "object",
                properties: {
                  bloodType: { type: "string" },
                  deliveryId: { type: "integer" },
                },
                required: ["bloodType", "deliveryId"],
              },
            },
          },
        },
        responses: {
          "201": { description: "Blood sample created" },
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
          },
        ],
        responses: {
          "200": { description: "Blood sample found" },
          "404": { description: "Not found" },
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
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  bloodType: { type: "string" },
                  deliveryId: { type: "integer" },
                },
                required: ["bloodType", "deliveryId"],
              },
            },
          },
        },
        responses: {
          "200": { description: "Blood sample updated" },
          "400": { description: "Invalid input" },
          "404": { description: "Not found" },
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
          },
        ],
        responses: {
          "200": { description: "Blood sample deleted" },
          "404": { description: "Not found" },
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
          },
        ],
        responses: {
          "200": { description: "List of blood samples for delivery" },
          "404": { description: "Not found" },
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
          },
        ],
        responses: {
          "200": { description: "List of blood samples for type" },
          "404": { description: "Not found" },
        },
      },
    },
  },
};
