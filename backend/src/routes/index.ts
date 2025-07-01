import { Hono } from 'hono';
import { authRouter } from './auth.routes';
import { deliveryRouter } from './delivery';
import { bloodRouter } from './blood';
import { droneRouter } from './drone';
import { hospitalRouter } from './hospital';
import { donationCenterRouter } from './donation_center';
import { userRouter } from './user';
import { entitiesRouter } from './entities.routes';
import { superAdminRouter } from './superadmin.routes';
import { swaggerUI } from '@hono/swagger-ui';

export const createRouter = () => {
  const api = new Hono();

  // Documentation Swagger complète
  api.get('/docs', (c) => c.json({
    openapi: '3.0.0',
    info: {
      title: 'BloodSky API',
      version: '1.0.0',
      description: 'BloodSky - API for blood delivery drone management',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication. Use the token received from login endpoint.'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            userId: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            userName: { type: 'string' },
            userFirstname: { type: 'string' },
            telNumber: { type: 'integer' },
            userStatus: { type: 'string', enum: ['active', 'pending', 'suspended'] }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'userName', 'userFirstname'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            userName: { type: 'string', minLength: 2 },
            userFirstname: { type: 'string', minLength: 2 },
            telNumber: { type: 'integer' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' }
          }
        },
        InviteUserRequest: {
          type: 'object',
          required: ['email', 'userName', 'userFirstname'],
          properties: {
            email: { type: 'string', format: 'email' },
            userName: { type: 'string', minLength: 2 },
            userFirstname: { type: 'string', minLength: 2 },
            telNumber: { type: 'integer' }
          }
        },
        UpdatePasswordRequest: {
          type: 'object',
          required: ['token', 'tempPassword', 'newPassword', 'confirmPassword'],
          properties: {
            token: { type: 'string' },
            tempPassword: { type: 'string' },
            newPassword: { 
              type: 'string', 
              minLength: 8,
              pattern: '^(?=.*[A-Z])(?=.*[0-9]).{8,}$',
              description: 'Must contain at least 8 characters, 1 uppercase letter and 1 digit'
            },
            confirmPassword: { type: 'string' }
          }
        },
        InviteAdminRequest: {
          type: 'object',
          required: ['email', 'userName', 'userFirstname', 'entityType', 'entityId', 'admin'],
          properties: {
            email: { type: 'string', format: 'email' },
            userName: { type: 'string', minLength: 2 },
            userFirstname: { type: 'string', minLength: 2 },
            telNumber: { type: 'integer' },
            entityType: { type: 'string', enum: ['donation_center', 'hospital'] },
            entityId: { type: 'integer' },
            admin: { type: 'boolean' },
            info: { type: 'string' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        DonationCenter: {
          type: 'object',
          properties: {
            centerId: { type: 'integer' },
            centerCity: { type: 'string' },
            centerPostal: { type: 'integer' },
            centerAdress: { type: 'string' },
            centerLatitude: { type: 'number', format: 'decimal' },
            centerLongitude: { type: 'number', format: 'decimal' }
          }
        },
        Hospital: {
          type: 'object',
          properties: {
            hospitalId: { type: 'integer' },
            hospitalName: { type: 'string' },
            hospitalCity: { type: 'string' },
            hospitalPostal: { type: 'integer' },
            hospitalAdress: { type: 'string' },
            hospitalLatitude: { type: 'number', format: 'decimal' },
            hospitalLongitude: { type: 'number', format: 'decimal' }
          }
        },
        Admin: {
          type: 'object',
          properties: {
            userId: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'admin@hospital.fr' },
            userName: { type: 'string', example: 'Dupont' },
            userFirstname: { type: 'string', example: 'Jean' },
            userStatus: { type: 'string', example: 'active' },
            dteCreate: { type: 'string', format: 'date-time', example: '2024-01-01T12:00:00Z' },
            telNumber: { type: 'integer', nullable: true, example: 123456789 },
            entityType: { type: 'string', enum: ['donation_center', 'hospital'], example: 'hospital' },
            entityId: { type: 'integer', example: 1 },
            entityName: { type: 'string', example: 'CHU de Nantes' },
            admin: { type: 'boolean', example: true },
            info: { type: 'string', nullable: true, example: 'Administrateur principal' }
          }
        },
        UpdateAdmin: {
          type: 'object',
          properties: {
            userName: { type: 'string', example: 'Dupont' },
            userFirstname: { type: 'string', example: 'Jean' },
            telNumber: { type: 'integer', example: 123456789 },
            userStatus: { type: 'string', enum: ['active', 'suspended', 'pending'], example: 'active' },
            admin: { type: 'boolean', example: true },
            info: { type: 'string', example: 'Administrateur principal' }
          }
        },
        DeliveryHistory: {
          type: 'object',
          properties: {
            deliveryId: { type: 'integer', example: 1 },
            droneId: { type: 'integer', nullable: true, example: 1 },
            droneName: { type: 'string', nullable: true, example: 'Drone-001' },
            bloodId: { type: 'integer', nullable: true, example: 1 },
            bloodType: { type: 'string', nullable: true, example: 'O+' },
            hospitalId: { type: 'integer', nullable: true, example: 1 },
            hospitalName: { type: 'string', nullable: true, example: 'CHU de Nantes' },
            centerId: { type: 'integer', nullable: true, example: 1 },
            centerCity: { type: 'string', nullable: true, example: 'Nantes' },
            dteDelivery: { type: 'string', format: 'date-time', nullable: true, example: '2024-01-01T14:00:00Z' },
            dteValidation: { type: 'string', format: 'date-time', nullable: true, example: '2024-01-01T14:30:00Z' },
            deliveryStatus: { type: 'string', nullable: true, example: 'completed' },
            deliveryUrgent: { type: 'boolean', nullable: true, example: true }
          }
        },
        Statistics: {
          type: 'object',
          properties: {
            overview: {
              type: 'object',
              properties: {
                totalUsers: { type: 'integer', example: 150 },
                totalHospitals: { type: 'integer', example: 6 },
                totalCenters: { type: 'integer', example: 1 },
                totalDeliveries: { type: 'integer', example: 89 },
                totalDrones: { type: 'integer', example: 5 },
                urgentDeliveries: { type: 'integer', example: 12 }
              }
            },
            deliveriesByStatus: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'completed' },
                  count: { type: 'integer', example: 45 }
                }
              }
            }
          }
        }
      }
    },
    paths: {
      '/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' }
              }
            }
          },
          responses: {
            '201': {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' }
                }
              }
            },
            '409': { description: 'User already exists' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/auth/login': {
        post: {
          summary: 'Login a user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' }
                }
              }
            },
            '401': { description: 'Invalid credentials' },
            '403': { description: 'Account suspended' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/auth/invite': {
        post: {
          summary: 'Invite a new user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/InviteUserRequest' }
              }
            }
          },
          responses: {
            '201': {
              description: 'Invitation sent successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      userId: { type: 'integer' },
                      email: { type: 'string' }
                    }
                  }
                }
              }
            },
            '409': { description: 'User already exists' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/auth/update-password': {
        post: {
          summary: 'Update password with token',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdatePasswordRequest' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Password updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' }
                    }
                  }
                }
              }
            },
            '401': { description: 'Invalid temporary password' },
            '404': { description: 'Invalid token' },
            '410': { description: 'Token expired or already used' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/auth/invite-admin': {
        post: {
          summary: 'Invite an admin for a hospital or donation center',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/InviteAdminRequest' }
              }
            }
          },
          responses: {
            '201': {
              description: 'Admin invitation sent successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      userId: { type: 'integer' },
                      email: { type: 'string' },
                      entityType: { type: 'string' },
                      entityId: { type: 'integer' }
                    }
                  }
                }
              }
            },
            '409': { description: 'User already exists' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/donation-centers': {
        get: {
          summary: 'Get all donation centers',
          tags: ['Entities'],
          responses: {
            '200': {
              description: 'List of donation centers',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/DonationCenter' }
                  }
                }
              }
            },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/hospitals': {
        get: {
          summary: 'Get all hospitals',
          tags: ['Entities'],
          responses: {
            '200': {
              description: 'List of hospitals',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Hospital' }
                  }
                }
              }
            },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/superadmin/admins': {
        get: {
          summary: 'Get all administrators',
          tags: ['Super Admin'],
          security: [{ BearerAuth: [] }],
          description: 'Retrieve all administrators (hospitals and donation centers). Requires super admin authentication.',
          responses: {
            '200': {
              description: 'List of administrators',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      admins: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Admin' }
                      },
                      total: { type: 'integer', example: 25 }
                    }
                  }
                }
              }
            },
            '401': { description: 'Authentication required' },
            '403': { description: 'Super admin access required' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/superadmin/admins/{id}': {
        get: {
          summary: 'Get administrator by ID',
          tags: ['Super Admin'],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              example: '1'
            }
          ],
          responses: {
            '200': {
              description: 'Administrator details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Admin' }
                }
              }
            },
            '404': { description: 'Administrator not found' },
            '401': { description: 'Authentication required' },
            '403': { description: 'Super admin access required' }
          }
        },
        put: {
          summary: 'Update administrator',
          tags: ['Super Admin'],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              example: '1'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateAdmin' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Administrator updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Admin mis à jour avec succès' }
                    }
                  }
                }
              }
            },
            '404': { description: 'Administrator not found' },
            '401': { description: 'Authentication required' },
            '403': { description: 'Super admin access required' }
          }
        },
        delete: {
          summary: 'Delete administrator',
          tags: ['Super Admin'],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              example: '1'
            }
          ],
          responses: {
            '200': {
              description: 'Administrator deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Admin supprimé avec succès' }
                    }
                  }
                }
              }
            },
            '404': { description: 'Administrator not found' },
            '401': { description: 'Authentication required' },
            '403': { description: 'Super admin access required' }
          }
        }
      },
      '/superadmin/users': {
        get: {
          summary: 'Get all users',
          tags: ['Super Admin'],
          security: [{ BearerAuth: [] }],
          description: 'Retrieve all users in the system. Requires super admin authentication.',
          responses: {
            '200': {
              description: 'List of users',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      users: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/User' }
                      },
                      total: { type: 'integer', example: 150 }
                    }
                  }
                }
              }
            },
            '401': { description: 'Authentication required' },
            '403': { description: 'Super admin access required' }
          }
        }
      },
      '/superadmin/deliveries': {
        get: {
          summary: 'Get delivery history',
          tags: ['Super Admin'],
          security: [{ BearerAuth: [] }],
          description: 'Retrieve delivery history with optional filters. Requires super admin authentication.',
          parameters: [
            {
              name: 'entityType',
              in: 'query',
              schema: { type: 'string', enum: ['hospital', 'donation_center'] },
              example: 'hospital'
            },
            {
              name: 'entityId',
              in: 'query',
              schema: { type: 'string' },
              example: '1'
            },
            {
              name: 'userId',
              in: 'query',
              schema: { type: 'string' },
              example: '1'
            },
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string' },
              example: 'completed'
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'string' },
              example: '50'
            },
            {
              name: 'offset',
              in: 'query',
              schema: { type: 'string' },
              example: '0'
            }
          ],
          responses: {
            '200': {
              description: 'Delivery history',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      deliveries: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/DeliveryHistory' }
                      },
                      total: { type: 'integer', example: 89 }
                    }
                  }
                }
              }
            },
            '401': { description: 'Authentication required' },
            '403': { description: 'Super admin access required' }
          }
        }
      },
      '/superadmin/statistics': {
        get: {
          summary: 'Get global statistics',
          tags: ['Super Admin'],
          security: [{ BearerAuth: [] }],
          description: 'Retrieve global system statistics. Requires super admin authentication.',
          responses: {
            '200': {
              description: 'Global statistics',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Statistics' }
                }
              }
            },
            '401': { description: 'Authentication required' },
            '403': { description: 'Super admin access required' }
          }
        }
      }
    }
    },
  }));

    // Routes publiques
    api.route('/', entitiesRouter);
    api.route('/auth', authRouter);
    api.route('/deliveries', deliveryRouter);
    api.route('/blood', bloodRouter);
    api.route('/drones', droneRouter);
    api.route('/hospitals', hospitalRouter);
    api.route('/donation-centers', donationCenterRouter);
    api.route('/users', userRouter);

    // Routes super admin
    api.route('/superadmin', superAdminRouter);

  api.get('/swagger', swaggerUI({ url: '/api/docs' }));
  
  return api;
};