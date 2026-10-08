# ==============================================================================
# Application Load Balancer (ALB): Borda Web Pública Segura
# ==============================================================================

resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = var.environment == "production" ? true : false
  drop_invalid_header_fields = true

  tags = {
    Name = "${var.project_name}-${var.environment}-alb"
  }
}

# Target Group para as Tasks ECS Fargate (Target type: IP)
resource "aws_lb_target_group" "app" {
  name        = "${var.project_name}-${var.environment}-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/"
    port                = var.container_port
    protocol            = "HTTP"
    matcher             = "200-399"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
  }

  deregistration_delay = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-tg"
  }
}

# Listener HTTP (Porta 80)
# Em ambiente com SSL, pode executar redirect 301 automático para HTTPS 443
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}
