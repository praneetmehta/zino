# Custom Layouts Directory

This directory contains user-created custom layouts saved from the Layout Builder.

## How It Works

1. When you create a layout in the Layout Builder and save it, the layout is saved as a JSON file in this directory via the backend API
2. The layout files are automatically loaded by Vite's glob import in `layoutLoader.js`
3. Custom layouts appear in the Layout Library under the "Custom" category

## File Format

Each layout file should follow this structure:

```json
{
  "id": "custom-1234567890",
  "name": "My Custom Layout",
  "category": "custom",
  "icon": "⭐",
  "slots": [
    {
      "x": 0,
      "y": 0,
      "width": 50,
      "height": 100,
      "type": "image"
    }
  ],
  "textElements": [
    {
      "id": "text-1234567890",
      "x": 50,
      "y": 20,
      "width": 40,
      "height": 15,
      "content": "Your Text Here",
      "style": {
        "fontSize": 24,
        "color": "#000000",
        "fontWeight": 400,
        "textAlign": "left",
        "padding": 10,
        "lineHeight": 1.4
      }
    }
  ]
}
```

## Notes

- Layout files are created automatically by the backend when you save from the Layout Builder
- You can manually edit these files if needed
- The `id` should be unique and typically follows the pattern `custom-{timestamp}`
- All coordinates are in percentages (0-100)
