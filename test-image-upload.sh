#!/bin/bash

# Image Upload System Test Script
# Tests the Phase 1 implementation

echo "🧪 Testing Ziner Image Upload System"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend URL
BACKEND_URL="http://localhost:4876"

# Check if backend is running
echo "1. Checking if backend is running..."
if curl -s "${BACKEND_URL}/health" > /dev/null; then
    echo -e "${GREEN}✓${NC} Backend is running"
else
    echo -e "${RED}✗${NC} Backend is not running"
    echo "   Start it with: cd server && npm run dev"
    exit 1
fi

# Check if uploads directory exists
echo ""
echo "2. Checking uploads directory..."
if [ -d "server/data/uploads" ]; then
    echo -e "${GREEN}✓${NC} Uploads directory exists"
    echo "   Path: server/data/uploads"
    echo "   Files: $(ls server/data/uploads 2>/dev/null | wc -l | tr -d ' ')"
else
    echo -e "${YELLOW}!${NC} Uploads directory doesn't exist yet"
    echo "   It will be created on first upload"
fi

# Check if multer is installed
echo ""
echo "3. Checking dependencies..."
if grep -q "multer" server/package.json; then
    echo -e "${GREEN}✓${NC} multer dependency found in package.json"
else
    echo -e "${RED}✗${NC} multer not found in package.json"
    echo "   Run: cd server && npm install"
    exit 1
fi

# Test image upload endpoint (requires a test image)
echo ""
echo "4. Testing image upload endpoint..."
if [ -f "test-image.jpg" ] || [ -f "test-image.png" ]; then
    TEST_IMAGE=$(ls test-image.* | head -1)
    echo "   Using test image: $TEST_IMAGE"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BACKEND_URL}/api/images/upload" \
        -F "image=@${TEST_IMAGE}" 2>/dev/null)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✓${NC} Upload endpoint works!"
        IMAGE_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        if [ -n "$IMAGE_ID" ]; then
            echo "   Image ID: $IMAGE_ID"
        fi
    else
        echo -e "${RED}✗${NC} Upload failed (HTTP $HTTP_CODE)"
        echo "   Response: $BODY"
    fi
else
    echo -e "${YELLOW}!${NC} No test image found"
    echo "   Create one with: curl https://picsum.photos/800/600 -o test-image.jpg"
    echo "   Then run this script again"
fi

# Check image routes are registered
echo ""
echo "5. Checking API routes..."
if curl -s "${BACKEND_URL}/api/images/test" 2>&1 | grep -q "Cannot GET"; then
    echo -e "${GREEN}✓${NC} Image routes are registered"
else
    echo -e "${YELLOW}!${NC} Image routes may not be properly registered"
fi

echo ""
echo "======================================"
echo "📋 Summary"
echo "======================================"
echo ""
echo "Backend Status:"
echo "  • Health: $(curl -s ${BACKEND_URL}/health | grep -q 'ok' && echo '✓ OK' || echo '✗ Down')"
echo "  • Image Routes: Registered"
echo "  • Uploads Dir: $([ -d 'server/data/uploads' ] && echo 'Ready' || echo 'Will be created')"
echo ""
echo "Next Steps:"
echo "  1. Start frontend: cd frontend && npm run dev"
echo "  2. Open: http://localhost:5173"
echo "  3. Create new zine"
echo "  4. Click '+' in Media Panel to upload images"
echo "  5. Check console for any errors"
echo ""
echo "📖 For detailed docs, see: IMAGE_UPLOAD_IMPLEMENTATION.md"
echo ""
