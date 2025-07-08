export const hospitalSwagger: Record<string, any> = {
  paths: {
    "/hospital": {
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
    "/hospital/{hospitalId}": {
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
          "404": { description: "Not found" },
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
          "404": { description: "Not found" },
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
          "404": { description: "Not found" },
        },
      },
    },
    "hospital/postal/{hospital_postal}": {
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
          "404": { description: "Not found" },
        },
      },
    },
  },
};
