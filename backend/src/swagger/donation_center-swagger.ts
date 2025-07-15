export const donation_centerSwagger: Record<string, any> = {
  paths: {
    "/donation-centers": {
      get: {
        summary: "Get all donation-centers",
        tags: ["Donation-center"],
        responses: {
          "200": {
            description: "List of donation-centers",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  example: [
                    {
                      centerId: 1,
                      centerCity: "Donation-center City",
                      centerPostal: 75001,
                      centerAdress: "30 rue du poivre",
                      centerLatitude: 442,
                      centerLongitude: 30,
                    },
                    {
                      centerId: 2,
                      centerCity: "Donation-center City",
                      centerPostal: 75001,
                      centerAdress: "33 rue du poivre",
                      centerLatitude: 472,
                      centerLongitude: 40,
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new center",
        tags: ["Donation-center"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                centerId: 1,
                centerCity: "Donation-center City",
                centerPostal: 75001,
                centerAdress: "30 rue du poivre",
                centerLatitude: 442,
                centerLongitude: 30,
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Donation-center created successfully",
            content: {
              "application/json": {
                example: {
                  centerId: 1,
                  centerCity: "Donation-center City",
                  centerPostal: 75001,
                  centerAdress: "30 rue du poivre",
                  centerLatitude: 442,
                  centerLongitude: 30,
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
    "/donation-centers/{centerId}": {
      get: {
        summary: "Get center by ID",
        tags: ["Donation-center"],
        parameters: [
          {
            name: "centerId",
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
            description: "Donation-center details",
            content: {
              "application/json": {
                example: {
                  centerId: 1,
                  centerCity: "Donation-center City",
                  centerPostal: 75001,
                  centerAdress: "30 rue du poivre",
                  centerLatitude: 442,
                  centerLongitude: 30,
                },
              },
            },
          },
        },
      },
      put: {
        summary: "Update center by ID",
        tags: ["Donation-center"],
        parameters: [
          {
            name: "centerId",
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
                centerId: 1,
                centerCity: "Donation-center City",
                centerPostal: 75001,
                centerAdress: "30 rue du poivre",
                centerLatitude: 442,
                centerLongitude: 30,
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete center by ID",
        tags: ["Donation-center"],
        parameters: [
          {
            name: "centerId",
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
    "/donation-centers/postal/{center_postal}": {
      get: {
        summary: "Get center by postal code",
        tags: ["Donation-center"],
        parameters: [
          {
            name: "center_postal",
            in: "path",
            required: true,
            schema: { type: "integer" },
            example: 32000,
          },
        ],
        responses: {
          "200": {
            description: "List of centers by postal code",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  example: [
                    {
                      centerId: 1,
                      centerCity: "Donation-center City",
                      centerPostal: 75001,
                      centerAdress: "30 rue du poivre",
                      centerLatitude: 442,
                      centerLongitude: 30,
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
