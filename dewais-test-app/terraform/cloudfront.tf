
resource "aws_cloudfront_distribution" "wordtypes_cdn" {
  enabled = true
  default_root_object = "index.html"
  origin {
    domain_name = aws_s3_bucket.bucket.bucket_regional_domain_name
    origin_id   = "webpage"
  }

  origin {
    domain_name = replace(aws_apigatewayv2_stage.dev.invoke_url, "/^https?://([^/]*).*/", "$1")
    origin_id   = "api"
    origin_path = "/api"
    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = "webpage"
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = true
      cookies { forward = "none" }
    }
  }

  ordered_cache_behavior {
    path_pattern     = "/api"
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "api"

    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
    viewer_protocol_policy = "https-only"
    # Using the CachingDisabled managed policy ID:
    cache_policy_id  = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" 
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

}

output "cloudfront_url" {
  value = "https://${aws_cloudfront_distribution.wordtypes_cdn.domain_name}"
}
