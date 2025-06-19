# 📱 Calm Recall – Feature Modules Overview

Calm Recall is a voice-AI-powered support app for dementia caregivers. It gently listens for repeated questions and plays rotating, calming voice responses — all customized and recorded by the caregiver. It also includes guided tools to help caregivers adapt communication and preserve emotional connection.

---

## ✅ Core App Modules

### 1. 🎙️ Voice Library Page

**Purpose:** Main interactive page where the app listens for repeated questions and plays pre-recorded caregiver responses.

**Features:**
- Caregiver selects listening mode when ready (Whisper + trigger phrase detection)
- Audio response playback (rotating variants)
- Caregiver sees prompts while recording:
  - Redirect → "Let’s check the garden."
  - Reassure → "You’re safe."
  - Validate → "That sounds hard."
- Reminders to update or add responses if repeated questions increase
- Voice rotation logic to avoid habituation

**Dependencies:**
- Whisper/tempo labs integration
- Audio storage and playback logic
- Keyword detection and response mapping
- Caregiver UI: record, preview, tag phrases

---

### 2. 🧠 Animated Walkthrough Module (Website)

**Purpose:** Interactive walkthrough to explain how to adapt communication by dementia stage.

**Features:**
- Scroll or button-based stage progression
- Stage name + signs + strategy + examples
- Optional: voice narration, icon set, calming animations
- Matches Calm Recall tone/colors

**Stages to include:**
- Early
- Early-Mid
- Mid
- Mid-Late
- Late

**Dependencies:**
- React component (`<Walkthrough />`)
- TailwindCSS + Framer Motion
- Content JSON per stage

---

### 3. ❓ Quiz-Style Companion Tool (Website or App)

**Purpose:** Helps caregivers choose communication strategies in real time based on situation.

**Features:**
- "What are you noticing right now?" flow
- Choose emotion/stage/context → get tactic
- Logic tree gives best-fit response strategy
- Could save preferences for future personalization

**Dependencies:**
- React form or chat-style UI
- State logic (React hooks or Zustand)
- Strategy library (shared with walkthrough)

---

### 4. 🖼️ Comfort Library

**Purpose:** Reminiscence therapy tool. Store meaningful memories with photos + narrated context.
Integration Points
1. Trigger Detection → Memory Prompt
When the Voice Library detects a repetitive question/name, show a gentle suggestion card:


┌─────────────────────────────────────┐
│ 💡 Memory Opportunity               │
│                                     │
│ [Person] has mentioned "Sarah"      │
│ 12 times today.                     │
│                                     │
│ Would you like to create a comfort  │
│ story about Sarah together?         │
│                                     │
│ [Maybe Later] [Create Story] ───────┤
└─────────────────────────────────────┘
2. Smart Content Suggestions
In the Comfort Library creation flow, auto-populate based on detected patterns:


Creating New Story
┌─────────────────────────────┐
│ We noticed repeated mentions │
│ of "work" - would this story │
│ be about:                    │
│                              │
│ ○ Your career achievements   │
│ ○ Favorite work memories     │
│ ○ Work colleagues           │
│ ○ Something else about work  │
└─────────────────────────────┘
3. Guided Story Creation Flow
Once they choose to create a story, guide them through contextual prompts:


📸 Add a photo of Sarah
🎙️ "Tell me about Sarah. What made her special?"
📝 Tag this for when they ask: "Where is Sarah?"
⏰ Best used during: Evening anxiety
🎨 UI Implementation Suggestions
Voice Library Dashboard Addition
Add a "Memory Opportunities" section that shows:

Most repeated topics this week
Suggested content to create
Stories already created from triggers
Comfort Library Enhancement
"Created from Voice Triggers" filter
Show origin story: "This was created because they kept asking about..."
Track effectiveness: "How well did this comfort them when they asked about Sarah again?"
Bridge Component: TriggerToMemory

typescript
<TriggerToMemoryBridge 
  trigger="Where is Sarah?"
  frequency={12}
  onCreateStory={() => navigateToComfortCreator({
    suggestedTitle: "Story about Sarah",
    relatedTrigger: "Where is Sarah?",
    promptTemplate: "sarah_missing_person"
  })}
/>
💡 Interaction Flow Example
Detection: "Where is Mom?" asked 8 times
Gentle Prompt: Small notification bubble with suggestion
Collaborative Creation:
"Let's create a special story about your mom"
Guide them through adding photo
Record their voice telling favorite memory
Tag it for when they ask about mom again
Future Deployment: Next time they ask "Where is Mom?", play the comfort story
Legacy Value: When verbal communication fades, the story preserves that connection
🎯 Emotional Benefits You've Identified
Transforms stress into connection: Repetitive questions become memory-building opportunities
Preserves the "why": Captures what made that person/place/thing significant
Caregiver healing: Helps them see the beauty in what the person is trying to hold onto
Future comfort: Creates content that will provide comfort even in later stages
This feature beautifully bridges the gap between "managing difficult behaviors" and "honoring what matters most to them." It's the kind of thoughtful design that could genuinely change how caregivers experience those repetitive moments.

**Features:**
- Upload photo or short video
- Record caregiver voiceover telling the story
- Tag with person/place/theme
- Replay for emotional redirection during anxiety
- Acts as emotional backup for future nonverbal stages

**Use case guidance (for caregiver):**
> “This photo of her cat keeps coming up. Record a version of the story in your voice while she can still help shape it. Later, it will bring comfort even if she forgets who you are.”

**Dependencies:**
- File uploader (photo, audio, optional video)
- Local or cloud storage
- Playback interface
- Optional: reminders to revisit or retell stories

---

## 🔄 Module Interactions

| Component         | Supports...                        | Draws From...                        |
|------------------|-------------------------------------|--------------------------------------|
| Voice Library     | Real-time calming & guidance       | Therapeutic strategy prompts         |
| Walkthrough       | Education, strategy building       | Stage-specific signs + tactics       |
| Quiz Tool         | Quick strategy support             | Same strategy library as Walkthrough |
| Comfort Library     | Reminiscence + future memory aid   | Caregiver-chosen emotional anchors   |

---

## 📌 Build Order Recommendation

### Phase 1 – Functional Core
- [ ] Build Voice Library (UI + triggers + playback + record)
- [ ] Begin collecting caregiver response templates (Redirect, Reassure…)

### Phase 2 – Content + Guidance
- [ ] Build Animated Walkthrough module (site-based)
- [ ] Write stage-by-stage content JSON (signs, tips, examples)

### Phase 3 – Companion Tools
- [ ] Add Quiz Tool as real-time shortcut to strategy suggestions
- [ ] Build shared logic store (strategy map, stage matcher)

### Phase 4 – Emotional Depth
- [ ] Create Comfort Library page (upload + tag + playback)
- [ ] Add reminders to review or update stories

---

## 🎨 Design Note

Use Calm Recall’s soft, teal-toned palette from the logo throughout UI. Avoid red tones. Prioritize emotional warmth, simplicity, and clarity.
