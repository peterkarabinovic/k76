variable "bucket_name_ending" {
  type        = string
  description = "ENDING OF THE BUCKET NAME"
  default     = "ua"
}


resource "aws_s3_bucket" "bucket" {
  bucket = "dewais-test-app-bucket-${var.bucket_name_ending}" # give a unique bucket name
}


resource "aws_s3_bucket_public_access_block" "bucket" {
  bucket = aws_s3_bucket.bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}


# resource "aws_s3_bucket_acl" "s3_bucket_acl" {
#   bucket = aws_s3_bucket.bucket.id
#   acl    = "public-read"
# }

resource "aws_s3_bucket_policy" "bucket-policy" {
  depends_on = [aws_s3_bucket_public_access_block.bucket]
  bucket     = aws_s3_bucket.bucket.id
  policy = jsonencode(
    {
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Sid" : "PublicReadGetObject",
          "Effect" : "Allow",
          "Principal" : "*",
          "Action" : "s3:GetObject",
          "Resource" : "arn:aws:s3:::${aws_s3_bucket.bucket.id}/**"
        }
      ]
    }
  )
}

resource "aws_s3_bucket_website_configuration" "bucket" {
  bucket = aws_s3_bucket.bucket.id

  index_document {
    suffix = "index.html"
  }
  
  error_document {
    key = "index.html"
  }  
}

# Upload files to S3 bucket
locals {
  content_types = {
    ".html" : "text/html",
    ".css" : "text/css",
    ".js" : "text/javascript"
  }
}

resource "aws_s3_object" "files" {
  bucket       = aws_s3_bucket.bucket.id
  for_each     = fileset("${path.module}/../react-fe/build", "**")
  key          = each.value
  source       = "${path.module}/../react-fe/build/${each.value}"
  content_type = lookup(local.content_types, regex("\\.[^.]+$", each.value), null)
}


# s3 static website url

# output "website_url" {
#   value = "http://${aws_s3_bucket_website_configuration.bucket.website_endpoint}"
# }

# output "domain_name" {
#   value = aws_s3_bucket.bucket.bucket_regional_domain_name
  
# }