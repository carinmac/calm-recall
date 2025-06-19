# 📊 Calm Recall – Data Structures & Content

This document provides the actual data structures, sample content, and configuration files needed for implementation.

---

## 🎯 Stage Content Data (stages.json)

```json
{
  "early": {
    "title": "Early Stage",
    "description": "Still independent but experiencing worry and difficulty with change",
    "signs": [
      "Maintains independence but feels worried",
      "Struggles with changes in routine",
      "May associate negative feelings with specific people",
      "Repeats questions about logistics and timing",
      "Seeks reassurance about plans and safety"
    ],
    "primaryStrategy": "reflect",
    "strategies": {
      "reflect": {
        "title": "Reflect Their Feelings",
        "description": "Acknowledge their emotions and validate their concerns",
        "examples": [
          {
            "situation": "They express worry about an upcoming appointment",
            "response": "You're right to feel unsure—things have changed lately.",
            "why": "Validates their emotional experience without dismissing concerns"
          },
          {
            "situation": "They seem anxious about a routine change",
            "response": "That would worry me too. Let's figure it out together.",
            "why": "Shows empathy and offers partnership"
          }
        ]
      }
    },
    "commonTriggers": [
      "What time is my appointment?",
      "Are you sure this is right?",
      "I don't remember this plan",
      "When are we leaving?",
      "Is everything okay?"
    ],
    "tips": [
      "Maintain familiar routines when possible",
      "Provide written reminders for important information",
      "Use calendars and visual aids",
      "Be patient with repeated questions"
    ]
  },
  "early-mid": {
    "title": "Early-Mid Stage",
    "description": "Increased confusion with some daily tasks, more repetitive behavior",
    "signs": [
      "Difficulty with complex tasks and decision-making",
      "Increased repetitive questions",
      "Some confusion about time and place",
      "May become frustrated when corrected",
      "Beginning to lose recent memories while retaining older ones"
    ],
    "primaryStrategy": "redirect",
    "strategies": {
      "redirect": {
        "title": "Gentle Redirection",
        "description": "Guide attention to something positive or familiar",
        "examples": [
          {
            "situation": "They keep asking about going home when they are home",
            "response": "Let's check on the garden together.",
            "why": "Redirects to a pleasant, familiar activity"
          },
          {
            "situation": "They're upset about a confusing situation",
            "response": "I have something interesting to show you.",
            "why": "Shifts focus without confronting the confusion"
          }
        ]
      }
    },
    "commonTriggers": [
      "Where is everyone?",
      "When am I going home?",
      "What am I supposed to do now?",
      "Have you seen my [item]?",
      "Why can't I remember?"
    ],
    "tips": [
      "Avoid correcting unless safety is involved",
      "Use distraction and redirection techniques",
      "Keep explanations simple and brief",
      "Focus on feelings rather than facts"
    ]
  },
  "mid": {
    "title": "Mid Stage",
    "description": "Significant memory loss, increased confusion, may not recognize familiar people",
    "signs": [
      "Major gaps in recent and some distant memory",
      "Difficulty recognizing familiar faces",
      "Confusion about time, place, and identity",
      "May create stories to fill memory gaps",
      "Increased anxiety and agitation"
    ],
    "primaryStrategy": "validate",
    "strategies": {
      "validate": {
        "title": "Validate Their Reality",
        "description": "Accept their version of reality and respond to emotions",
        "examples": [
          {
            "situation": "They say they need to get to work (though retired)",
            "response": "Tell me about your work. What do you do there?",
            "why": "Enters their reality and encourages positive reminiscence"
          },
          {
            "situation": "They're looking for someone who has died",
            "response": "You miss them. Tell me about them.",
            "why": "Validates emotion without causing distress about reality"
          }
        ]
      }
    },
    "commonTriggers": [
      "I need to get to work",
      "Where is my mother?",
      "I have to go home",
      "Who are you?",
      "I don't belong here"
    ],
    "tips": [
      "Enter their reality rather than correcting",
      "Focus on emotions behind the words",
      "Use photos and familiar objects for comfort",
      "Maintain calm, reassuring tone"
    ]
  },
  "mid-late": {
    "title": "Mid-Late Stage",
    "description": "Severe memory loss, limited verbal communication, increased physical needs",
    "signs": [
      "Very limited short-term memory",
      "Difficulty with verbal communication",
      "May not recognize close family members",
      "Increased physical assistance needed",
      "Communication through emotions and behaviors"
    ],
    "primaryStrategy": "reassure",
    "strategies": {
      "reassure": {
        "title": "Offer Comfort & Safety",
        "description": "Provide emotional reassurance through tone and presence",
        "examples": [
          {
            "situation": "They seem anxious or distressed",
            "response": "You're safe. I'm here with you.",
            "why": "Provides basic emotional comfort and security"
          },
          {
            "situation": "They're calling out or seem lost",
            "response": "Everything is okay. You're loved.",
            "why": "Addresses emotional needs with simple, soothing language"
          }
        ]
      }
    },
    "commonTriggers": [
      "Help me",
      "I want to go home",
      "I'm scared",
      "[Calling out names]",
      "[Non-verbal distress sounds]"
    ],
    "tips": [
      "Use simple, calm language",
      "Focus on physical comfort and safety",
      "Respond to emotional tone rather than words",
      "Use touch and familiar music for comfort"
    ]
  },
  "late": {
    "title": "Late Stage",
    "description": "Minimal verbal communication, complete care needed, comfort-focused",
    "signs": [
      "Very limited or no verbal communication",
      "Complete assistance needed for daily activities",
      "May not recognize anyone",
      "Communication primarily through emotions and physical responses",
      "Focus shifts to comfort and dignity"
    ],
    "primaryStrategy": "comfort",
    "strategies": {
      "comfort": {
        "title": "Provide Comfort & Presence",
        "description": "Focus on sensory comfort and emotional presence",
        "examples": [
          {
            "situation": "During care activities or distress",
            "response": "I'm here. You're comfortable and safe.",
            "why": "Provides calm presence and reassurance through tone"
          },
          {
            "situation": "Using familiar music or stories",
            "response": "[Playing familiar song or reading familiar story]",
            "why": "Uses sensory memories that may still provide comfort"
          }
        ]
      }
    },
    "commonTriggers": [
      "[Non-verbal sounds of distress]",
      "[Physical restlessness]",
      "[Changes in breathing or expression]"
    ],
    "tips": [
      "Focus on comfort and dignity",
      "Use familiar music, scents, or textures",
      "Maintain gentle, consistent presence",
      "Communicate through touch and tone of voice"
    ]
  }
}
```

---

## 🎯 Strategy Response Templates (strategies.json)

```json
{
  "reflect": {
    "name": "Reflect Their Feelings",
    "description": "Acknowledge and validate their emotional experience",
    "icon": "heart",
    "color": "blue",
    "templates": [
      "You're right to feel {emotion}—that makes sense.",
      "That would {emotion} me too. Let's {action} together.",
      "I can see this is {emotion} for you.",
      "It's okay to feel {emotion} about this.",
      "That sounds really {emotion}."
    ],
    "examples": [
      {
        "trigger": "I don't know what's happening",
        "response": "You're right to feel confused—things have been changing.",
        "emotion": "confused"
      },
      {
        "trigger": "I'm worried about tomorrow",
        "response": "That would worry me too. Let's check the plan together.",
        "emotion": "worried"
      }
    ]
  },
  "redirect": {
    "name": "Gentle Redirection",
    "description": "Guide attention to something positive or familiar",
    "icon": "arrow-right",
    "color": "green",
    "templates": [
      "Let's check on the {familiar_place} together.",
      "I have something {positive_adjective} to show you.",
      "Would you like to {pleasant_activity}?",
      "Let's go {direction} and see {something_nice}.",
      "I think {family_member} would like to {activity}."
    ],
    "examples": [
      {
        "trigger": "I want to go home",
        "response": "Let's check on the garden together.",
        "redirect": "garden"
      },
      {
        "trigger": "Where is everyone?",
        "response": "I have something interesting to show you.",
        "redirect": "interesting_item"
      }
    ]
  },
  "validate": {
    "name": "Validate Their Reality",
    "description": "Accept their version of reality and respond to emotions",
    "icon": "check-circle",
    "color": "purple",
    "templates": [
      "Tell me about {their_topic}. What's it like?",
      "You {emotion} {person/thing}. What do you remember?",
      "That sounds {emotion_adjective}. Can you tell me more?",
      "{Person/thing} is important to you.",
      "What else do you remember about {their_topic}?"
    ],
    "examples": [
      {
        "trigger": "I need to get to work",
        "response": "Tell me about your work. What do you do there?",
        "validation": "work_identity"
      },
      {
        "trigger": "Where is my mother?",
        "response": "You miss her. Tell me about her.",
        "validation": "missing_person"
      }
    ]
  },
  "reassure": {
    "name": "Offer Comfort & Safety",
    "description": "Provide emotional reassurance and security",
    "icon": "shield",
    "color": "orange",
    "templates": [
      "You're safe. I'm here with you.",
      "Everything is okay. You're {positive_state}.",
      "I'm not going anywhere. You're {comfort_word}.",
      "You're {positive_adjective} and {positive_adjective}.",
      "It's okay. You're exactly where you need to be."
    ],
    "examples": [
      {
        "trigger": "I'm scared",
        "response": "You're safe. I'm here with you.",
        "reassurance": "safety_presence"
      },
      {
        "trigger": "Help me",
        "response": "Everything is okay. You're loved.",
        "reassurance": "love_security"
      }
    ]
  }
}
```

---

## 🧠 Quiz Decision Tree (quiz-logic.json)

```json
{
  "questions": [
    {
      "id": "situation",
      "text": "What are you noticing right now?",
      "type": "single-select",
      "options": [
        { "id": "repetitive_questions", "text": "Asking the same questions repeatedly" },
        { "id": "agitation", "text": "Seeming agitated or restless" },
        { "id": "confusion_time", "text": "Confused about time or place" },
        { "id": "seeking_someone", "text": "Looking for someone who isn't there" },
        { "id": "withdrawal", "text": "Withdrawn or not responding much" },
        { "id": "false_beliefs", "text": "Expressing beliefs that aren't accurate" }
      ]
    },
    {
      "id": "stage",
      "text": "Which stage best describes them currently?",
      "type": "single-select",
      "options": [
        { "id": "early", "text": "Early - Independent but worried" },
        { "id": "early-mid", "text": "Early-Mid - Some daily task difficulty" },
        { "id": "mid", "text": "Mid - Significant memory loss" },
        { "id": "mid-late", "text": "Mid-Late - Limited verbal communication" },
        { "id": "late", "text": "Late - Minimal communication" }
      ]
    },
    {
      "id": "emotion",
      "text": "What emotion do you sense behind their behavior?",
      "type": "single-select",
      "options": [
        { "id": "fear", "text": "Fear or anxiety" },
        { "id": "sadness", "text": "Sadness or grief" },
        { "id": "frustration", "text": "Frustration or anger" },
        { "id": "confusion", "text": "Confusion or disorientation" },
        { "id": "loneliness", "text": "Loneliness or longing" }
      ]
    }
  ],
  "decisionTree": {
    "repetitive_questions": {
      "early": { "strategy": "reflect", "reason": "Validate their concern while providing gentle reassurance" },
      "early-mid": { "strategy": "redirect", "reason": "Acknowledge briefly, then guide to familiar activity" },
      "mid": { "strategy": "validate", "reason": "Accept their need and respond to underlying emotion" },
      "mid-late": { "strategy": "reassure", "reason": "Provide simple, comforting responses" },
      "late": { "strategy": "comfort", "reason": "Focus on tone and presence rather than words" }
    },
    "agitation": {
      "early": { "strategy": "reflect", "reason": "Help them name and process their feelings" },
      "early-mid": { "strategy": "redirect", "reason": "Guide attention to calming activities" },
      "mid": { "strategy": "validate", "reason": "Accept their reality and address emotions" },
      "mid-late": { "strategy": "reassure", "reason": "Provide calm, consistent comfort" },
      "late": { "strategy": "comfort", "reason": "Use sensory comfort and gentle presence" }
    },
    "confusion_time": {
      "early": { "strategy": "reflect", "reason": "Acknowledge the confusion without overwhelming correction" },
      "early-mid": { "strategy": "redirect", "reason": "Gently shift focus to present moment activities" },
      "mid": { "strategy": "validate", "reason": "Enter their timeframe and explore their reality" },
      "mid-late": { "strategy": "reassure", "reason": "Emphasize safety and present moment comfort" },
      "late": { "strategy": "comfort", "reason": "Focus entirely on immediate comfort and security" }
    }
  }
}
```

---

## 📝 Sample Trigger Phrases (trigger-phrases.json)

```json
{
  "common_triggers": [
    {
      "phrase": "What time is it?",
      "category": "time_orientation",
      "stages": ["early", "early-mid", "mid"],
      "suggested_strategies": ["reflect", "redirect"]
    },
    {
      "phrase": "When are we going home?",
      "category": "place_orientation",
      "stages": ["early-mid", "mid", "mid-late"],
      "suggested_strategies": ["redirect", "validate"]
    },
    {
      "phrase": "Where is my mother?",
      "category": "seeking_person",
      "stages": ["mid", "mid-late"],
      "suggested_strategies": ["validate", "reassure"]
    },
    {
      "phrase": "I need to go to work",
      "category": "role_identity",
      "stages": ["mid", "mid-late"],
      "suggested_strategies": ["validate"]
    },
    {
      "phrase": "I don't remember",
      "category": "memory_concern",
      "stages": ["early", "early-mid"],
      "suggested_strategies": ["reflect", "reassure"]
    },
    {
      "phrase": "Help me",
      "category": "distress",
      "stages": ["mid-late", "late"],
      "suggested_strategies": ["reassure", "comfort"]
    },
    {
      "phrase": "I'm scared",
      "category": "emotional_distress",
      "stages": ["all"],
      "suggested_strategies": ["reassure", "comfort"]
    },
    {
      "phrase": "Who are you?",
      "category": "person_recognition",
      "stages": ["mid", "mid-late"],
      "suggested_strategies": ["validate", "reassure"]
    }
  ],
  "response_templates": {
    "time_orientation": [
      "It's {current_time}. We have time to relax.",
      "Right now it's {time_period}. Everything is on schedule.",
      "The clock says {time}. Would you like to {activity}?"
    ],
    "place_orientation": [
      "We're at home. Let's check on {familiar_area}.",
      "This is your place. You're safe here.",
      "We're exactly where we need to be."
    ],
    "seeking_person": [
      "Tell me about {person}. What do you remember?",
      "You miss {person}. They love you very much.",
      "{Person} is in your heart. What's your favorite memory?"
    ]
  }
}
```

---

## ⚙️ Configuration Constants (config.ts)

```typescript
export const APP_CONFIG = {
  // Audio settings
  AUDIO: {
    SAMPLE_RATE: 16000,
    BIT_RATE: 64000,
    MAX_RECORDING_DURATION: 30000, // 30 seconds
    PLAYBACK_VOLUME: 0.8,
    SILENCE_THRESHOLD: -50, // dB
    CHUNK_SIZE: 5000, // 5 seconds for real-time processing
  },

  // Voice detection
  DETECTION: {
    SIMILARITY_THRESHOLD: 0.8, // 80% match required
    COOLDOWN_PERIOD: 10000, // 10 seconds between same triggers
    MAX_BACKGROUND_LISTEN: 28800000, // 8 hours
    RESPONSE_DELAY: 2000, // 2 seconds before responding
  },

  // Storage limits
  STORAGE: {
    MAX_TOTAL_SIZE: 524288000, // 500MB
    MAX_AUDIO_FILES: 1000,
    MAX_PHOTOS: 500,
    CLEANUP_THRESHOLD: 0.9, // Clean up at 90% capacity
    RETENTION_DAYS: 90,
  },

  // UI preferences
  UI: {
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 5000,
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    THEME_COLORS: {
      primary: '#3B82F6', // Blue
      secondary: '#6366F1', // Indigo
      success: '#10B981', // Green
      warning: '#F59E0B', // Amber
      error: '#EF4444', // Red
      calm: '#E0F2FE', // Light blue background
    },
  },

  // API endpoints
  API: {
    WHISPER_ENDPOINT: 'https://api.openai.com/v1/audio/transcriptions',
    BACKUP_ENDPOINT: null, // For future cloud features
  },

  // Feature flags
  FEATURES: {
    CLOUD_SYNC: false,
    VOICE_COMMANDS: true,
    PHOTO_STORIES: true,
    ANALYTICS: false, // Local only
    EXPORT_DATA: true,
  },
};
```

These data structures give Cursor everything it needs to build functional components with real content. The JSON files can be imported directly into your React components, and the TypeScript config provides type safety throughout development.

Would you like me to create one more file with component implementation templates, or shall we focus on refining any particular data structure?