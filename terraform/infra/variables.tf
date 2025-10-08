variable "aws_region" {
  description = "The AWS region to deploy resources into"
  type        = string
  default     = "ap-south-2"
}

variable "cluster_name" {
  description = "Name for the EKS cluster"
  type        = string
  default     = "nodejs-service" # Updated cluster name
}

variable "app_name" {
  description = "Application name for resource tagging"
  type        = string
  default     = "todo-service"
}
