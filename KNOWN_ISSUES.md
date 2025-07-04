# Calm Recall - Current Status & Known Issues

##  WORKING FUNCTIONALITY
- Real speech-to-text recording with actual transcription
- Automatic question detection using keyword matching  
- Automatic audio response playback
- Data persistence across browser sessions (localStorage)
- Clean, accessible UI with proper visual feedback
- Basic listening functionality with exact phrase matching

##  KNOWN ISSUES

### Speech Recognition Overlapping Audio
**Problem:** Speech recognition system causes rapid-fire detection and overlapping audio with phrase variations.

**Current Behavior:**
-  **'Where are my keys' (exact match)**  Works cleanly, plays once
-  **'Where are my car keys'**  Causes overlapping audio (2-3x playback)  
-  **'I can't find my keys'**  Causes rapid overlapping audio (10+ times)

**Root Cause:** Speech recognition onresult event fires multiple times for same spoken phrase, especially with variations. Each event triggers separate question matching before any debouncing can prevent overlaps.

**Attempted Solutions:**
- Per-question cooldown with lastTriggered timestamps
- Global detection lock (10-second prevention after any response)
- Both failed due to speech recognition firing faster than debouncing logic

##  FUTURE IMPROVEMENTS

### High Priority
1. **Fix speech recognition debouncing** - Prevent multiple processing of same/similar spoken input
2. **Response rotation** - Cycle through different recorded responses instead of always playing first

### Medium Priority  
3. Improve keyword matching algorithm for better phrase variation handling
4. Add manual override/stop button during overlapping incidents
5. Better error handling for speech recognition edge cases

##  DEVELOPMENT NOTES
- Last stable commit: 83e376f (though it still has overlapping issues)
- Multiple rollback attempts showed overlapping issue exists in earlier commits
- Recommend focusing on speech recognition architecture before adding new features
- Core listening functionality IS the app's value proposition - worth fixing properly

---
*Updated: June 23, 2025 - Voice library development session*
