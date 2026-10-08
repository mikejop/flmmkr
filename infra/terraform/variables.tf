variable "aws_region" {
  description = "Região da AWS para provisionamento"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Ambiente de execução (production, staging)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Identificador do projeto"
  type        = string
  default     = "flmmkr"
}

variable "vpc_cidr" {
  description = "Bloco CIDR da VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnets" {
  description = "Subnets públicas para ALB e NAT Gateway (Multi-AZ)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_app_subnets" {
  description = "Subnets privadas para contêineres ECS Fargate (sem IP público)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "private_db_subnets" {
  description = "Subnets isoladas para o banco de dados RDS (totalmente inacessíveis pela internet)"
  type        = list(string)
  default     = ["10.0.20.0/24", "10.0.21.0/24"]
}

variable "db_name" {
  description = "Nome do banco de dados PostgreSQL"
  type        = string
  default     = "flmmkr_db"
}

variable "db_username" {
  description = "Usuário mestre do banco de dados"
  type        = string
  default     = "flmmkr_admin"
}

variable "db_instance_class" {
  description = "Classe da instância RDS"
  type        = string
  default     = "db.t4g.micro"
}

variable "container_image" {
  description = "URI da imagem Docker no Amazon ECR"
  type        = string
  default     = "public.ecr.aws/docker/library/node:20-alpine"
}

variable "container_port" {
  description = "Porta interna do contêiner da aplicação Next.js"
  type        = number
  default     = 3000
}

variable "app_count" {
  description = "Quantidade desejada de instâncias de contêiner ECS Fargate"
  type        = number
  default     = 2
}
