# HEIF/HEIC Image Support

## Overview

The server now supports HEIF/HEIC images (common on iOS devices) by automatically detecting and converting them to JPEG.

## How It Works

1. **Detection**: Server checks file signature (magic bytes) to detect HEIF files
2. **Conversion**: Uses Sharp to convert HEIF → JPEG
3. **Processing**: Continues normal image processing pipeline

## Requirements

### Sharp with libheif Support

Sharp needs libheif to decode HEIF images. Installation varies by platform:

#### macOS (Development)
```bash
# Install libheif via Homebrew
brew install libheif

# Reinstall Sharp to use system libheif
cd server
npm install --force
```

#### Linux (Production/Railway)
```bash
# Ubuntu/Debian
apt-get install libheif-dev

# Alpine
apk add libheif-dev

# Then reinstall Sharp
npm install --force
```

#### Docker
Add to your Dockerfile:
```dockerfile
RUN apt-get update && apt-get install -y libheif-dev
```

## Fallback Behavior

If libheif is not available:
- Server will return a clear error message
- Client-side conversion (heic2any) will handle it
- Users see: "HEIF format not supported. Please convert to JPEG before uploading."

## Testing

Upload a HEIF/HEIC file (common from iPhone):
1. Server logs: `🔍 HEIF file detected, converting to JPEG...`
2. Server logs: `✅ HEIF converted: X bytes → Y bytes`
3. Image processes normally

## Verification

Check if Sharp has HEIF support:
```javascript
const sharp = require('sharp');
console.log(sharp.format);
// Should include 'heif' in the list
```

## Railway Deployment

Add to Railway environment or build script:
```bash
# Install libheif before npm install
apt-get update && apt-get install -y libheif-dev
npm install
```

Or use a custom Nixpacks configuration:
```toml
[phases.setup]
aptPkgs = ["libheif-dev"]
```

## Client-Side Fallback

The frontend still has heic2any for client-side conversion as a fallback:
- Detects HEIF by file signature
- Converts to JPEG before upload
- Works even if server doesn't have libheif

## Supported Formats

After HEIF conversion, all standard formats are supported:
- JPEG/JPG
- PNG
- GIF
- WebP
- SVG
- HEIF/HEIC (auto-converted to JPEG)
