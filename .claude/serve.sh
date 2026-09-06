#!/bin/bash
cd "$(dirname "$0")/.." || exit 1
exec bundle exec jekyll serve --config _config.yml,_config-dev.yml --host 127.0.0.1
