# 📄 Lite-Typing Project Documentation

## 📌 Project Overview
A minimal web-based typing test application focused on real-time performance feedback, including WPM, accuracy, and error tracking. Designed to be lightweight, responsive, and distraction-free.

---

## 🧭 Product Requirements Document (PRD)

### 🎯 Goals & Objectives
- Provide a typing test with random or predefined texts.
- Track and display real-time stats: WPM, accuracy, and errors.
- Highlight correct and incorrect characters.
- Show a results summary after test completion.

### 👤 Target Users
- Students, writers, programmers, and general users seeking to improve typing speed and accuracy.

### 🖼️ User Flow
1. Landing screen with "Start Test" button.
2. Typing screen with real-time performance tracking.
3. Results screen with stats and restart option.

### ⚙️ Key Functional Requirements
- Random text selection.
- Controlled input capturing.
- Real-time WPM and accuracy calculation.
- Error highlighting.
- Results summary upon completion.

### 🧪 Non-functional Requirements
- Responsive and mobile-friendly.
- Fast, smooth user experience.
- Simple, minimal UI.

### 🛠️ Suggested Tech Stack
- Frontend: React (or Expo for mobile)
- Styling: Tailwind CSS
- State: React Context or Zustand
- Deployment: Vercel / Netlify

---

## 📋 Development Tasks Breakdown

### 1. Project Setup ✅
- [x] Initialize project repo (React or Expo)
- [x] Create folder structure: `components/`, `screens/`, `utils/`
- [x] Install Tailwind CSS and configure
- [x] Load static text sample

### 2. Typing Test Screen ✅
- [x] Render target text
- [x] Capture user input in hidden field
- [x] Highlight correct/incorrect characters
- [x] Display real-time WPM, accuracy, and progress

### 3. Typing Logic & Stats ✅
- [x] Start timer on first keystroke
- [x] WPM calculation with error penalties
- [x] Accuracy = correct / total typed
- [x] Track errors and progress
- [x] Detect test completion

### 4. Results Screen ✅
- [x] Display WPM, accuracy, errors
- [x] Add "Restart" button to reset state

### 5. Responsive Design ✅
- [x] Mobile-friendly layout
- [x] Adapt font sizes and layout
- [x] Test on various devices

### 6. Final Testing & Polish ✅
- [x] Handle edge cases
- [x] Cross-browser testing
- [x] UI clean-up and accessibility check

### 7. Deployment
- [ ] Setup on Vercel / Netlify
- [ ] Final test before going live

---

## 🗃️ Database Structure (Future Use)
*Not used in v1, but useful for future features like user profiles or leaderboards.*

### Tables:

#### `users`
| Field       | Type    | Description              |
|-------------|---------|--------------------------|
| id          | UUID    | Primary key              |
| username    | String  | Unique display name      |
| created_at  | Date    | Signup timestamp         |

#### `typing_sessions`
| Field       | Type    | Description              |
|-------------|---------|--------------------------|
| id          | UUID    | Primary key              |
| user_id     | UUID    | Foreign key to `users`   |
| wpm         | Number  | Words per minute         |
| accuracy    | Number  | % of correct characters  |
| errors      | Number  | Total errors             |
| duration    | Number  | Time in seconds          |
| created_at  | Date    | Test timestamp           |

**Relation:**
- One `user` → Many `typing_sessions`

---

## 🔁 Diagram Flows

### User Flow Diagram
```
[Landing Page]
      ↓
[Typing Test Screen]
      ↓
[Calculate Stats in Real Time]
      ↓
[Test Completed?] ---> [No] → Continue Typing
      ↓
     [Yes]
      ↓
[Results Screen]
      ↓
[Restart Test]
```

### Typing State Logic
```
START → First Keystroke → Start Timer
        ↓
    For each char:
     - Check against expected char
     - Update correct/errors count
     - Recalculate WPM, accuracy
        ↓
    End of Text → Stop Timer → Show Results
```

---

## 📝 Implementation Notes

### Current Features
- Real-time WPM calculation with error penalties
- Multiple sample texts with random selection
- Responsive design for all screen sizes
- Accessibility features (ARIA labels, keyboard navigation)
- Error handling and edge cases
- Clean, minimal UI with Tailwind CSS

### WPM Calculation
- Raw WPM = (total characters / 5) / time in minutes
- Error penalty = 1 WPM for every 2% of errors
- Final WPM = Raw WPM - Penalty (minimum 0)

### Future Enhancements
- User profiles and statistics
- Leaderboard system
- Different difficulty levels
- Time-based tests
- Custom text input
- Dark/light mode toggle

