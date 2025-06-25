import { Hono } from 'hono';
import { authRouter } from './auth.routes';
import { deliveryRouter } from './delivery';
import { donationCenterRouter } from './donation_center';
import { swaggerUI } from '@hono/swagger-ui';
import { createRoute, z } from '@hono/zod-openapi';

export const createRouter = () => {
  const api = new Hono();
  
  const openApiJson = {
    openapi: '3.0.0',
    info: {
      title: 'BloodSky API',
      version: '1.0.0',
      description: 'BloodSky - API for blood delivery drone management',
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
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'userName', 'userFirstname'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                    },
                    password: {
                      type: 'string',
                      minLength: 8,
                    },
                    userName: {
                      type: 'string',
                    },
                    userFirstname: {
                      type: 'string',
                    },
                    telNumber: {
                      type: 'number',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'User created successfully',
            },
            '409': {
              description: 'User already exists',
            },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'Login a user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                    },
                    password: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login successful',
            },
            '401': {
              description: 'Invalid credentials',
            },
          },
        },
      },
    },
  };

  // Routes publiques
  api.route('/auth', authRouter);
  api.route('/deliveries', deliveryRouter);
  api.route('/donation-centers', donationCenterRouter);
  

  // Swagger documentation
  api.get('/docs', (c) => c.json(openApiJson));
  api.get('/swagger', swaggerUI({ url: '/api/docs' }));
  
  return api;
};