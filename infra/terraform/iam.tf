# ==============================================================================
# IAM: Permissões de Menor Privilégio (Least Privilege Architecture)
# ==============================================================================

# 1. Documento de Confiança do ECS (AssumeRole)
data "aws_iam_policy_document" "ecs_tasks_trust" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# 2. Task Execution Role (Usado pelo agente do ECS para puxar imagens e segredos)
resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "${var.project_name}-${var.environment}-ecs-task-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_trust.json

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-task-execution-role"
  }
}

# Anexa a política padrão da AWS para execução de tarefas ECS (ECR + CloudWatch)
resource "aws_iam_role_policy_attachment" "ecs_task_execution_standard" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Política Inline Estrita: Permite ler APENAS os segredos do Secrets Manager do projeto
resource "aws_iam_policy" "ecs_secrets_access" {
  name        = "${var.project_name}-${var.environment}-ecs-secrets-policy"
  description = "Concede leitura estrita do segredo do banco ao ECS Fargate"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.db_credentials.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_secrets_attach" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.ecs_secrets_access.arn
}

# 3. Task Role (Permissões da Aplicação em Tempo de Execução)
resource "aws_iam_role" "ecs_task_role" {
  name               = "${var.project_name}-${var.environment}-ecs-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_trust.json

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-task-role"
  }
}
