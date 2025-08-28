# Story Expansion Feature

## Overview

The Story Expansion feature enhances the comic generation workflow by using ChatGPT to automatically expand user-provided story inputs with rich details about environments, character interactions, emotional states, and visual elements.

## Features

### AI-Powered Story Enhancement

- **Environment Description**: Detailed scene settings, locations, time, weather
- **Character Interactions**: Enhanced dialogue and interaction details
- **Emotional Expression**: Character emotions and psychological states
- **Plot Development**: Additional story details and plot progression
- **Visual Elements**: Comic-appropriate visual descriptions

### User Interface

- **Expand Button**: Located in the diary input section with AI icon
- **Real-time Feedback**: Loading states and progress indicators
- **Result Preview**: Modal overlay showing expanded content
- **Action Options**: Use expanded version or copy to clipboard

## Technical Implementation

### API Endpoint

- **Route**: `/api/expand-story`
- **Method**: POST
- **Authentication**: Required (Bearer token)
- **Credit Cost**: 1 credit per expansion

### Request Format

```json
{
  "story": "User's original story text",
  "characters": [
    {
      "id": "character-id",
      "name": "Character Name",
      "avatar_url": "avatar-url"
    }
  ],
  "style": "cute|realistic|minimal|kawaii"
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "expandedStory": "Complete expanded story",
    "environment": "Detailed environment description",
    "mood": "Story atmosphere and emotional tone",
    "additionalDetails": "Other important details"
  }
}
```

### Components

#### EnhancedDiaryInput

- Replaces the original DiaryInput component
- Integrates story expansion functionality
- Provides modal overlay for result display
- Handles user interactions and state management

#### useStoryExpansion Hook

- Manages expansion state and API calls
- Handles error states and loading indicators
- Integrates with credit system
- Updates user profile and transaction history

## Usage Flow

1. **User Input**: User types their story in the diary input area
2. **Character Selection**: User must have at least one character created
3. **AI Expansion**: Click "AI Expand" button to enhance the story
4. **Result Review**: Modal shows expanded content with sections:
   - Environment Description
   - Emotional Atmosphere
   - Expanded Story
   - Additional Details
5. **Action**: User can use expanded version or copy to clipboard
6. **Credit Deduction**: 1 credit is deducted upon successful expansion

## Error Handling

- **Insufficient Credits**: Shows error message when user lacks credits
- **API Failures**: Displays error messages for network or server issues
- **Invalid Input**: Validates story content and character requirements
- **Authentication**: Requires valid user session

## Internationalization

The feature supports multiple languages with translation keys:

- `aiExpand`: AI Expand button text
- `expanding`: Loading state text
- `storyExpansion`: Modal title
- `environmentDescription`: Environment section title
- `emotionalAtmosphere`: Mood section title
- `expandedStory`: Story section title
- `additionalDetails`: Details section title
- `useExpandedVersion`: Use button text
- `copy`/`copied`: Copy button states
- `insufficientCredits`: Credit error message
- `expansionFailed`: General error message

## Dependencies

- OpenAI API (GPT-3.5-turbo)
- Credit system integration
- Authentication system
- Translation system
- React Query for state management

## Environment Variables

Required environment variables:

- `MYOPENAI_API_KEY`: OpenAI API key for ChatGPT integration

## Future Enhancements

- Multiple expansion styles (detailed, concise, creative)
- Character-specific expansion based on character traits
- Story genre-specific expansion patterns
- Batch expansion for multiple stories
- Expansion history and favorites
