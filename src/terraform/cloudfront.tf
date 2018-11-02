variable "region" {}
variable "source_name" {}
variable "source_id" {}

provider "aws" {
  region	= "${var.region}"
}

output "domain" {
  value = "${aws_cloudfront_distribution.tilegarden_proxy.domain_name}"
}

resource "aws_cloudfront_distribution" "tilegarden_proxy" {
  origin {
    origin_id = "${local.cache_bucket_name}"
    domain_name = "${aws_s3_bucket.tile_cache.website_endpoint}"
    custom_header {
      name = "Accept"
      value = "image/png"
    }
    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }

  price_class = "PriceClass_100"
  enabled = true
  is_ipv6_enabled = true
  comment = "Proxy for ${var.source_name}"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "${local.cache_bucket_name}"

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
