# ==============================================================================
# Security Groups: Modelo Zero-Trust de Mínimo Acesso
# ==============================================================================

# 1. Security Group do Application Load Balancer
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-${var.environment}-alb-sg"
  description = "Permite apenas trafego HTTP/HTTPS publico para o Load Balancer"
  vpc_id      = aws_vpc.main.id

  # Ingress: Tráfego Web Público
  ingress {
    description = "HTTP Publico para redirect seguro"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS Criptografado Publico"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Egress: Envia tráfego APENAS para os contêineres ECS
  egress {
    description     = "Encaminha trafego estritamente para as Tasks ECS"
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-alb-sg"
  }
}

# 2. Security Group das Tasks ECS (Contêineres da Aplicação)
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.project_name}-${var.environment}-ecs-tasks-sg"
  description = "Isola os conteineres Next.js, aceitando trafego APENAS do Load Balancer"
  vpc_id      = aws_vpc.main.id

  # Ingress: Aceita conexões EXCLUSIVAMENTE originadas do ALB
  ingress {
    description     = "Permite requisicoes exclusivamente do ALB"
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Egress: Saída para chamadas de APIs externas (HTTPS) e comunicação com o banco RDS (5432)
  egress {
    description = "Saida HTTPS para APIs externas (Asaas, Panda, Resend) via NAT"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description     = "Conexao com o RDS PostgreSQL estritamente na porta 5432"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.rds.id]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-tasks-sg"
  }
}

# 3. Security Group do Banco de Dados RDS PostgreSQL
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-${var.environment}-rds-sg"
  description = "Bloqueio total: Acesso ao banco de dados permitido EXCLUSIVAMENTE pelo ECS"
  vpc_id      = aws_vpc.main.id

  # Ingress: Aceita conexão 5432 APENAS do Security Group das Tasks ECS
  ingress {
    description     = "Acesso ao PostgreSQL exclusivamente da camada de aplicacao ECS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  # Egress: Banco não precisa iniciar conexões de saída
  egress {
    description = "Sem saida externa"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["127.0.0.1/32"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-sg"
  }
}
