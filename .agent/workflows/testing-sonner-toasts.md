# Testing Sonner Toast Notifications

## How to Test Each Toast Type

### 1. Rate Limit Error Toast
**Trigger:** Send multiple messages quickly (more than rate limit allows)

**Expected Result:**
- 🔴 Red error toast appears: "Rate Limit Exceeded"
- ⏱️ Orange countdown indicator shows below
- 📝 Description: "You've sent too many requests. Please wait..."

### 2. Authentication Error Toast
**Trigger:** Clear cookies/sign out and try to send a message

**Expected Result:**
- 🔴 Red error toast: "Authentication Error"
- 📝 Description: "Please sign in again to continue"

### 3. Session Error Toast  
**Trigger:** Session expires or is invalidated

**Expected Result:**
- 🔴 Red error toast: "Session Error"
- 📝 Description: "Your session has expired. Please refresh the page"

### 4. Code Generation Error Toast
**Trigger:** API error during code generation

**Expected Result:**
- 🔴 Red error toast: "Code Generation Failed"
- 📝 Description shows the specific error message

### 5. History Loading Error Toast
**Trigger:** Network error when loading chat history

**Expected Result:**
- 🔴 Red error toast: "Failed to Load History"
- 📝 Description: "Could not load chat history"

## Visual Location

Toasts appear at the **top-right** corner of the screen by default.

```
┌─────────────────────────────────┐
│  [X] Rate Limit Exceeded       │ ← Toast (auto-dismiss)
│  You've sent too many...       │
└─────────────────────────────────┘
```

## UI Elements Still Present

Below the chat input area:

```
┌────────────────────────────────┐
│ ⏰ Rate Limit Indicator        │ ← Orange countdown
├────────────────────────────────┤
│ ⚠️ Error Banner [X]            │ ← Red dismissible banner
├────────────────────────────────┤
│ [Textarea Input]               │
│ [Send Button]                  │
└────────────────────────────────┘
```

## Toast Features

✅ **Auto-dismiss** - Disappears after ~4 seconds
✅ **Manual dismiss** - Click X to close immediately
✅ **Stacking** - Multiple toasts stack vertically
✅ **Swipe to dismiss** - Swipe right on mobile
✅ **Animations** - Smooth slide-in/slide-out
✅ **Descriptions** - Two-line format (title + description)

## Custom Toast Options

You can also customize toasts:

```tsx
import { toast } from "sonner"

// Custom duration
toast.error("Error", {
  description: "Something went wrong",
  duration: 5000, // 5 seconds
})

// With action button
toast.error("Error", {
  description: "Operation failed",
  action: {
    label: "Retry",
    onClick: () => console.log("Retry clicked"),
  },
})

// Success toast
toast.success("Success!", {
  description: "Code generated successfully",
})

// Loading toast (for async operations)
const toastId = toast.loading("Generating code...")
// Later:
toast.success("Done!", { id: toastId })
```

## Color Scheme (Dark Mode)

- **Error**: Red background (#7f1d1d) with red text
- **Success**: Green background (#14532d) with green text  
- **Warning**: Orange background (#7c2d12) with orange text
- **Info**: Blue background (#1e3a8a) with blue text
- **Default**: Gray background (#1f2937) with white text

All designed to match your dark theme! 🎨
