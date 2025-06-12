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

### 3. Local Development (API Emulation)
To run the Lambda locally using SAM:
```sh
yarn dev
```
This will build, synthesize the CDK stack, and start the SAM local API on port 3001.

## From zero to hero

Deploy this Lambda to AWS using only GitHub—no local setup required!

### 1. Fork the repository
- Click the **Fork** button on the top right of the [GitHub repo](https://github.com/cal-macconnachie/generic-lambda) to create your own copy.

### 2. Add GitHub Action secrets
- In your forked repo, go to **Settings > Secrets and variables > Actions**.
- Add the following secrets:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_DEFAULT_REGION`

### 3. Create a new branch called `development`
- On GitHub, go to the main page of your forked repo.
- Click the branch dropdown, type `development`, and create the new branch.

### 4. Set your app name in `lib/constants.ts`
- In the `development` branch, open the file `lib/constants.ts`.
- Set the `appName` value to your desired application name. For example:
  ```typescript
  export const appName: string = 'my-cool-app'
  ```
- Commit this change to the `development` branch. This commit will trigger the deployment workflow.

### 5. Let GitHub Actions deploy for you
- The included GitHub Actions workflow will automatically lint, test, synthesize, and deploy your stack to AWS whenever you push to the `development` or `production` branches.
- Monitor progress in the **Actions** tab of your repo.

That's it! You can deploy and manage this Lambda entirely from GitHub.

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
