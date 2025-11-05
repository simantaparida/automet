# PWA Icons Setup Guide

## Missing Icons

The PWA `manifest.json` references the following icon files that need to be created:

- `/public/icon-192x192.png` - App icon for mobile devices (192×192px)
- `/public/icon-512x512.png` - App icon for desktop/tablet (512×512px)

## Icon Requirements

### Specifications
- **Format**: PNG with transparent background
- **Design**: Simple, recognizable logo/icon
- **Colors**: Match brand (Primary: `#450693`, Secondary: `#8C00FF`)
- **Purpose**: "any maskable" - works for both standard and adaptive icons

### Sizes
1. **192×192px** - Used for mobile home screens and app drawer
2. **512×512px** - Used for splash screens and high-DPI displays

## How to Create Icons

### Option 1: Using Online Tools (Recommended)
1. Visit [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
2. Upload a logo image (at least 512×512px)
3. Generate icon set
4. Download and place in `/public/` directory

### Option 2: Using Design Software
1. Create icon in Figma/Photoshop/Illustrator
2. Export as PNG at both sizes (192×192 and 512×512)
3. Ensure transparent background
4. Save to `/public/` with exact filenames

### Option 3: Using Command Line (ImageMagick)
```bash
# Install ImageMagick
brew install imagemagick  # macOS
sudo apt install imagemagick  # Linux

# Create icons from source image
convert logo.png -resize 192x192 public/icon-192x192.png
convert logo.png -resize 512x512 public/icon-512x512.png
```

### Option 4: Placeholder Icons (Development Only)
For development/testing, you can use solid color placeholders:

```bash
# Create purple placeholder icons
convert -size 192x192 xc:"#450693" public/icon-192x192.png
convert -size 512x512 xc:"#450693" public/icon-512x512.png
```

## Design Guidelines

### Brand Identity
- **Primary Color**: Purple (`#450693`)
- **Secondary Color**: Light Purple (`#8C00FF`)
- **Accent Colors**: Pink (`#FF3F7F`), Yellow (`#FFC400`)
- **Style**: Modern, clean, professional

### Icon Content Ideas
- Letter "A" for Automet
- Wrench/tool symbol (field service)
- Checklist icon (job tracking)
- Location pin (field work)
- Combination of above elements

## Verification

After creating icons, verify:

1. **File Existence**:
   ```bash
   ls -lh public/icon-*.png
   ```

2. **File Sizes**:
   - icon-192x192.png should be exactly 192×192px
   - icon-512x512.png should be exactly 512×512px

3. **Manifest Validation**:
   - Visit https://manifest-validator.appspot.com/
   - Test manifest.json with new icons

4. **PWA Test**:
   ```bash
   npm run build
   npm run start
   # Visit http://localhost:3000
   # Check browser console for PWA errors
   ```

## Favicon (Bonus)

While not required for PWA, consider also creating:
- `/public/favicon.ico` (16×16, 32×32, 48×48 multi-size)

```bash
convert icon-192x192.png -define icon:auto-resize=48,32,16 public/favicon.ico
```

## Current Status

⚠️ **Icons are currently missing**
- PWA installation will fail until icons are created
- manifest.json is configured correctly
- Theme color updated to match brand (#450693)

## Next Steps

1. Choose one of the options above to create icons
2. Place icon files in `/public/` directory
3. Verify files exist and have correct dimensions
4. Test PWA installation on mobile device
5. Update this file once icons are added

---

**Priority**: HIGH - Required for PWA functionality
**Estimated Time**: 15-30 minutes
