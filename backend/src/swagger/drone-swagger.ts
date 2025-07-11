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
                      droneCurrentLat: 442,
                      droneCurrentLong: 30,
                      droneBattery: "51%",
                      droneImage: "link/to/image.png",
                    },
                    {
                      droneId: 2,
                      droneName: "Drone Name",
                      centerId: 1,
                      droneStatus: "Flying",
                      droneCurrentLat: 812,
                      droneCurrentLong: 100,
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
                droneCurrentLat: 442,
                droneCurrentLong: 30,
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
  },
};
