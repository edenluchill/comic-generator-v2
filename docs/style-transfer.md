# Style Transfer Feature

This document describes the BFL AI style transfer integration in the comic generator project.

## Overview

The style transfer feature allows users to transfer the artistic style from one image to another using BFL AI's Flux Kontext Pro API. This is integrated into the existing comic generator project with full authentication, credit system, and streaming progress updates.

## Features

- **Dual Image Upload**: Upload a base image and a style reference image
- **Custom Prompts**: Optional custom prompts to guide the style transfer
- **Real-time Progress**: Streaming progress updates during generation
- **Credit System**: Integrated with the existing credit system (costs 5 credits)
- **Authentication**: Requires user login
- **File Validation**: Supports JPEG, PNG, and WebP formats up to 10MB
- **Result Download**: Download generated images directly

## API Integration

### Service Layer
- `src/lib/services/style-transfer.service.ts` - Core service for BFL API integration
- Handles image conversion, API calls, polling, and storage

### API Route
- `src/app/api/style-transfer/route.ts` - REST API endpoint
- Handles authentication, validation, credit checks, and streaming responses

### React Integration
- `src/hooks/useStyleTransfer.ts` - React hook for UI integration
- `src/components/StyleTransfer/StyleTransferInterface.tsx` - UI component

## Usage

### Command Line Scripts

1. **Test API Connection**:
   ```bash
   npm run test-style-transfer
   ```

2. **Manual Style Transfer** (requires pic1.png and pic2.png):
   ```bash
   npm run style-transfer
   ```

### React Component

```tsx
import { StyleTransferInterface } from "@/components/StyleTransfer";

function MyPage() {
  return (
    <StyleTransferInterface 
      onComplete={(result) => {
        console.log("Style transfer completed:", result);
      }}
    />
  );
}
```

### API Usage

```typescript
const formData = new FormData();
formData.append("baseImage", baseImageFile);
formData.append("styleReference", styleReferenceFile);
formData.append("prompt", "Optional custom prompt");

const response = await fetch("/api/style-transfer", {
  method: "POST",
  body: formData,
});

// Handle streaming response...
```

## Configuration

### Environment Variables

The BFL API key is configured in the following order:
1. `BFL_API_KEY` environment variable
2. Fallback to hardcoded key: `b4101592-cdac-428d-8fdb-8e7f858228aa`

### Credit Costs

- Style transfer costs 5 credits per generation
- Defined in `src/types/credits.ts` as `CREDIT_COSTS.STYLE_TRANSFER`

## File Structure

```
src/
├── lib/
│   └── services/
│       └── style-transfer.service.ts
├── app/
│   └── api/
│       └── style-transfer/
│           └── route.ts
├── hooks/
│   └── useStyleTransfer.ts
├── components/
│   └── StyleTransfer/
│       ├── index.ts
│       └── StyleTransferInterface.tsx
└── types/
    └── credits.ts (updated with STYLE_TRANSFER cost)

scripts/
├── bfl-style-transfer.js (original script)
└── test-style-transfer.js (API test script)
```

## Error Handling

The system handles various error scenarios:
- Invalid file formats or sizes
- Insufficient credits
- API failures
- Network timeouts
- Authentication errors

## Progress Tracking

The style transfer process includes these steps:
1. **Validation** (10%): Validate input files and parameters
2. **Credits** (10%): Check and reserve credits
3. **Transfer** (70%): Perform style transfer with BFL API
4. **Storage** (10%): Save result and deduct credits

## Security

- User authentication required
- File type and size validation
- Credit system integration
- Secure API key handling

## Performance

- Streaming responses for real-time progress
- Efficient image conversion and storage
- Timeout handling (4 minutes max)
- Background processing with polling
