###############################################
# 
# Create lambda function
#
###############################################
data "aws_iam_policy_document" "assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "iam_for_lambda" {
  name               = "iam_for_lambda"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

data "archive_file" "lambda_source_code" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda-be/dist/"
  output_path = "${path.module}/.terraform/lambda.zip"
}

resource "aws_lambda_function" "word_type_lambda" {
  runtime       = "nodejs18.x"
  filename      = "${path.module}/.terraform/lambda.zip"
  function_name = "word-types-lambda"
  handler       = "index.handler"
  role          = aws_iam_role.iam_for_lambda.arn
}

###############################################
#
# Create API Gateway
#
###############################################
resource "aws_apigatewayv2_api" "word_types" {
  name          = "dewais_test_api_gw"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "dev" {
  api_id = aws_apigatewayv2_api.word_types.id
  name        = "api"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "word_types_api" {
  api_id = aws_apigatewayv2_api.word_types.id
  integration_uri    = aws_lambda_function.word_type_lambda.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "hello_world" {
  api_id = aws_apigatewayv2_api.word_types.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.word_types_api.id}"
  
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.word_type_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_apigatewayv2_api.word_types.execution_arn}/*/*"
}


# output "base_url" {
#   description = "Base URL for API Gateway stage."
#   value = aws_apigatewayv2_stage.dev.invoke_url
# }
