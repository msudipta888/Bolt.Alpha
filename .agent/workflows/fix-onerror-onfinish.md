# Fix: Preventing Code Generation on Chat Errors

## Problem

When the AI chat API returned an error (like a rate limit error), the `onError` callback was triggered correctly, but the `onFinish` callback was **also** being executed. This caused the `generateCode()` function to run even though the chat had failed, resulting in unnecessary `/api/ai-code` requests.

### Flow Before Fix:
1. User sends message
2. Rate limit error occurs (429)
3. `onError` is triggered → Shows error toast ✅
4. `onFinish` is **also** triggered → Calls `generateCode()` ❌ **BUG!**
5. Unnecessary code generation request sent

## Root Cause

The `useChat` hook from AI SDK can trigger both `onError` and `onFinish` depending on:
- When the error occurs (before stream starts vs during stream)
- How the error is thrown
- The specific error type

This means `onFinish` can sometimes run even when there was an error, leading to unwanted side effects.

## Solution

Added an error tracking mechanism using a React ref to prevent `onFinish` from proceeding when an error has occurred.

### Implementation:

```typescript
// 1. Add error tracking ref
const hasErrorOccurred = useRef(false);

// 2. Set flag when error occurs
onError: (error) => {
    setLoader(false);
    setError(error.message);
    hasErrorOccurred.current = true; // ← Mark that error occurred
    
    // Show toast...
}

// 3. Guard in onFinish
onFinish: async (response) => {
    try {
        // Don't proceed if an error occurred
        if (hasErrorOccurred.current) {
            console.log("Skipping onFinish due to previous error");
            hasErrorOccurred.current = false; // Reset for next message
            return; // ← Exit early!
        }
        
        // Normal flow continues...
        await generateCode(responseText);
    }
}

// 4. Reset flag before each new message
// In all three places where sendMessage is called:
hasErrorOccurred.current = false; // Clean slate for new message
sendMessage({...});
```

### Reset Points:

The error flag is reset **before** sending each new message in 3 locations:

1. **Initial code generation** (from mes state)
   ```typescript
   hasErrorOccurred.current = false;
   sendMessage({...});
   ```

2. **Enter key handler** (handleKeyDown)
   ```typescript
   hasErrorOccurred.current = false;
   sendMessage({...});
   ```

3. **Send button click** (onClick)
   ```typescript
   hasErrorOccurred.current = false;
   sendMessage({...});
   ```

## Flow After Fix:

### Scenario 1: Error Occurs
1. User sends message
2. Rate limit error (429)
3. `onError` → Sets `hasErrorOccurred.current = true`, shows toast ✅
4. `onFinish` → Checks flag, sees error occurred, returns early ✅
5. **No code generation request** ✅

### Scenario 2: Success
1. User sends message
2. AI responds successfully
3. `onFinish` → Flag is false, proceeds normally ✅
4. Calls `generateCode()` ✅
5. Code is generated ✅

### Scenario 3: Error Then Success
1. User sends message → Error occurs (flag = true)
2. `onFinish` skipped ✅
3. User sends **new** message → Flag reset to false
4. AI responds successfully
5. `onFinish` proceeds normally ✅
6. Code is generated ✅

## Benefits

✅ **No wasted API calls** - Code generation only happens on successful chat responses
✅ **Better error handling** - Clean separation between error and success paths
✅ **Resource efficiency** - Saves Inngest queue processing and AI API costs
✅ **User experience** - Users don't see code generation loading when there's an error
✅ **Predictable behavior** - Clear flow control

## Testing

To verify the fix works:

1. **Test rate limit error:**
   - Send multiple messages quickly to trigger rate limit
   - Check network tab - should see NO `/api/ai-code` request
   - Should only see error toast

2. **Test successful flow:**
   - Send a normal message
   - Should see both `/api/ai-chat` and `/api/ai-code` requests
   - Code should generate normally

3. **Test error recovery:**
   - Trigger an error
   - Wait and send a valid message
   - Should work normally (flag was reset)

## Edge Cases Handled

✅ Multiple errors in a row
✅ Error followed by success
✅ Success followed by error
✅ Rapid message sending
✅ Network timeouts
✅ API errors vs rate limits

## Performance Impact

- **Negligible** - Just a boolean ref check
- No re-renders (using ref, not state)
- Prevents expensive code generation API calls when not needed

This fix ensures that code generation only happens when the chat API succeeds, preventing unnecessary processing and improving the overall reliability of the application! 🎉
