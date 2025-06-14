export interface LambdaEndpointDefinition {
  name: string
  path?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  handler: string
  auth?: 'none' | 'apiKey' | 'cognito'
  cors?: boolean // Enable CORS for this endpoint
  description: string
  environment?: string[]
  iamPolicies?: Array<{
    actions: string[]
    resources: string[]
  }>
  tables?: string[] // List of DynamoDB table names this endpoint interacts with
}
export const lambdaEndpointDefinitions: LambdaEndpointDefinition[] = [
  {
    name: 'Register',
    path: 'register',
    method: 'POST',
    handler: 'auth/register.ts',
    auth: 'cognito',
    cors: true, // Enable CORS for registration endpoint
    tables: ['authed-users'], // This endpoint interacts with the authed-users table
    description: 'Register a new user',
    iamPolicies: [
      {
        actions: ['cognito-idp:AdminCreateUser', 'cognito-idp:AdminSetUserPassword'],
        resources: ['*'] // You can scope this to the specific user pool ARN if desired
      }
    ],
    environment: ['USER_POOL_ID']
  },
  {
    name: 'Login',
    path: 'login',
    method: 'POST',
    handler: 'auth/login.ts',
    auth: 'apiKey',
    cors: true, // Enable CORS for login endpoint
    description: 'User login endpoint',
    iamPolicies: [
      {
        actions: ['cognito-idp:InitiateAuth'],
        resources: ['*']
      }
    ],
    tables: ['authed-users'],
    environment: ['USER_POOL_CLIENT_ID']
  },
  {
    name: 'RefreshAuth',
    path: 'refresh-auth',
    method: 'POST',
    handler: 'auth/refresh-auth.ts',
    auth: 'apiKey',
    description: 'Refresh authentication token',
    iamPolicies: [
      {
        actions: ['cognito-idp:InitiateAuth'],
        resources: ['*']
      }
    ],
    environment: ['USER_POOL_CLIENT_ID']
  },
  {
    name: 'Logout',
    path: 'logout',
    method: 'POST',
    handler: 'auth/logout.ts',
    auth: 'cognito',
    description: 'User logout endpoint',
    iamPolicies: [
      {
        actions: ['cognito-idp:GlobalSignOut'],
        resources: ['*']
      }
    ]
  },
  {
    name: 'InitialFunction',
    path: 'initial-function',
    method: 'GET',
    handler: 'initial-function.ts',
    auth: 'none',
    description: 'Initial function endpoint'
  },
  {
    name: 'sfnStart',
    handler: 'initial-step-function/start.ts',
    description: 'Start of a Step Function execution'
  },
  {
    name: 'sfnLogic',
    handler: 'initial-step-function/logic.ts',
    description: 'Logic for Step Function execution'
  },
  {
    name: 'sfnEnd',
    handler: 'initial-step-function/end.ts',
    description: 'End of a Step Function execution'
  }
]
