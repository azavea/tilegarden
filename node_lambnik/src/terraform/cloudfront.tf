provider "aws" {
	region	= "us-east-1"
}

locals {
  api_gateway_id = "tilegarden"
}

resource "aws_cloudfront_distribution" "tilegarden_test" {
  origin {
    custom_origin_config {
      http_port = 80
      https_port = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = ["TLSv1.2", "TLSv1.1", "TLSv1"]
      origin_keepalive_timeout = 5
      origin_read_timeout = 30
    }
    domain_name = "bjltimsf0a.execute-api.us-east-1.amazonaws.com"
    origin_path = "/latest"
    origin_id = "${local.api_gateway_id}"
    custom_header {
      name = "Accept"
      value = "image/png"
    }
  }



  enabled = true
  is_ipv6_enabled = true
  comment = "CloudFront proxy for Tilegarden"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "${local.api_gateway_id}"

    forwarded_values {
      query_string = true

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 1
    max_ttl                = 86400
  }

  restrictions {
    "geo_restriction" {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
