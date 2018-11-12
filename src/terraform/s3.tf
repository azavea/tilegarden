locals {
  cache_bucket_name = "${lower("${var.source_name}")}-cache"
  api_hostname = "${var.source_id}.execute-api.${var.region}.amazonaws.com"
}

resource "aws_s3_bucket" "tile_cache" {
  bucket = "${local.cache_bucket_name}"
  acl = "public-read"
  force_destroy = true

  website {
    index_document = "index.html"
    error_document = "error.html"
    routing_rules = <<EOF
    [{
      "Condition": {
        "HttpErrorCodeReturnedEquals": "404"
      },
      "Redirect": {
        "HostName" : "${aws_cloudfront_distribution.tilegarden_proxy.domain_name}",
        "HttpRedirectCode" : "302",
        "Protocol" : "https",
        "ReplaceKeyPrefixWith": "latest/"
      }
    }]
EOF
  }
}

resource "aws_cloudfront_origin_access_identity" "tile_cache" {
  comment = "Created for ${var.source_name}"
}

data "aws_iam_policy_document" "s3" {
  statement {
    actions = [
      "s3:ListBucket",
      "s3:GetObject"
    ]
    resources = [
      "${aws_s3_bucket.tile_cache.arn}",
      "${aws_s3_bucket.tile_cache.arn}/*"
    ]
    principals {
      type = "AWS"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_policy" "tile_cache" {
  bucket = "${aws_s3_bucket.tile_cache.id}"
  policy = "${data.aws_iam_policy_document.s3.json}"
}

