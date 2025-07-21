export const adminSwagger: Record<string, any> = {
  paths: {
    // Routes d'administration des centres de don
    '/donation-center-admin/{donationCenterId}/users': {
      get: {
        tags: ['Administration Centre de Don'],
        summary: 'Récupérer les utilisateurs du centre de don',
        description: 'Récupère la liste de tous les utilisateurs associés à un centre de don spécifique',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'donationCenterId',
            in: 'path',
            required: true,
            description: 'ID du centre de don',
            schema: {
              type: 'integer',
              example: 1
            }
          }
        ],
        responses: {
          '200': {
            description: 'Liste des utilisateurs du centre de don récupérée avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer',
                        example: 123
                      },
                      email: {
                        type: 'string',
                        format: 'email',
                        example: 'user@centre-don.com'
                      },
                      first_name: {
                        type: 'string',
                        example: 'Marie'
                      },
                      last_name: {
                        type: 'string',
                        example: 'Martin'
                      },
                      phone: {
                        type: 'string',
                        example: '+33123456789'
                      },
                      role: {
                        type: 'string',
                        example: 'donation_center_admin'
                      },
                      is_admin: {
                        type: 'boolean',
                        example: true
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
            }
          },
          '401': {
            description: 'Token d\'authentification manquant ou invalide'
          },
          '403': {
            description: 'Accès refusé - droits insuffisants pour ce centre de don'
          },
          '404': {
            description: 'Centre de don non trouvé'
          }
        }
      },
      post: {
        tags: ['Administration Centre de Don'],
        summary: 'Inviter un utilisateur au centre de don',
        description: 'Invite un nouvel utilisateur à rejoindre le centre de don avec un rôle spécifique',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'donationCenterId',
            in: 'path',
            required: true,
            description: 'ID du centre de don',
            schema: {
              type: 'integer',
              example: 1
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'first_name', 'last_name', 'role'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'nouvel.user@centre-don.com'
                  },
                  first_name: {
                    type: 'string',
                    example: 'Paul'
                  },
                  last_name: {
                    type: 'string',
                    example: 'Dubois'
                  },
                  phone: {
                    type: 'string',
                    example: '+33123456789'
                  },
                  role: {
                    type: 'string',
                    enum: ['user', 'donation_center_admin'],
                    example: 'user'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Utilisateur invité avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Utilisateur invité avec succès'
                    },
                    user: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer',
                          example: 124
                        },
                        email: {
                          type: 'string',
                          example: 'nouvel.user@centre-don.com'
                        },
                        first_name: {
                          type: 'string',
                          example: 'Paul'
                        },
                        last_name: {
                          type: 'string',
                          example: 'Dubois'
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
          '409': {
            description: 'Email utilisateur déjà existant',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Cet email est déjà utilisé'
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
          }
        }
      }
    },
    '/donation-center-admin/{donationCenterId}/users/{userId}': {
      put: {
        tags: ['Administration Centre de Don'],
        summary: 'Mettre à jour un utilisateur du centre de don',
        description: 'Met à jour les informations d\'un utilisateur associé au centre de don',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'donationCenterId',
            in: 'path',
            required: true,
            description: 'ID du centre de don',
            schema: {
              type: 'integer',
              example: 1
            }
          },
          {
            name: 'userId',
            in: 'path',
            required: true,
            description: 'ID de l\'utilisateur à mettre à jour',
            schema: {
              type: 'integer',
              example: 123
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  first_name: {
                    type: 'string',
                    example: 'Marie'
                  },
                  last_name: {
                    type: 'string',
                    example: 'Martin'
                  },
                  phone: {
                    type: 'string',
                    example: '+33123456789'
                  },
                  role: {
                    type: 'string',
                    enum: ['user', 'donation_center_admin'],
                    example: 'donation_center_admin'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Utilisateur mis à jour avec succès'
          },
          '400': {
            description: 'Données invalides'
          },
          '401': {
            description: 'Token d\'authentification manquant ou invalide'
          },
          '403': {
            description: 'Accès refusé - droits insuffisants'
          },
          '404': {
            description: 'Utilisateur ou centre de don non trouvé'
          }
        }
      },
      delete: {
        tags: ['Administration Centre de Don'],
        summary: 'Supprimer un utilisateur du centre de don',
        description: 'Retire un utilisateur du centre de don et supprime ses accès',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'donationCenterId',
            in: 'path',
            required: true,
            description: 'ID du centre de don',
            schema: {
              type: 'integer',
              example: 1
            }
          },
          {
            name: 'userId',
            in: 'path',
            required: true,
            description: 'ID de l\'utilisateur à supprimer',
            schema: {
              type: 'integer',
              example: 123
            }
          }
        ],
        responses: {
          '200': {
            description: 'Utilisateur supprimé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Utilisateur supprimé du centre de don avec succès'
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
            description: 'Utilisateur ou centre de don non trouvé'
          }
        }
      }
    },
    // Routes d'administration des hôpitaux
    '/hospital-admin/{hospitalId}/users': {
      get: {
        tags: ['Administration Hôpital'],
        summary: 'Récupérer les utilisateurs de l\'hôpital',
        description: 'Récupère la liste de tous les utilisateurs associés à un hôpital spécifique',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'hospitalId',
            in: 'path',
            required: true,
            description: 'ID de l\'hôpital',
            schema: {
              type: 'integer',
              example: 1
            }
          }
        ],
        responses: {
          '200': {
            description: 'Liste des utilisateurs de l\'hôpital récupérée avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer',
                        example: 123
                      },
                      email: {
                        type: 'string',
                        format: 'email',
                        example: 'medecin@hopital.com'
                      },
                      first_name: {
                        type: 'string',
                        example: 'Dr. Pierre'
                      },
                      last_name: {
                        type: 'string',
                        example: 'Durand'
                      },
                      phone: {
                        type: 'string',
                        example: '+33123456789'
                      },
                      role: {
                        type: 'string',
                        example: 'hospital_admin'
                      },
                      is_admin: {
                        type: 'boolean',
                        example: true
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
            }
          },
          '401': {
            description: 'Token d\'authentification manquant ou invalide'
          },
          '403': {
            description: 'Accès refusé - droits insuffisants pour cet hôpital'
          },
          '404': {
            description: 'Hôpital non trouvé'
          }
        }
      },
      post: {
        tags: ['Administration Hôpital'],
        summary: 'Inviter un utilisateur à l\'hôpital',
        description: 'Invite un nouvel utilisateur à rejoindre l\'hôpital avec un rôle spécifique',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'hospitalId',
            in: 'path',
            required: true,
            description: 'ID de l\'hôpital',
            schema: {
              type: 'integer',
              example: 1
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'first_name', 'last_name', 'role'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'nouveau.medecin@hopital.com'
                  },
                  first_name: {
                    type: 'string',
                    example: 'Dr. Anne'
                  },
                  last_name: {
                    type: 'string',
                    example: 'Moreau'
                  },
                  phone: {
                    type: 'string',
                    example: '+33123456789'
                  },
                  role: {
                    type: 'string',
                    enum: ['user', 'hospital_admin'],
                    example: 'user'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Utilisateur invité avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Utilisateur invité avec succès'
                    },
                    user: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer',
                          example: 124
                        },
                        email: {
                          type: 'string',
                          example: 'nouveau.medecin@hopital.com'
                        },
                        first_name: {
                          type: 'string',
                          example: 'Dr. Anne'
                        },
                        last_name: {
                          type: 'string',
                          example: 'Moreau'
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
          '409': {
            description: 'Email utilisateur déjà existant',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Cet email est déjà utilisé'
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
          }
        }
      }
    },
    '/hospital-admin/{hospitalId}/users/{userId}': {
      put: {
        tags: ['Administration Hôpital'],
        summary: 'Mettre à jour un utilisateur de l\'hôpital',
        description: 'Met à jour les informations d\'un utilisateur associé à l\'hôpital',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'hospitalId',
            in: 'path',
            required: true,
            description: 'ID de l\'hôpital',
            schema: {
              type: 'integer',
              example: 1
            }
          },
          {
            name: 'userId',
            in: 'path',
            required: true,
            description: 'ID de l\'utilisateur à mettre à jour',
            schema: {
              type: 'integer',
              example: 123
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  first_name: {
                    type: 'string',
                    example: 'Dr. Pierre'
                  },
                  last_name: {
                    type: 'string',
                    example: 'Durand'
                  },
                  phone: {
                    type: 'string',
                    example: '+33123456789'
                  },
                  role: {
                    type: 'string',
                    enum: ['user', 'hospital_admin'],
                    example: 'hospital_admin'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Utilisateur mis à jour avec succès'
          },
          '400': {
            description: 'Données invalides'
          },
          '401': {
            description: 'Token d\'authentification manquant ou invalide'
          },
          '403': {
            description: 'Accès refusé - droits insuffisants'
          },
          '404': {
            description: 'Utilisateur ou hôpital non trouvé'
          }
        }
      },
      delete: {
        tags: ['Administration Hôpital'],
        summary: 'Supprimer un utilisateur de l\'hôpital',
        description: 'Retire un utilisateur de l\'hôpital et supprime ses accès',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'hospitalId',
            in: 'path',
            required: true,
            description: 'ID de l\'hôpital',
            schema: {
              type: 'integer',
              example: 1
            }
          },
          {
            name: 'userId',
            in: 'path',
            required: true,
            description: 'ID de l\'utilisateur à supprimer',
            schema: {
              type: 'integer',
              example: 123
            }
          }
        ],
        responses: {
          '200': {
            description: 'Utilisateur supprimé avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Utilisateur supprimé de l\'hôpital avec succès'
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
            description: 'Utilisateur ou hôpital non trouvé'
          }
        }
      }
    }
  }
};