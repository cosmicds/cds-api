aws_region = "us-east-1"
environment = "cds-api"

# GitHub repository for CI/CD
github_repository = "cosmicds/cds-api"
github_branch = "main"

# Auto-scaling configuration
cds_api_min_capacity = 1
cds_api_max_capacity = 2

# ALB domain name for SSL certificate
alb_domain_name = "api.cosmicds.cfa.harvard.edu"
