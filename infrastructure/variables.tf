variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "CosmicDS API server environment name"
  type        = string
  default     = "cds-api"
}

variable "cds_environment" {
  description = "General CosmicDS environment name"
  type        = string
  default     = "production"
}

variable "github_repository" {
  description = "GitHub repository in the format 'owner/repo'"
  type        = string
  default     = "cosmicds/cds-api"
}

variable "github_branch" {
  description = "GitHub branch to track for changes"
  type        = string
  default     = "main"
}

variable "alb_domain_name" {
  description = "Domain name for the ALB SSL certificate"
  type        = string
}
