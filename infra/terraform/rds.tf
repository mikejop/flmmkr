# ==============================================================================
# RDS PostgreSQL: Camada de Dados Isolada e Criptografada
# ==============================================================================

# 1. Subnet Group Privado do Banco de Dados
resource "aws_db_subnet_group" "rds" {
  name        = "${var.project_name}-${var.environment}-db-subnet-group"
  description = "Subnets isoladas para o RDS PostgreSQL (sem conexao com internet)"
  subnet_ids  = aws_subnet.private_db[*].id

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  }
}

# 2. Geração Segura da Senha do Banco de Dados
resource "random_password" "db_master_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# 3. Armazenamento da Senha no AWS Secrets Manager (KMS Criptografado)
resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${var.project_name}/${var.environment}/database/credentials"
  description             = "Credenciais mestras do RDS PostgreSQL gerenciadas pelo Secrets Manager"
  recovery_window_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-db-credentials"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    engine   = "postgres"
    host     = aws_db_instance.postgres.address
    port     = aws_db_instance.postgres.port
    database = var.db_name
    username = var.db_username
    password = random_password.db_master_password.result
  })
}

# 4. Instância do Banco de Dados RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier                  = "${var.project_name}-${var.environment}-postgres"
  engine                      = "postgres"
  engine_version              = "16.3"
  instance_class              = var.db_instance_class
  allocated_storage           = 20
  max_allocated_storage       = 100
  storage_type                = "gp3"
  storage_encrypted           = true

  db_name                     = var.db_name
  username                    = var.db_username
  password                    = random_password.db_master_password.result

  db_subnet_group_name        = aws_db_subnet_group.rds.name
  vpc_security_group_ids      = [aws_security_group.rds.id]

  # REGRA DE OURO DE SEGURANÇA: NUNCA ACESSÍVEL PUBLICAMENTE
  publicly_accessible         = false

  multi_az                    = var.environment == "production" ? true : false
  backup_retention_period     = 7
  backup_window               = "03:00-04:00"
  maintenance_window          = "Mon:04:00-Mon:05:00"
  auto_minor_version_upgrade  = true
  allow_major_version_upgrade = false

  deletion_protection         = var.environment == "production" ? true : false
  skip_final_snapshot         = var.environment == "production" ? false : true
  final_snapshot_identifier   = "${var.project_name}-${var.environment}-postgres-final-snapshot"

  tags = {
    Name = "${var.project_name}-${var.environment}-postgres"
  }
}
