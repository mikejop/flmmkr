# ==============================================================================
# ECS Fargate: Contêineres em Subnets Privadas com Injeção de Segredos
# ==============================================================================

# 1. Cluster ECS
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cluster"
  }
}

# 2. Log Group no CloudWatch (Criptografado e com retenção de 30 dias)
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project_name}-${var.environment}"
  retention_in_days = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-logs"
  }
}

# 3. Task Definition Fargate
resource "aws_ecs_task_definition" "app" {
  family                   = "${var.project_name}-${var.environment}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "nextjs-app"
      image     = var.container_image
      essential = true

      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "app"
        }
      }

      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = tostring(var.container_port) }
      ]

      # Injeção Segura de Credenciais via AWS Secrets Manager (Sem expor em texto puro)
      secrets = [
        {
          name      = "DATABASE_CREDENTIALS"
          valueFrom = aws_secretsmanager_secret.db_credentials.arn
        }
      ]
    }
  ])

  tags = {
    Name = "${var.project_name}-${var.environment}-task-def"
  }
}

# 4. ECS Service (Fargate em Subnets Privadas)
resource "aws_ecs_service" "main" {
  name            = "${var.project_name}-${var.environment}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.app_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.private_app[*].id
    assign_public_ip = false # Zero IP público para os contêineres
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "nextjs-app"
    container_port   = var.container_port
  }

  depends_on = [
    aws_lb_listener.http,
    aws_iam_role_policy_attachment.ecs_task_execution_standard
  ]

  tags = {
    Name = "${var.project_name}-${var.environment}-service"
  }
}
