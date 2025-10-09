# Node.js Todo Service on AWS EKS

This repository contains a full-stack deployment of a Node.js Todo service on AWS EKS using Terraform for infrastructure, Docker & ECR for containerization, and Kubernetes manifests for deployment. CI/CD is implemented with GitHub Actions.

---

## Repository Structure

Nodejs-Todo-Services/

├── src/ # Node.js service

│ ├── db/

│ │ └── memory.js

│ ├── index.js

│ ├── logger.js

│ ├── metrics.js

│ ├── routes/

│ │ └── todo.js

│ └── server.js

├── tests/

│ └── api.test.js

├── Dockerfile

├── k8s/ # Kubernetes manifests

│ ├── deployment.yaml

│ ├── ingress.yaml

│ ├── networkpolicy.yaml

│ ├── service-account.yaml

│ └── service.yaml

├── terraform/infra/ # Terraform for infra

│ ├── main.tf

│ ├── eks.tf

│ ├── network.tf

│ ├── security.tf

│ └── variables.tf

├── iam_policy.json # IRSA policy for EKS service account

└── .github/workflows/ # CI/CD pipeline

└── ci.yaml


## Setup & Deployment Instructions

### 1️⃣ Prerequisites

- AWS CLI v2
- Terraform 1.5+
- kubectl
- Docker
- GitHub account (for CI/CD)

### 2️⃣ Terraform Infrastructure

```bash
cd terraform/infra
terraform init
terraform apply -auto-approve
Creates VPC, subnets, security groups

Deploys EKS cluster with t3.large nodes

Sets up IRSA for pod access to DynamoDB

Deploys DynamoDB table for todos

3️⃣ Docker Build & Push to ECR

aws ecr create-repository --repository-name nodejs-todo
docker build -t nodejs-todo:latest .
docker tag nodejs-todo:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-2.amazonaws.com/nodejs-todo:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-2.amazonaws.com/nodejs-todo:latest
4️⃣ Kubernetes Deployment

kubectl apply -f k8s/service-account.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/networkpolicy.yaml
ServiceAccount uses IRSA to access DynamoDB

Deployment points to Docker image in ECR

Ingress exposes service with NGINX controller

NetworkPolicy restricts pod communication

Architecture Diagram (ASCII)
sql
Copy code
         ┌─────────┐
         │  Users  │
         └────┬────┘
              │ HTTP/HTTPS
              ▼
 ┌───────────────────────────┐
 │ NGINX Ingress Controller  │
 └───────────┬───────────────┘
             │
             ▼
 ┌───────────────────────────┐
 │ Kubernetes Service        │
 │ nodejs-todo               │
 └───────────┬───────────────┘
             │
             ▼
 ┌───────────────────────────┐
 │ Pod running Node.js       │
 │ Todo Service              │
 └───────────┬───────────────┘
             │
             ▼
 ┌───────────────────────────┐
 │ DynamoDB Table            │
 └───────────────────────────┘
Security Measures & Threat Model
IRSA (IAM Roles for Service Accounts): Pods have least-privilege access to DynamoDB

Network Policies: Restrict traffic between pods & namespaces

HTTPS: Ingress supports TLS termination

IAM & Security Groups: Only required ports are open

Logging & Monitoring: Node.js logs & metrics available for observability

Threat Model:

Unauthorized API access → mitigated with network policy & authentication

Data exfiltration → mitigated by IRSA & least privilege roles

Pod compromise → limited by Kubernetes RBAC & network isolation

Trade-offs & Future Improvements
Current Setup:

t3.large nodes, 2 replicas

Single DynamoDB table

CI/CD via GitHub Actions

Trade-offs:

No autoscaling for pods yet

Limited monitoring (could integrate Prometheus/Grafana)

Dev/test infra costs higher due to t3.large nodes

Future Improvements:

Enable Horizontal Pod Autoscaler (HPA)

Add CloudWatch/Prometheus metrics

Add authentication & authorization to API

Multi-region DynamoDB for HA

Automated Terraform plan approval in CI/CD

References
AWS EKS Documentation

Kubernetes Official Docs

Terraform AWS Provider

GitHub Actions Docs
