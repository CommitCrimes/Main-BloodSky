export const dashboardSwagger: Record<string, any> = {
  paths: {
    '/dashboard/delivery-stats': {
      get: {
        tags: ['Dashboard'],
        summary: 'Récupérer les statistiques de livraisons',
        description: 'Récupère des statistiques détaillées sur les livraisons pour le tableau de bord (nécessite une authentification)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Statistiques de livraisons récupérées avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalDeliveries: {
                      type: 'integer',
                      example: 1247,
                      description: 'Nombre total de livraisons'
                    },
                    deliveriesThisMonth: {
                      type: 'integer',
                      example: 89,
                      description: 'Nombre de livraisons ce mois-ci'
                    },
                    pendingDeliveries: {
                      type: 'integer',
                      example: 15,
                      description: 'Nombre de livraisons en attente'
                    },
                    completedDeliveries: {
                      type: 'integer',
                      example: 1156,
                      description: 'Nombre de livraisons terminées'
                    },
                    cancelledDeliveries: {
                      type: 'integer',
                      example: 76,
                      description: 'Nombre de livraisons annulées'
                    },
                    averageDeliveryTime: {
                      type: 'number',
                      format: 'float',
                      example: 45.5,
                      description: 'Temps moyen de livraison en minutes'
                    },
                    deliveriesByUrgency: {
                      type: 'object',
                      properties: {
                        low: {
                          type: 'integer',
                          example: 312
                        },
                        medium: {
                          type: 'integer',
                          example: 567
                        },
                        high: {
                          type: 'integer',
                          example: 234
                        },
                        critical: {
                          type: 'integer',
                          example: 134
                        }
                      }
                    },
                    deliveriesByBloodType: {
                      type: 'object',
                      properties: {
                        'O+': {
                          type: 'integer',
                          example: 298
                        },
                        'O-': {
                          type: 'integer',
                          example: 187
                        },
                        'A+': {
                          type: 'integer',
                          example: 234
                        },
                        'A-': {
                          type: 'integer',
                          example: 156
                        },
                        'B+': {
                          type: 'integer',
                          example: 167
                        },
                        'B-': {
                          type: 'integer',
                          example: 89
                        },
                        'AB+': {
                          type: 'integer',
                          example: 78
                        },
                        'AB-': {
                          type: 'integer',
                          example: 38
                        }
                      }
                    },
                    recentDeliveries: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'integer',
                            example: 1247
                          },
                          bloodType: {
                            type: 'string',
                            example: 'O+'
                          },
                          quantity: {
                            type: 'integer',
                            example: 5
                          },
                          urgency: {
                            type: 'string',
                            example: 'high'
                          },
                          status: {
                            type: 'string',
                            example: 'completed'
                          },
                          hospitalName: {
                            type: 'string',
                            example: 'Hôpital Nantais'
                          },
                          deliveryDate: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-03-15T14:30:00Z'
                          },
                          droneId: {
                            type: 'integer',
                            example: 42
                          }
                        }
                      },
                      description: 'Liste des 5 dernières livraisons'
                    },
                    monthlyTrend: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          month: {
                            type: 'string',
                            example: '2024-03'
                          },
                          deliveries: {
                            type: 'integer',
                            example: 89
                          },
                          averageTime: {
                            type: 'number',
                            format: 'float',
                            example: 43.2
                          }
                        }
                      },
                      description: 'Tendance des livraisons sur les 12 derniers mois'
                    },
                    activeDrones: {
                      type: 'integer',
                      example: 23,
                      description: 'Nombre de drones actuellement actifs'
                    },
                    availableDrones: {
                      type: 'integer',
                      example: 8,
                      description: 'Nombre de drones disponibles'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Token d\'authentification manquant ou invalide',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Token manquant ou invalide'
                    }
                  }
                }
              }
            }
          },
          '403': {
            description: 'Accès refusé - droits insuffisants pour accéder aux statistiques',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Accès refusé - droits insuffisants'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};