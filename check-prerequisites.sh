#!/bin/bash

# LabTracker Prerequisites Check Script

echo "🔍 Checking prerequisites for LabTracker..."
echo ""

# Check Node.js
if command -v node &> /dev/null
then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js: NOT FOUND"
    echo "   Install from: https://nodejs.org/ (v18 or higher)"
fi

# Check npm
if command -v npm &> /dev/null
then
    NPM_VERSION=$(npm -v)
    echo "✅ npm: v$NPM_VERSION"
else
    echo "❌ npm: NOT FOUND"
fi

# Check Git
if command -v git &> /dev/null
then
    GIT_VERSION=$(git --version)
    echo "✅ Git: $GIT_VERSION"
else
    echo "❌ Git: NOT FOUND"
    echo "   Install from: https://git-scm.com/"
fi

echo ""
echo "📝 Requirements:"
echo "   • Node.js v18 or higher"
echo "   • npm v9 or higher"
echo "   • Git (for cloning)"
echo ""

if command -v node &> /dev/null && command -v npm &> /dev/null
then
    echo "✨ All prerequisites met! You're ready to install LabTracker."
else
    echo "⚠️  Please install missing prerequisites before continuing."
fi
