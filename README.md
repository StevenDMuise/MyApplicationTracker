# MyApplicationTracker Monorepo

This repository contains all infrastructure, backend, and frontend code for the My Application Tracker project.

## Structure

- `packages/infra` – Terraform infrastructure as code (including S3, DynamoDB, Lambda, etc.)
- `packages/backend` – AWS Lambda functions (TypeScript, Serverless Framework)
- `packages/frontend` – React web application (TypeScript, Tailwind CSS)

## Getting Started

1. Clone this repository
2. See each package's README for setup instructions

## Deployment

- CI/CD is managed via GitHub Actions (see `.github/workflows`)
- Deployments target AWS VPCs: `hrsite-dev-vpc` (test) and `hrsite-prod-vpc` (production)

## Documentation

See the `/docs` folder for product requirements and design documents.
