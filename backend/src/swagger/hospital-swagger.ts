export const hospitalSwagger: Record<string, any> = {
  paths: {
    "/hospitals": {
      get: {
        summary: "Get all hospitals",
        tags: ["Hospital"],
        responses: {
          "200": {
            description: "List of hospitals",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  example: [
                    {
                      hospitalId: 1,
                      hospitalName: "hospital_name",
                      hospitalCity: "hospital_city",
                      hospitalPostal: 75001,
                      hospitalAdress: "hospital_adress",
                      hospitalLatitude: 48.856614,
                      hospitalLongitude: 2.3522219,
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new hospital",
        tags: ["Hospital"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                hospitalId: 1,
                hospitalName: "hospital_name",
                hospitalCity: "hospital_city",
                hospitalPostal: 75001,
                hospitalAdress: "hospital_adress",
                hospitalLatitude: 48.856614,
                hospitalLongitude: 2.3522219,
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Hospital created",
            content: {
              "application/json": {
                example: {
                  hospitalId: 1,
                  hospitalName: "hospital_name",
                  hospitalCity: "hospital_city",
                  hospitalPostal: 75001,
                  hospitalAdress: "hospital_adress",
                  hospitalLatitude: 48.856614,
                  hospitalLongitude: 2.3522219,
                },
              },
            },
          },
          "400": { description: "Invalid input" },
        },
      },
    },
    "/hospitals/{hospitalId}": {
      get: {
        summary: "Get an hospital by Id",
        tags: ["Hospital"],
        parameters: [
          {
            name: "hospitalId",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 1,
          },
        ],
        responses: {
          "200": {
            description: "Hospitals found",
            content: {
              "application/json": {
                example: {
                  hospitalId: 1,
                  hospitalName: "hospital_name",
                  hospitalCity: "hospital_city",
                  hospitalPostal: 75001,
                  hospitalAdress: "hospital_adress",
                  hospitalLatitude: 48.856614,
                  hospitalLongitude: 2.3522219,
                },
              },
            },
          },
          "404": { description: "Hospital not found" },
        },
      },
      put: {
        summary: "Update an hospital by ID",
        tags: ["Hospital"],
        parameters: [
          {
            name: "hospitalId",
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
                hospitalId: 1,
                hospitalName: "hospital_name_updated",
                hospitalCity: "hospital_city_updated",
                hospitalPostal: 75001,
                hospitalAdress: "hospital_adress_updated",
                hospitalLatitude: 48.856614,
                hospitalLongitude: 2.3522219,
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Hospital sample updated",
            content: {
              "application/json": {
                example: {
                  hospitalId: 1,
                  hospitalName: "hospital_name_updated",
                  hospitalCity: "hospital_city_updated",
                  hospitalPostal: 75001,
                  hospitalAdress: "hospital_adress_updated",
                  hospitalLatitude: 48.856614,
                  hospitalLongitude: 2.3522219,
                },
              },
            },
          },
          "400": { description: "Invalid input" },
          "404": { description: "Hospital not found" },
        },
      },
      delete: {
        summary: "Delete a hospital by ID",
        tags: ["Hospital"],
        parameters: [
          {
            name: "hospitalId",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 1,
          },
        ],
        responses: {
          "200": {
            description: "Hospital deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Hospital deleted successfully",
                    },
                  },
                },
              },
            },
          },
          "404": { description: "Hospital not found" },
        },
      },
    },
    "/hospitals/postal/{hospital_postal}": {
      get: {
        summary: "Get hospital by postal code",
        tags: ["Hospital"],
        parameters: [
          {
            name: "hospital_postal",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 32000,
          },
        ],
        responses: {
          "200": {
            description: "List of hospitals by postal code",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  example: [
                    {
                      hospitalId: 1,
                      hospitalName: "hospital_name",
                      hospitalCity: "hospital_city",
                      hospitalPostal: 32000,
                      hospitalAdress: "hospital_adress",
                      hospitalLatitude: 48.856614,
                      hospitalLongitude: 2.3522219,
                    },
                  ],
                },
              },
            },
          },
          "404": { description: "No hospital found with this postal code" },
        },
      },
    },
    "/hospitals/city/{city}": {
      get: {
        summary: "Get hospitals by city",
        tags: ["Hospital"],
        parameters: [
          {
            name: "city",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "Nantes",
          },
        ],
        responses: {
          "200": {
            description: "List of hospitals matching city",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      hospitalId: { type: "integer", example: 1 },
                      hospitalName: { type: "string", example: "CHU de Nantes" },
                      hospitalCity: { type: "string", example: "Nantes" },
                      hospitalPostal: { type: "integer", example: 44000 },
                      hospitalAdress: { type: "string", example: "1 rue de l'Hôpital" },
                      hospitalLatitude: { type: "number", example: 47.2184 },
                      hospitalLongitude: { type: "number", example: -1.5536 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
