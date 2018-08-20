variable "region" {}
variable "source_name" {}
variable "source_id" {}

provider "aws" {
  region	= "${var.region}"
}

output "domain" {
  value = "${aws_cloudfront_distribution.tilegarden_test.domain_name}"
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
    domain_name = "${var.source_id}.execute-api.${var.region}.amazonaws.com"
    origin_path = "/latest"
    origin_id = "${var.source_name}"
    custom_header {
      name = "Accept"
      value = "image/png"
    }
  }


  price_class = "PriceClass_100"
  enabled = true
  is_ipv6_enabled = true
  comment = "Proxy for ${var.source_name}"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "${var.source_name}"

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
