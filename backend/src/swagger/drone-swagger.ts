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
    "/drones/status": {
      get: {
        summary: "Get all drones status",
        tags: ["Drone"],
        responses: { "200": { description: "Statuses" } },
      },
    },
    "/drones/history": {
      get: {
        summary: "Get drones history with deliveries",
        tags: ["Drone"],
        responses: { "200": { description: "Aggregated history" } },
      },
    },
    "/drones/center/{centerId}": {
      get: {
        summary: "Get drones by center ID",
        tags: ["Drone"],
        parameters: [ { name: "centerId", in: "path", required: true, schema: { type: "integer" }, example: 1 } ],
        responses: { "200": { description: "List of drones for center" }, "404": { description: "Not found" } },
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
    "/drones/{id}/flight_info": {
      get: {
        summary: "Get real-time flight info",
        tags: ["Drone"],
        parameters: [ { name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 } ],
        responses: { "200": { description: "Flight info" }, "400": { description: "Invalid ID" } },
      },
    },
    "/drones/{id}/sync": {
      post: {
        summary: "Force sync drone",
        tags: ["Drone"],
        parameters: [ { name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 } ],
        responses: { "200": { description: "Drone synced successfully" }, "400": { description: "Failed to sync" } },
      },
    },
    "/drones/{id}/mission/create": {
      post: {
        summary: "Create a mission",
        tags: ["Drone"],
        parameters: [ { name: "id", in: "path", required: true, schema: { type: "integer" } } ],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "201": { description: "Mission created" }, "400": { description: "Invalid input" } },
      },
    },
    "/drones/{id}/mission/start": {
      post: {
        summary: "Start mission",
        tags: ["Drone"],
        parameters: [ { name: "id", in: "path", required: true, schema: { type: "integer" } } ],
        responses: { "200": { description: "Started" }, "400": { description: "Error" } },
      },
    },
    "/drones/{id}/return-home": {
      post: {
        summary: "Return to home",
        tags: ["Drone"],
        parameters: [ { name: "id", in: "path", required: true, schema: { type: "integer" } } ],
        responses: { "200": { description: "OK" }, "400": { description: "Error" } },
      },
    },
    "/drones/{id}/mission/modify": {
      post: {
        summary: "Modify mission",
        tags: ["Drone"],
        parameters: [ { name: "id", in: "path", required: true, schema: { type: "integer" } } ],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "200": { description: "Modified" }, "400": { description: "Error" } },
      },
    },
    "/drones/{id}/delivery-mission": {
      post: {
        summary: "Create delivery mission",
        tags: ["Drone"],
        parameters: [ { name: "id", in: "path", required: true, schema: { type: "integer" } } ],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "200": { description: "OK" }, "400": { description: "Error" } },
      },
    },
    "/drones/{id}/command": {
      post: {
        summary: "Change flight mode",
        tags: ["Drone"],
        parameters: [ { name: "id", in: "path", required: true, schema: { type: "integer" } } ],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { mode: { type: "string" } }, required: ["mode"] } } } },
        responses: { "200": { description: "OK" }, "400": { description: "Error" } },
      },
    },
    "/drones/{id}/mission/send": {
      post: {
        summary: "Send mission file",
        tags: ["Drone"],
        parameters: [ { name: "id", in: "path", required: true, schema: { type: "integer" } } ],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { filename: { type: "string" } }, required: ["filename"] } } } },
        responses: { "200": { description: "OK" }, "400": { description: "Error" } },
      },
    },
    "/drones/{id}/mission/current": {
      get: {
        summary: "Get current mission",
        tags: ["Drone"],
        parameters: [ { name: "id", in: "path", required: true, schema: { type: "integer" } } ],
        responses: { "200": { description: "Current mission" }, "400": { description: "Error" } },
      },
    },
  },
};
