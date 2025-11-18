#!/bin/bash
# Run this AFTER Homebrew installation completes

set -e

echo "🔧 Setting up Ruby and CocoaPods with Homebrew..."

# Add Homebrew to PATH (if not already added)
if ! command -v brew &> /dev/null; then
    echo "📝 Adding Homebrew to PATH..."
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
fi

# Install Ruby
echo ""
echo "📦 Installing Ruby via Homebrew..."
brew install ruby

# Add Homebrew Ruby to PATH
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"

# Verify Ruby version
echo ""
echo "✅ Ruby installed: $(ruby --version)"

# Install CocoaPods
echo ""
echo "📦 Installing CocoaPods..."
gem install cocoapods

echo ""
echo "✅ CocoaPods installed: $(pod --version)"

# Install iOS dependencies
echo ""
echo "📦 Installing iOS CocoaPods dependencies..."
cd "$(dirname "$0")"
if [ -d "ios" ]; then
    cd ios
    pod install
    cd ..
    echo "✅ iOS dependencies installed"
else
    echo "⚠️  iOS directory not found. Run 'npx expo prebuild' first."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "You can now build your iOS app:"
echo "   npx expo run:ios"

