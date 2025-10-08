# --- DynamoDB Table for ToDo Data ---
resource "aws_dynamodb_table" "todos" {
  name             = "${var.app_name}-todos"
  hash_key         = "id"
  billing_mode     = "PAY_PER_REQUEST"

  attribute {
    name = "id"
    type = "S"
  }
  
  tags = {
    Name = "ToDoServiceTable"
  }
}

# --- IRSA (IAM Role for Service Account) Setup ---

# 1. Least-Privilege IAM Policy for DynamoDB
resource "aws_iam_policy" "dynamodb_read_write" {
  name        = "${var.app_name}-dynamodb-rw"
  description = "Allows R/W access to only the ToDo table."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchWriteItem"
        ]
        Resource = [aws_dynamodb_table.todos.arn]
      }
    ]
  })
}

# 2. The IAM Role for the EKS Service Account
resource "aws_iam_role" "todo_service_role" {
  name               = "todo-service-dynamodb-role"
  # The assume_role_policy relies on the OIDC provider created in eks.tf
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

# 3. Trust Relationship (Allows the Kubernetes Service Account to assume this role)
data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"
    principals {
      identifiers = [aws_iam_openid_connect_provider.oidc.arn]
      type        = "Federated"
    }
    condition {
      test     = "StringEquals"
      variable = "${replace(aws_iam_openid_connect_provider.oidc.url, "https://", "")}:sub"
      values   = ["system:serviceaccount:default:todo-service-sa"]
    }
  }
}

# 4. Attach the Least-Privilege Policy to the Role
resource "aws_iam_role_policy_attachment" "dynamodb_attach" {
  role       = aws_iam_role.todo_service_role.name
  policy_arn = aws_iam_policy.dynamodb_read_write.arn
}

# Output the ARN needed for the K8s ServiceAccount annotation
output "todo_service_role_arn" {
  value = aws_iam_role.todo_service_role.arn
}
