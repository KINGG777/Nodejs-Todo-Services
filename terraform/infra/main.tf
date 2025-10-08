terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
  }

  # Secure Terraform State: S3 with SSE-KMS and DynamoDB lock
  backend "s3" {
    bucket         = "devops-todo-app-tfstate-bucket1" 
    key            = "todo-app/terraform.tfstate"
    region         = "ap-south-2"
    dynamodb_table = "devops-tf-lock-table"
    encrypt        = true
  }
}

# AWS Provider Configuration
provider "aws" {
  region = var.aws_region
}

# ECR Repository (for CI/CD to push to)
resource "aws_ecr_repository" "app_repo" {
  name                 = var.app_name
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
  encryption_configuration {
    encryption_type = "KMS"
  }
}

# Terraform Output for ECR URI (useful for CI/CD pipeline)
output "ecr_repository_url" {
  value = aws_ecr_repository.app_repo.repository_url
}
