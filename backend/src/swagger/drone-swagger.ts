export const droneSwagger: Record<string, any> = {
  paths: {
    "/drones": {
      get: {
        summary: "Get all drones",
        tags: ["Drone"],
        responses: {
          "200": {
            description: "List of drones",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  example: [
                    {
                      droneId: 1,
                      droneName: "Drone Name",
                      centerId: 1,
                      droneStatus: "Flying",
                      droneCurrentLat: 47218400,
                      droneCurrentLong: -1553600,
                      droneBattery: "51%",
                      droneImage: "link/to/image.png",
                    },
                    {
                      droneId: 2,
                      droneName: "Drone Name",
                      centerId: 1,
                      droneStatus: "Flying",
                      droneCurrentLat: 47220000,
                      droneCurrentLong: -1550000,
                      droneBattery: "92%",
                      droneImage: "link/to/image.png",
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new drone",
        tags: ["Drone"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                droneId: 1,
                droneName: "Drone Name",
                centerId: 1,
                droneStatus: "Flying",
                droneCurrentLat: 47218400,
                droneCurrentLong: -1553600,
                droneBattery: "51%",
                droneImage: "link/to/image.png",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Drone created successfully",
            content: {
              "application/json": {
                example: {
                  droneId: 1,
                  droneName: "Drone Name",
                  centerId: 1,
                  droneStatus: "Flying",
                  droneCurrentLat: 442,
                  droneCurrentLong: 30,
                  droneBattery: "51%",
                  droneImage: "link/to/image.png",
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
    "/drones/{droneId}": {
      get: {
        summary: "Get drone by ID",
        tags: ["Drone"],
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
            description: "Drone details",
            content: {
              "application/json": {
                example: {
                  droneId: 1,
                  droneName: "Drone Name",
                  centerId: 1,
                  droneStatus: "Flying",
                  droneCurrentLat: 442,
                  droneCurrentLong: 30,
                  droneBattery: "51%",
                  droneImage: "link/to/image.png",
                },
              },
            },
          },
          "404": {
            description: "Drone not found",
          },
        },
      },
      put: {
        summary: "Update drone by ID",
        tags: ["Drone"],
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
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                droneId: 1,
                droneName: "Drone Name",
                centerId: 1,
                droneStatus: "Flying",
                droneCurrentLat: 47218400,
                droneCurrentLong: -1553600,
                droneBattery: "51%",
                droneImage: "link/to/image.png",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Drone sample updated",
            content: {
              "application/json": {
                example: {
                  droneId: 1,
                  droneName: "Drone Name",
                  centerId: 1,
                  droneStatus: "Flying",
                  droneCurrentLat: 442,
                  droneCurrentLong: 30,
                  droneBattery: "51%",
                  droneImage: "link/to/image.png",
                },
              },
            },
          },
          "400": { description: "Invalid input" },
          "404": { description: "Drone not found" },
        },
      },
      delete: {
        summary: "Delete drone by ID",
        tags: ["Drone"],
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
            description: "Drone deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Drone deleted successfully",
                    },
                  },
                },
              },
            },
          },
          "404": { description: "Drone not found" },
        },
      },
    },
    "/drones/center/{centerId}": {
      get: {
        summary: "Get drones by centerId",
        tags: ["Drone"],
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
            description: "List of drones linked by this centerId",
            content: {
              "application/json": {
                example: [
                  {
                    droneId: 1,
                    droneName: "Drone Name",
                    centerId: 2,
                    droneStatus: "Flying",
                    droneCurrentLat: 442,
                    droneCurrentLong: 30,
                    droneBattery: "51%",
                    droneImage: "link/to/image.png",
                  },
                  {
                    droneId: 2,
                    droneName: "Drone Name",
                    centerId: 2,
                    droneStatus: "Charging",
                    droneCurrentLat: 0,
                    droneCurrentLong: 0,
                    droneBattery: "81%",
                    droneImage: "link/to/image.png",
                  },
                ],
              },
            },
          },
          "404": {
            description: "Center not found"
          }
        },
      },
    },
  },
};
