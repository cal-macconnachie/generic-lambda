# Generic Lambda

A generic AWS Lambda function template using TypeScript, AWS CDK, and SAM CLI. This project provides a starting point for building serverless applications on AWS with modern TypeScript tooling and infrastructure-as-code.

## Technologies Used
- **TypeScript**: Strongly-typed JavaScript for application and infrastructure code
- **AWS CDK**: Define AWS infrastructure as code using TypeScript
- **AWS Lambda**: Serverless compute service
- **Jest**: Testing framework
- **ESLint & Prettier**: Code linting and formatting
- **Yarn**: Package manager
- **GitHub Actions**: CI/CD for linting, testing, and deployment

## Prerequisites
- [Node.js](https://nodejs.org/) (v22 recommended)
- [Yarn](https://yarnpkg.com/) (corepack will enable it automatically)
- AWS account credentials with permissions for CDK and Lambda

## Getting Started

### 1. Clone the repository
```sh
git clone https://github.com/cal-macconnachie/generic-lambda.git
cd generic-lambda
```

### 2. Install dependencies
```sh
corepack enable
yarn install
```

### 6. Local Development (API Emulation)
To run the Lambda locally using SAM:
```sh
yarn dev
```
This will build, synthesize the CDK stack, and start the SAM local API on port 3001.

## Deployment
Deployment is managed via AWS CDK and automated with GitHub Actions.

### CI/CD Deployment
- On push to `development` or `production` branches, GitHub Actions will:
  - Lint and test the code
  - Synthesize the CDK stack
  - Deploy to AWS using the appropriate environment
- AWS credentials and region must be set in repository secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`

## Useful Commands
- `yarn build` — Compile TypeScript
- `yarn test` — Run tests
- `yarn lint` — Lint code
- `yarn dev` — run local dev through express server
- `yarn cdk` — Run AWS CDK CLI
- `yarn clean` — Remove build artifacts

## License
Apache-2.0

---

For more details, see the source files and GitHub Actions workflow in `.github/workflows/deploy.yml`.
