terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.environment}-vpc"
    Environment = var.environment
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.environment}-igw"
    Environment = var.environment
  }
}

# Public Subnets
# We want to have two subnets in different availability zones
# so that if one AZ fails, the ALB remains available in the other
resource "aws_subnet" "public" {
  count = 2

  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.environment}-public-subnet-${count.index + 1}"
    Environment = var.environment
    Type        = "Public"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count = 2

  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name        = "${var.environment}-private-subnet-${count.index + 1}"
    Environment = var.environment
    Type        = "Private"
  }
}

# NAT Gateways
resource "aws_eip" "nat" {
  count = 2

  domain = "vpc"
  depends_on = [aws_internet_gateway.main]

  tags = {
    Name        = "${var.environment}-nat-eip-${count.index + 1}"
    Environment = var.environment
  }
}

resource "aws_nat_gateway" "main" {
  count = 2

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name        = "${var.environment}-nat-gateway-${count.index + 1}"
    Environment = var.environment
  }

  depends_on = [aws_internet_gateway.main]
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name        = "${var.environment}-public-rt"
    Environment = var.environment
  }
}

resource "aws_route_table" "private" {
  count = 2

  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = {
    Name        = "${var.environment}-private-rt-${count.index + 1}"
    Environment = var.environment
  }
}

# Route Table Associations
resource "aws_route_table_association" "public" {
  count = 2

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count = 2

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Security Groups
resource "aws_security_group" "alb" {
  name_prefix = "${var.environment}-alb-"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP from CloudFront and direct access"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from CloudFront and direct access"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.environment}-alb-sg"
    Environment = var.environment
  }
}

resource "aws_security_group" "ecs_tasks" {
  name_prefix = "${var.environment}-ecs-tasks-"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "CDS Portal from ALB"
    from_port       = 8865
    to_port         = 8865
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description     = "CDS Hubble from ALB"
    from_port       = 8765
    to_port         = 8765
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.environment}-ecs-tasks-sg"
    Environment = var.environment
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false

  tags = {
    Name        = "${var.environment}-alb"
    Environment = var.environment
  }
}

# Target Group
resource "aws_lb_target_group" "cds_api" {
  name        = "${var.environment}-cds-api-tg"
  port        = 8865
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 60
    matcher             = "200"
    path                = "/"
    port                = "8865"
    protocol            = "HTTP"
    timeout             = 30
    unhealthy_threshold = 2
  }

  tags = {
    Name        = "${var.environment}-cds-api-tg"
    Environment = var.environment
  }
}

# Load Balancer Listener
resource "aws_lb_listener" "main" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.cds_api.arn
  }

  tags = {
    Name        = "${var.environment}-listener"
    Environment = var.environment
  }
}

# ACM Certificate for ALB (using existing imported certificate)
data "aws_acm_certificate" "alb" {
  domain   = var.alb_domain_name
  statuses = ["ISSUED"]
}

# HTTPS Listener
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = data.aws_acm_certificate.alb.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.cds_api.arn
  }

  tags = {
    Name        = "${var.environment}-https-listener"
    Environment = var.environment
  }
}

# CloudFront Origin Access Control for ALB
resource "aws_cloudfront_origin_access_control" "alb" {
  name                              = "${var.environment}-alb-oac"
  description                       = "Origin Access Control for ALB"
  origin_access_control_origin_type = "mediapackagev2"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}


# TODO: How to add the API server-specific CloudFront piece in here?

# Secrets Manager for sensitive environment variables
resource "aws_secretsmanager_secret" "cds_api_secrets" {
  name        = "${var.environment}/cds-api/secrets"
  description = "Secrets for CDS API server application"

  tags = {
    Name        = "${var.environment}-cds-api-secrets"
    Environment = var.environment
  }
}

# Parameter Store for non-sensitive environment variables
resource "aws_ssm_parameter" "cds_api_env_vars" {
  for_each = {
    "NODE_ENV"    = "production"
    "LOG_LEVEL"   = "info"
  }

  name  = "/${var.environment}/cds-api/env/${each.key}"
  type  = "String"
  value = each.value

  tags = {
    Name        = "${var.environment}-cds-api-${each.key}"
    Environment = var.environment
    Application = "cds-api"
  }
}

# ECS Task Execution Role
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.cds_environment}-ecs-task-execution-role"
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Additional policy for accessing Secrets Manager and Parameter Store
resource "aws_iam_role_policy" "ecs_secrets_policy" {
  name = "${var.environment}-ecs-secrets-policy"
  role = aws_iam_role.ecs_task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.cds_api_secrets.arn,
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameters",
          "ssm:GetParameter"
        ]
        Resource = [
          "arn:aws:ssm:${var.aws_region}:*:parameter/${var.cds_environment}/cds-api/env/*",
        ]
      }
    ]
  })
}

# ECS Task Definition
resource "aws_ecs_task_definition" "cds_api" {
  family                   = "${var.cds_environment}-cds-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "cds-api"
      image = "${aws_ecr_repository.cds_api.repository_url}:latest"
      portMappings = [
        {
          containerPort = 8865
          protocol      = "tcp"
        }
      ]
      essential = true

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        }
      ]

      secrets = [
        # TODO: Fill in secrets
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.cds_api.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name        = "${var.environment}-task"
    Environment = var.environment
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "cds_api" {
  name              = "/ecs/${var.environment}"
  retention_in_days = 7

  tags = {
    Name        = "${var.environment}-logs"
    Environment = var.environment
  }
}

# ECS Service
resource "aws_ecs_service" "cds_api" {
  name            = "${var.environment}-cds-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.cds_api.arn
  desired_count   = var.cds_api_min_capacity
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.private[*].id
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.cds_api.arn
    container_name   = "cds-api"
    container_port   = 8865
  }

  depends_on = [aws_lb_listener.main]

  tags = {
    Name        = "${var.environment}-service"
    Environment = var.environment
  }
}

# Auto Scaling Resources
resource "aws_appautoscaling_target" "cds_api" {
  max_capacity       = var.cds_api_max_capacity
  min_capacity       = var.cds_api_min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.cds_api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"

  tags = {
    Name        = "${var.environment}-autoscaling-target"
    Environment = var.environment
  }
}

# Auto Scaling Policy - CPU Based
resource "aws_appautoscaling_policy" "cds_api_cpu" {
  name               = "${var.environment}-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.cds_api.resource_id
  scalable_dimension = aws_appautoscaling_target.cds_api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.cds_api.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 300
  }
}

# Generate a random secret for CloudFront
resource "random_password" "cloudfront_secret" {
  count   = var.cloudfront_secret == "" ? 1 : 0
  length  = 32
  special = true
}

# Store the secret in Parameter Store for reference
resource "aws_ssm_parameter" "cloudfront_secret" {
  name  = "/${var.environment}/cloudfront/secret"
  type  = "SecureString"
  value = var.cloudfront_secret != "" ? var.cloudfront_secret : random_password.cloudfront_secret[0].result

  tags = {
    Name        = "${var.environment}-cloudfront-secret"
    Environment = var.environment
  }
}

# Use the secret in CloudFront
locals {
  cloudfront_secret = var.cloudfront_secret != "" ? var.cloudfront_secret : random_password.cloudfront_secret[0].result
}
