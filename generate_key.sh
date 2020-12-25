#!/bin/bash
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)"

require_binary ssh-keygen
require_binary openssl

KEY_FILE="$PROJECT_ROOT"/jwtRS256.key

if [ ! -f "$KEY_FILE" ]; then
  ssh-keygen -t rsa -b 4096 -m PEM -f "$KEY_FILE" -N ''
  openssl rsa -in "$KEY_FILE" -pubout -outform PEM -out "$KEY_FILE".pub
fi
