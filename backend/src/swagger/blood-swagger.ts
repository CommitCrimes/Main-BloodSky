export const bloodSwagger: Record<string, any> = {
  paths: {
    "/blood/available": {
      get: {
        summary: "Obtenir le stock sanguin disponible",
        description: "Récupère les quantités disponibles pour chaque type de sang dans le système",
        tags: ["Blood"],
        responses: {
          "200": {
            description: "Stock sanguin disponible récupéré avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  example: {
                    "O+": 25,
                    "O-": 18,
                    "A+": 32,
                    "A-": 15,
                    "B+": 22,
                    "B-": 8,
                    "AB+": 12,
                    "AB-": 5
                  }
                }
              }
            }
          }
        }
      }
    },
    "/blood/stats": {
      get: {
        summary: "Obtenir les statistiques du stock sanguin",
        description: "Récupère des statistiques détaillées sur le stock sanguin (total, par type, tendances)",
        tags: ["Blood"],
        responses: {
          "200": {
            description: "Statistiques du stock sanguin récupérées avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  example: {
                    totalStock: 137,
                    byType: {
                      "O+": { available: 25, percentage: 18.2 },
                      "O-": { available: 18, percentage: 13.1 },
                      "A+": { available: 32, percentage: 23.4 },
                      "A-": { available: 15, percentage: 10.9 }
                    },
                    lastUpdate: "2024-03-15T14:30:00Z"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/blood/order": {
      post: {
        summary: "Passer une commande de sang",
        description: "Permet de passer une commande de sang d'un type spécifique avec une quantité donnée",
        tags: ["Blood"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["bloodType", "quantity", "hospitalId", "urgency"],
                properties: {
                  bloodType: {
                    type: "string",
                    enum: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
                    example: "O+"
                  },
                  quantity: {
                    type: "integer",
                    minimum: 1,
                    example: 5
                  },
                  hospitalId: {
                    type: "integer",
                    example: 1
                  },
                  urgency: {
                    type: "string",
                    enum: ["low", "medium", "high", "critical"],
                    example: "high"
                  },
                  notes: {
                    type: "string",
                    example: "Commande urgente pour chirurgie"
                  }
                }
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Commande de sang créée avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  example: {
                    orderId: 156,
                    bloodType: "O+",
                    quantity: 5,
                    hospitalId: 1,
                    urgency: "high",
                    status: "pending",
                    estimatedDelivery: "2024-03-15T16:00:00Z",
                    deliveryId: 789
                  }
                }
              }
            }
          },
          "400": {
            description: "Données de commande invalides"
          },
          "409": {
            description: "Stock insuffisant pour cette commande"
          }
        }
      }
    },
    "/blood/cancel-order/{deliveryId}": {
      post: {
        summary: "Annuler une commande de sang",
        description: "Annule une commande de sang existante en utilisant l'ID de livraison",
        tags: ["Blood"],
        parameters: [
          {
            name: "deliveryId",
            in: "path",
            required: true,
            description: "ID de la livraison à annuler",
            schema: {
              type: "integer",
              example: 789
            }
          }
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  reason: {
                    type: "string",
                    example: "Plus besoin - intervention reportée"
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Commande annulée avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Commande annulée avec succès"
                    },
                    deliveryId: {
                      type: "integer",
                      example: 789
                    },
                    status: {
                      type: "string",
                      example: "cancelled"
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Impossible d'annuler cette commande"
          },
          "404": {
            description: "Commande non trouvée"
          }
        }
      }
    },
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
