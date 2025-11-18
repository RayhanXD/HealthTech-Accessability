#!/bin/bash
# Build script for iOS development build with proper PATH setup

export PATH="/opt/homebrew/opt/ruby/bin:$HOME/.gem/ruby/3.4.0/bin:$PATH"
export LANG=en_US.UTF-8

cd "$(dirname "$0")"

echo "🚀 Building iOS development build..."
echo "Ruby: $(ruby --version)"
echo "CocoaPods: $(pod --version 2>/dev/null || echo 'not found')"
echo ""

npx expo run:ios --device "iPhone 17 Pro Max" "$@"

