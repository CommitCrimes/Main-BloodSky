export const notificationSwagger: Record<string, any> = {
  paths: {
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Récupérer les notifications de l\'utilisateur',
        description: 'Récupère toutes les notifications associées à l\'utilisateur connecté',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Liste des notifications récupérée avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer',
                        example: 1
                      },
                      user_id: {
                        type: 'integer',
                        example: 123
                      },
                      title: {
                        type: 'string',
                        example: 'Nouvelle livraison disponible'
                      },
                      message: {
                        type: 'string',
                        example: 'Une nouvelle livraison de sang O+ est disponible'
                      },
                      type: {
                        type: 'string',
                        example: 'delivery'
                      },
                      read: {
                        type: 'boolean',
                        example: false
                      },
                      created_at: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-03-15T10:30:00Z'
                      },
                      updated_at: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-03-15T10:30:00Z'
                      }
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
          }
        }
      }
    },
    '/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Obtenir le nombre de notifications non lues',
        description: 'Retourne le nombre total de notifications non lues pour l\'utilisateur connecté',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Nombre de notifications non lues récupéré avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    unreadCount: {
                      type: 'integer',
                      example: 5,
                      description: 'Nombre de notifications non lues'
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
          }
        }
      }
    },
    '/notifications/{id}/read': {
      post: {
        tags: ['Notifications'],
        summary: 'Marquer une notification comme lue',
        description: 'Marque une notification spécifique comme lue pour l\'utilisateur connecté',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID de la notification à marquer comme lue',
            schema: {
              type: 'integer',
              example: 1
            }
          }
        ],
        responses: {
          '200': {
            description: 'Notification marquée comme lue avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Notification marquée comme lue'
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
          '404': {
            description: 'Notification non trouvée',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Notification non trouvée'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/notifications/mark-all-read': {
      post: {
        tags: ['Notifications'],
        summary: 'Marquer toutes les notifications comme lues',
        description: 'Marque toutes les notifications non lues de l\'utilisateur connecté comme lues',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Toutes les notifications marquées comme lues avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Toutes les notifications ont été marquées comme lues'
                    },
                    updatedCount: {
                      type: 'integer',
                      example: 8,
                      description: 'Nombre de notifications mises à jour'
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
          }
        }
      }
    }
  }
};