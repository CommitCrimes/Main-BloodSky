export const profileSwagger: Record<string, any> = {
  paths: {
    '/users/profile/me': {
      get: {
        tags: ['Profil Utilisateur'],
        summary: 'Récupérer mon profil',
        description: 'Récupère le profil complet de l\'utilisateur connecté avec ses informations détaillées selon son rôle',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Profil utilisateur récupéré avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      example: 123
                    },
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'user@example.com'
                    },
                    user_name: {
                      type: 'string',
                      example: 'Dupont'
                    },
                    user_firstname: {
                      type: 'string',
                      example: 'Jean'
                    },
                    tel_number: {
                      type: 'integer',
                      example: 123456789
                    },
                    role: {
                      type: 'string',
                      enum: ['user', 'admin', 'dronist', 'hospital_admin', 'donation_center_admin'],
                      example: 'dronist'
                    },
                    created_at: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-03-15T10:30:00Z'
                    },
                    hospital: {
                      type: 'object',
                      nullable: true,
                      properties: {
                        id: {
                          type: 'integer',
                          example: 1
                        },
                        name: {
                          type: 'string',
                          example: 'Hôpital Nantais'
                        },
                        address: {
                          type: 'string',
                          example: '1 Place Alexis Ricordeau'
                        }
                      }
                    },
                    donationCenter: {
                      type: 'object',
                      nullable: true,
                      properties: {
                        id: {
                          type: 'integer',
                          example: 1
                        },
                        name: {
                          type: 'string',
                          example: 'Centre de Don Nantais'
                        },
                        address: {
                          type: 'string',
                          example: '15 Rue de la Paix'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Token d\'authentification manquant ou invalide'
          }
        }
      },
      put: {
        tags: ['Profil Utilisateur'],
        summary: 'Mettre à jour mon profil',
        description: 'Met à jour les informations du profil de l\'utilisateur connecté',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user_name: {
                    type: 'string',
                    example: 'Dupont'
                  },
                  user_firstname: {
                    type: 'string',
                    example: 'Jean'
                  },
                  tel_number: {
                    type: 'integer',
                    example: 123456789
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Profil mis à jour avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Profil mis à jour avec succès'
                    },
                    user: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer',
                          example: 123
                        },
                        first_name: {
                          type: 'string',
                          example: 'Jean'
                        },
                        last_name: {
                          type: 'string',
                          example: 'Dupont'
                        },
                        phone: {
                          type: 'string',
                          example: '+33123456789'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Données invalides'
          },
          '401': {
            description: 'Token d\'authentification manquant ou invalide'
          }
        }
      }
    },
    '/users/profile/change-password': {
      put: {
        tags: ['Profil Utilisateur'],
        summary: 'Changer le mot de passe',
        description: 'Permet à l\'utilisateur connecté de changer son mot de passe en fournissant l\'ancien et le nouveau',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: {
                    type: 'string',
                    format: 'password',
                    example: 'ancien_mot_de_passe'
                  },
                  newPassword: {
                    type: 'string',
                    format: 'password',
                    minLength: 8,
                    example: 'nouveau_mot_de_passe_securise'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Mot de passe changé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Mot de passe changé avec succès'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Ancien mot de passe incorrect ou nouveau mot de passe invalide',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Ancien mot de passe incorrect'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Token d\'authentification manquant ou invalide'
          }
        }
      }
    },
    '/users/profile/hospital/coordinates': {
      put: {
        tags: ['Profil Utilisateur'],
        summary: 'Mettre à jour les coordonnées de l\'hôpital',
        description: 'Met à jour les coordonnées GPS de l\'hôpital associé à l\'utilisateur connecté',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['latitude', 'longitude'],
                properties: {
                  latitude: {
                    type: 'number',
                    format: 'float',
                    minimum: -90,
                    maximum: 90,
                    example: 47.2184
                  },
                  longitude: {
                    type: 'number',
                    format: 'float',
                    minimum: -180,
                    maximum: 180,
                    example: -1.5536
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Coordonnées de l\'hôpital mises à jour avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Coordonnées de l\'hôpital mises à jour avec succès'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Coordonnées invalides'
          },
          '401': {
            description: 'Token d\'authentification manquant ou invalide'
          },
          '403': {
            description: 'Utilisateur non autorisé à modifier les coordonnées de l\'hôpital'
          }
        }
      }
    },
    '/users/profile/center/coordinates': {
      put: {
        tags: ['Profil Utilisateur'],
        summary: 'Mettre à jour les coordonnées du centre de don',
        description: 'Met à jour les coordonnées GPS du centre de don associé à l\'utilisateur connecté',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['latitude', 'longitude'],
                properties: {
                  latitude: {
                    type: 'number',
                    format: 'float',
                    minimum: -90,
                    maximum: 90,
                    example: 47.2184
                  },
                  longitude: {
                    type: 'number',
                    format: 'float',
                    minimum: -180,
                    maximum: 180,
                    example: -1.5536
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Coordonnées du centre de don mises à jour avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Coordonnées du centre de don mises à jour avec succès'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Coordonnées invalides'
          },
          '401': {
            description: 'Token d\'authentification manquant ou invalide'
          },
          '403': {
            description: 'Utilisateur non autorisé à modifier les coordonnées du centre de don'
          }
        }
      }
    },
    '/users/profile/{userId}': {
      get: {
        tags: ['Profil Utilisateur'],
        summary: 'Récupérer un profil utilisateur par ID',
        description: 'Récupère le profil d\'un utilisateur spécifique par son ID (accessible aux administrateurs)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            description: 'ID de l\'utilisateur dont récupérer le profil',
            schema: {
              type: 'integer',
              example: 123
            }
          }
        ],
        responses: {
          '200': {
            description: 'Profil utilisateur récupéré avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      example: 123
                    },
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'user@example.com'
                    },
                    user_name: {
                      type: 'string',
                      example: 'Dupont'
                    },
                    user_firstname: {
                      type: 'string',
                      example: 'Jean'
                    },
                    tel_number: {
                      type: 'integer',
                      example: 123456789
                    },
                    role: {
                      type: 'string',
                      example: 'dronist'
                    },
                    created_at: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-03-15T10:30:00Z'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Token d\'authentification manquant ou invalide'
          },
          '403': {
            description: 'Accès refusé - droits insuffisants'
          },
          '404': {
            description: 'Utilisateur non trouvé'
          }
        }
      }
    }
  }
};