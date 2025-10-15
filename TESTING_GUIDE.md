# AI Chatbot Testing Guide

## Quick Start Testing

Follow these steps to test your new AI chatbot:

### Step 1: Configure API Key

1. Get your Gemini API key from: https://makersuite.google.com/app/apikey

2. Create `.env.local` file in the project root:
   ```bash
   # Windows
   echo GEMINI_API_KEY="your-actual-api-key-here" > .env.local
   
   # Mac/Linux
   echo 'GEMINI_API_KEY="your-actual-api-key-here"' > .env.local
   ```

3. Or manually create `.env.local` with:
   ```env
   GEMINI_API_KEY="your-actual-api-key-here"
   ```

### Step 2: Start the Development Server

```bash
npm run dev
```

Wait for the server to start (usually at http://localhost:3000)

### Step 3: Access Admin Area

1. Open browser to http://localhost:3000
2. Log in with Admin credentials
3. Navigate to any admin page (e.g., `/admin/dashboard`)

### Step 4: Open the Chatbot

Look for a **blue floating button** in the bottom-right corner of the page:
- Icon: Message bubble (MessageSquare)
- Color: Blue gradient
- Position: Bottom-right, 24px from edges

Click the button to open the chat panel.

## Test Scenarios

### Test 1: Basic Vehicle Query

**Ask**: "Show me all vehicles"

**Expected Response**:
- Markdown table with columns: VIN, Make, Model, Year, Color, Status, Owner, Location
- All vehicles from your database
- Properly formatted table

### Test 2: Filtered Vehicle Query

**Ask**: "Which vehicles are in transit?"

**Expected Response**:
- Filtered table showing only vehicles with status "In Transit"
- Same table format as Test 1

### Test 3: Owner Information

**Ask**: "List all vehicle owners"

**Expected Response**:
- Table with: Name, Email, Phone, Nationality, Vehicle Count
- All owners from database

### Test 4: Specific Owner Query

**Ask**: "Show me vehicles owned by [Owner Name]"

**Expected Response**:
- Table of vehicles filtered by that owner
- Or a message saying no vehicles found

### Test 5: Location Query

**Ask**: "What locations are operational?"

**Expected Response**:
- Table with: Name, Type, City, Country
- Filtered to show only operational locations

### Test 6: Customs Status

**Ask**: "Which vehicles are clearing customs?"

**Expected Response**:
- Filtered table of vehicles with "Clearing Customs" status
- Should include customs details

### Test 7: Single Vehicle Details

**Ask**: "Tell me about vehicle with VIN [specific VIN]"

**Expected Response**:
- Bullet list format with detailed information
- Make, Model, Year, Status, Owner, Location, etc.

### Test 8: Count Query

**Ask**: "How many vehicles do we have?"

**Expected Response**:
- Direct answer with the count
- Possibly breakdown by status

### Test 9: Owner Vehicle Count

**Ask**: "Which owner has the most vehicles?"

**Expected Response**:
- Owner name and count
- Possibly a ranked list

### Test 10: Complex Query

**Ask**: "Show me all Toyota vehicles that are in transit with their owners"

**Expected Response**:
- Filtered table combining multiple criteria
- Shows Make, Model, Status, Owner information

## Visual Checks

### Chat Panel (When Open)

✅ **Header**:
- Blue gradient background
- "Fleet AI Assistant" title
- Green pulsing dot (online indicator)
- Clear (trash) button if messages exist
- Close (X) button

✅ **Welcome Screen** (no messages):
- Centered icon
- Welcome message
- Example questions listed

✅ **Messages Area**:
- User messages: right-aligned, blue background
- AI messages: left-aligned, gray background
- Tables render correctly with borders
- Lists are properly formatted
- Scrollable content
- Auto-scrolls to newest message

✅ **Input Area**:
- Text input field
- Send button (blue)
- Loading spinner when processing
- Disabled state during loading
- Disclaimer text

### Floating Button

✅ **Appearance**:
- 56x56px circular button
- Blue gradient background
- MessageSquare icon when closed
- X icon when open
- Shadow effect
- Scale animation on hover

✅ **Badge** (if messages exist and panel closed):
- Red circular badge
- White number
- Top-right position on button

## Error Scenarios

### Test: Missing API Key

1. Remove or comment out `GEMINI_API_KEY` in `.env.local`
2. Restart server
3. Try to send a message

**Expected**: Error message in chat indicating API key not configured

### Test: Invalid API Key

1. Set `GEMINI_API_KEY` to an invalid value
2. Restart server
3. Try to send a message

**Expected**: Error message indicating authentication failed

### Test: Network Issue

1. Disconnect internet
2. Try to send a message

**Expected**: Error message indicating connection failed

## Performance Checks

✅ **Response Time**:
- Context fetch: < 2 seconds
- AI response: 2-5 seconds (depends on query complexity)
- UI remains responsive during processing

✅ **Animation Performance**:
- Panel slides smoothly (300ms)
- No jank or stuttering
- Button hover scales smoothly

✅ **Scroll Behavior**:
- Auto-scrolls to new messages
- Smooth scrolling animation
- Maintains scroll position when typing

## Browser Compatibility

Test in:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (responsive design)

## Mobile Testing

On mobile devices:
- Button should be easily tappable
- Panel should take full width
- Backdrop should appear and be tappable to close
- Keyboard should push input up, not cover it
- Messages should be readable without horizontal scroll

## Common Issues and Solutions

### Issue: Chatbot button not visible

**Solutions**:
1. Ensure you're on an admin page (`/admin/*`)
2. Check you're logged in as Admin role
3. Clear browser cache
4. Check browser console for errors

### Issue: "API key not configured" error

**Solutions**:
1. Verify `.env.local` exists in project root
2. Check variable name is exactly `GEMINI_API_KEY`
3. Restart development server
4. Check for typos in the key

### Issue: Slow responses

**Solutions**:
1. Check internet connection
2. Verify Gemini API status
3. Check if database queries are slow
4. Consider pagination for large datasets

### Issue: Tables not rendering correctly

**Solutions**:
1. Check browser console for errors
2. Verify react-markdown is installed
3. Clear browser cache
4. Try a different browser

### Issue: Messages not scrolling

**Solutions**:
1. Check for JavaScript errors in console
2. Verify chat panel CSS is loading
3. Try clearing messages and starting fresh

## Debug Mode

To see detailed logs:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for:
   - "Error fetching chatbot context" - Context API issues
   - "Error in chat endpoint" - Chat API issues
   - "Error communicating with Gemini AI" - Gemini API issues
   - "Error sending message" - Frontend issues

## API Testing (Optional)

Test APIs directly using curl or Postman:

### Test Context Endpoint
```bash
curl http://localhost:3000/api/chatbot/context
```

**Expected**: JSON with vehicles, owners, locations arrays

### Test Chat Endpoint
```bash
curl -X POST http://localhost:3000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me all vehicles"}'
```

**Expected**: JSON with success=true and message field containing AI response

## Success Criteria

✅ All 10 test scenarios pass
✅ No console errors
✅ Smooth animations
✅ Responsive on mobile
✅ Tables render correctly
✅ Loading states work
✅ Error messages display properly
✅ Can clear messages
✅ Can close/reopen panel
✅ Messages persist during session

## Reporting Issues

If you encounter issues:

1. Check browser console for errors
2. Check terminal for server errors
3. Verify all dependencies are installed
4. Ensure database has data to query
5. Test with simple queries first
6. Verify API key is valid and has quota

---

**Ready to test?** Start with Step 1 above! 🚀

