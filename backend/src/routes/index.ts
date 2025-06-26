import { Hono } from 'hono';
import { authRouter } from './auth.routes';
import { deliveryRouter } from './delivery';
<<<<<<< 6-créer-les-routes-crud-de-la-table-hospital
import { hospitalRouter } from './hospital';
=======
import { donationCenterRouter } from './donation_center';
import { userRouter } from './user';
import { entitiesRouter } from './entities.routes';
>>>>>>> All-crud
import { swaggerUI } from '@hono/swagger-ui';

export const createRouter = () => {
  const api = new Hono();

  // Routes publiques
  api.route('/auth', authRouter);
  api.route('/', entitiesRouter);

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
    },
  };

  // Routes publiques
  api.route('/auth', authRouter);
  api.route('/deliveries', deliveryRouter);
<<<<<<< 6-créer-les-routes-crud-de-la-table-hospital
  api.route('/hospitals', hospitalRouter);

  // Swagger documentation
  api.get('/docs', (c) => c.json(openApiJson));
=======
  api.route('/donation-centers', donationCenterRouter);
  api.route('/users', userRouter);
  
>>>>>>> All-crud
  api.get('/swagger', swaggerUI({ url: '/api/docs' }));
  
  return api;
};