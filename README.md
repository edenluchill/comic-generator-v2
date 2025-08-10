# Comic AI Generator

This is a [Next.js](https://nextjs.org) project that uses AI to generate comic-style sketches and caricatures from facial analysis.

## Features

- **Facial Analysis**: Analyze facial features using OpenAI
- **Sketch Generation**: Generate comic-style sketches using Stable Diffusion
- **Interactive Workshop**: User-friendly interface for creating comic characters

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

- `/src/app/api/analyze-face` - API endpoint for facial analysis
- `/src/app/api/generate-sketch` - API endpoint for sketch generation
- `/src/app/workshop` - Interactive workshop interface
- `/src/lib/openai-facial-analyzer.ts` - OpenAI integration for facial analysis
- `/src/lib/stable-diffusion-generator.ts` - Stable Diffusion integration for image generation

## Technologies Used

- **Next.js** - React framework
- **OpenAI API** - For facial analysis
- **Stable Diffusion** - For AI image generation
- **TypeScript** - Type-safe development
- This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

# stripe events needed

charge.succeeded
payment_method.attached
customer.subscription.created
payment_intent.succeeded
payment_intent.created
invoice.created
invoice.finalized
invoice.paid
