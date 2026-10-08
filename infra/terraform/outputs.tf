output "alb_dns_name" {
  description = "DNS público do Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "rds_endpoint" {
  description = "Endpoint privado do PostgreSQL no RDS (inacessível pela internet)"
  value       = aws_db_instance.postgres.address
}

output "rds_port" {
  description = "Porta do PostgreSQL"
  value       = aws_db_instance.postgres.port
}

output "ecs_cluster_name" {
  description = "Nome do Cluster ECS"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "Nome do Service ECS"
  value       = aws_ecs_service.main.name
}

output "database_secrets_arn" {
  description = "ARN do segredo no AWS Secrets Manager contendo as credenciais do banco"
  value       = aws_secretsmanager_secret.db_credentials.arn
}
