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
  },
};
