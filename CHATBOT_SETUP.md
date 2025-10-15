# AI Chatbot Setup Guide

## Overview

The AI Chatbot is an intelligent assistant that helps admins answer questions about vehicles, owners, and locations using Google's Gemini AI.

## Features

- **Real-time Data Access**: Queries live data from your database
- **Natural Language Understanding**: Ask questions in plain English
- **Structured Responses**: Returns data in tables and lists for easy reading
- **Admin-Only Access**: Available only to users with Admin role
- **Floating Interface**: Accessible from any admin page via a floating button

## Setup Instructions

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Environment Variable

Create a `.env.local` file in the project root (if it doesn't exist) and add:

```env
GEMINI_API_KEY="your-actual-api-key-here"
```

**Important**: Never commit your `.env.local` file to version control!

### 3. Restart Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

## Usage

### Accessing the Chatbot

1. Log in as an Admin user
2. Look for the blue floating button in the bottom-right corner
3. Click to open the chat panel
4. Start asking questions!

### Example Questions

- "Show me all vehicles in transit"
- "Which owners have the most vehicles?"
- "List all operational locations"
- "What vehicles are clearing customs?"
- "Find vehicles for owner John Doe"
- "Show me the status of VIN ABC123"
- "Which locations are in Miami?"

### Response Formats

The AI will format responses appropriately:

- **Multiple Records**: Displayed in markdown tables
- **Single Record**: Displayed as bullet lists
- **Status Updates**: Clear text explanations

## Technical Details

### API Endpoints

- `GET /api/chatbot/context` - Fetches all vehicles, owners, and locations
- `POST /api/chatbot/chat` - Sends messages and receives AI responses

### Components

- `FloatingChatButton` - Bottom-right floating button
- `ChatPanel` - Slide-in chat interface
- `Message` - Individual message display with markdown support

### State Management

Uses Zustand for global state:
- Chat open/closed state
- Message history
- Loading states

### Data Context

The AI has access to:

**Vehicles:**
- VIN, Make, Model, Year, Color
- Status, Order Date, Estimated Delivery
- Owner information
- Current location
- Customs status and import duty

**Owners:**
- Name, Email, Phone
- Address, Nationality, ID Number
- Vehicle count

**Locations:**
- Name, Type, Status
- City, Country
- Contact information

## Troubleshooting

### "GEMINI_API_KEY is not configured"

- Ensure `.env.local` exists in project root
- Check the variable name is exactly `GEMINI_API_KEY`
- Restart your development server

### Chat not responding

- Check your API key is valid
- Ensure you have internet connectivity
- Check browser console for errors
- Verify the API endpoints are accessible

### Chatbot button not visible

- Ensure you're logged in as an Admin user
- The button only appears on admin pages (`/admin/*`)
- Check if JavaScript is enabled

## Limitations

- Responses depend on data quality in your database
- AI may occasionally provide incorrect interpretations
- Always verify critical information manually
- Rate limits apply based on Gemini API tier

## Security Notes

- Chatbot is admin-only by virtue of being in the admin layout
- No authentication check is performed in the API routes themselves
- Consider adding role-based authentication to the API endpoints for production
- API keys should never be exposed to the client-side

## Future Enhancements

Potential improvements:
- Conversation history persistence
- Export chat transcripts
- Voice input/output
- Custom training on specific fleet data
- Multi-language support

