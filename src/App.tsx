import React, { useState, useRef } from "react";
import "./App.css";

interface Recording {
  id: number;
  question: string;
  responses: {
    comfort?: { text: string; audioBlob?: Blob; hasRecording: boolean; transcribed?: boolean };
    redirect?: { text: string; audioBlob?: Blob; hasRecording: boolean; transcribed?: boolean };
    acknowledge?: { text: string; audioBlob?: Blob; hasRecording: boolean; transcribed?: boolean };
  };
  triggerCount: number;
  lastTriggered?: Date;
  mentionedEntities?: string[]; // e.g., ["Sarah", "home", "work"]
}

type ResponseCategory = 'comfort' | 'redirect' | 'acknowledge';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecordingCategory, setCurrentRecordingCategory] = useState<ResponseCategory | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  
  // Load recordings from localStorage or use default
  const loadRecordings = (): Recording[] => {
    try {
      const saved = localStorage.getItem('calm-recall-recordings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert base64 back to Blobs if they exist
        return parsed.map((recording: any) => ({
          ...recording,
          responses: Object.fromEntries(
            Object.entries(recording.responses).map(([key, response]: [string, any]) => [
              key,
              response?.audioBase64 ? {
                ...response,
                audioBlob: (() => {
                  try {
                    // Convert base64 back to blob
                    const binaryString = atob(response.audioBase64);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                      bytes[i] = binaryString.charCodeAt(i);
                    }
                    return new Blob([bytes], { type: response.audioType || 'audio/wav' });
                  } catch (error) {
                    console.error('Error converting base64 to blob:', error);
                    return null;
                  }
                })(),
                audioBase64: undefined, // Remove base64 data after converting
                audioType: undefined
              } : response
            ])
          )
        }));
      }
    } catch (error) {
      console.error('Error loading recordings from localStorage:', error);
    }
    
    // Default data if nothing saved
    return [
      { 
        id: 1, 
        question: "Where are my keys?", 
        responses: {
          comfort: { text: "", hasRecording: false, transcribed: false },
          redirect: { text: "", hasRecording: false, transcribed: false },
          acknowledge: { text: "", hasRecording: false, transcribed: false }
        },
        triggerCount: 0,
        mentionedEntities: ["keys"]
      }
    ];
  };

  const [recordings, setRecordings] = useState<Recording[]>(loadRecordings());

  // Debug function to check localStorage
  const debugLocalStorage = () => {
    const saved = localStorage.getItem('calm-recall-recordings');
    console.log('🔍 localStorage data:', saved ? JSON.parse(saved) : 'No data');
  };

  // Save recordings to localStorage whenever they change
  const saveRecordings = async (newRecordings: Recording[]) => {
    try {
      // Convert Blobs to base64 for storage
      const recordingsToSave = await Promise.all(
        newRecordings.map(async recording => ({
          ...recording,
          responses: await Promise.all(
            Object.entries(recording.responses).map(async ([key, response]) => {
              if (response?.audioBlob) {
                try {
                  // Convert blob to base64
                  const arrayBuffer = await response.audioBlob.arrayBuffer();
                  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
                  return [key, {
                    ...response,
                    audioBase64: base64,
                    audioType: response.audioBlob.type || 'audio/wav',
                    audioBlob: undefined // Remove blob for storage
                  }];
                } catch (error) {
                  console.error('Error converting audio blob:', error);
                  return [key, response];
                }
              }
              return [key, response];
            })
          ).then(entries => Object.fromEntries(entries))
        }))
      );
      
      localStorage.setItem('calm-recall-recordings', JSON.stringify(recordingsToSave));
      console.log('💾 Recordings saved to localStorage');
    } catch (error) {
      console.error('Error saving recordings to localStorage:', error);
    }
    
    setRecordings(newRecordings);
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const listeningRecognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [listeningTranscript, setListeningTranscript] = useState<string>('');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string>('');
  const [showAudioPrompt, setShowAudioPrompt] = useState<{question: string, response: string, audioBlob: Blob} | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Stop any currently playing audio
  const stopCurrentAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
      setCurrentlyPlaying('');
      setIsAudioPlaying(false); // 🔓 Release audio lock
      setIsProcessingMatch(false); // 🔓 Release processing lock
      console.log('🛑 Stopped previous audio - all locks released');
    }
  };

  // Start speech recognition during recording
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.log('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Always update with the latest combination of final + interim
      const fullTranscript = finalTranscript + interimTranscript;
      setSpeechTranscript(fullTranscript);
      transcriptRef.current = fullTranscript; // Store in ref too
      console.log('Updated transcript:', fullTranscript);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };
    
    recognition.onend = () => {
      console.log('Speech recognition ended');
    };
    
    recognition.start();
    console.log('Speech recognition started');
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  // Continuous listening for question detection
  const startContinuousListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.log('Speech Recognition not supported for continuous listening');
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    listeningRecognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      const fullTranscript = finalTranscript + interimTranscript;
      setListeningTranscript(fullTranscript);
      
      // Check for question matches when we have a final result
      if (finalTranscript.trim()) {
        checkForQuestionMatch(finalTranscript.trim());
        // Clear the transcript after checking
        setTimeout(() => setListeningTranscript(''), 3000);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Continuous listening error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access and try again.');
        setIsListening(false);
      }
    };
    
    recognition.onend = () => {
      console.log('🔄 Speech recognition ended');
      // Always restart recognition if we're still supposed to be listening
      if (isListening) {
        console.log('🔄 Restarting continuous listening in 1 second...');
        setTimeout(() => {
          if (isListening && listeningRecognitionRef.current === null) {
            console.log('🚀 Attempting recognition restart...');
            startContinuousListening();
          }
        }, 1000);
      }
    };
    
    // Add additional error recovery
    recognition.onstop = () => {
      console.log('🛑 Speech recognition stopped');
      if (isListening) {
        console.log('🔄 Recognition stopped unexpectedly - restarting...');
        setTimeout(() => {
          if (isListening && listeningRecognitionRef.current === null) {
            startContinuousListening();
          }
        }, 2000);
      }
    };
    
    recognition.start();
    console.log('Continuous listening started');
  };

  const stopContinuousListening = () => {
    if (listeningRecognitionRef.current) {
      listeningRecognitionRef.current.stop();
      listeningRecognitionRef.current = null;
      setListeningTranscript('');
      console.log('🛑 Continuous listening stopped');
    }
  };

  // Add debouncing state
  const [lastProcessedPhrase, setLastProcessedPhrase] = useState<string>('');
  const [lastProcessedTime, setLastProcessedTime] = useState<number>(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isProcessingMatch, setIsProcessingMatch] = useState<boolean>(false);
  const processingTimeoutRef = useRef<number | null>(null);

  // Master reset function to clear all locks and restart
  const resetAllSystems = () => {
    console.log('🔧 MASTER RESET: Clearing all locks and restarting...');
    
    // Clear all locks and timers
    setIsProcessingMatch(false);
    setIsAudioPlaying(false);
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    
    // Stop any current audio
    stopCurrentAudio();
    
    // Reset speech recognition
    if (listeningRecognitionRef.current) {
      listeningRecognitionRef.current.stop();
      listeningRecognitionRef.current = null;
    }
    
    // Restart listening if it should be active
    if (isListening) {
      console.log('🚀 Restarting listening after reset...');
      setTimeout(() => {
        if (isListening) {
          startContinuousListening();
        }
      }, 2000);
    }
  };

  // Auto-reset if locks get stuck (every 30 seconds)
  React.useEffect(() => {
    const resetInterval = setInterval(() => {
      if (isListening && (isProcessingMatch || isAudioPlaying)) {
        const now = Date.now();
        const timeSinceLastProcess = now - lastProcessedTime;
        
        // If we've been locked for more than 30 seconds, reset
        if (timeSinceLastProcess > 30000) {
          console.log('⚠️ Auto-reset triggered - system appears stuck');
          resetAllSystems();
        }
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(resetInterval);
  }, [isListening, isProcessingMatch, isAudioPlaying, lastProcessedTime]);

  // Calculate similarity between two phrases (0-1, where 1 is identical)
  const calculateSimilarity = (phrase1: string, phrase2: string): number => {
    if (!phrase1 || !phrase2) return 0;
    
    // Simple word-based similarity
    const words1 = phrase1.toLowerCase().split(' ').filter(w => w.length > 2);
    const words2 = phrase2.toLowerCase().split(' ').filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const commonWords = words1.filter(word => 
      words2.some(w => w.includes(word) || word.includes(w))
    );
    
    return commonWords.length / Math.max(words1.length, words2.length);
  };

  // Extract clean phrases from concatenated speech recognition text (simplified)
  const extractCleanPhrases = (text: string): string[] => {
    const lowerText = text.toLowerCase().trim();
    console.log(`🧹 Processing input: "${lowerText}"`);
    
    // Skip empty or very short text
    if (!lowerText || lowerText.length < 3) {
      console.log('❌ Text too short');
      return [];
    }
    
    // Skip ONLY obvious complete response echoes (be very specific)
    if (lowerText.includes('don\'t worry i have your keys') || 
        lowerText.includes('go look at that later') ||
        lowerText.includes('bill\'s money buy me sell')) {
      console.log('❌ Contains complete response echo');
      return [];
    }
    
    // SIMPLE APPROACH: Just use the input as-is if it's reasonable length
    if (lowerText.length <= 100) {
      // Clean up common prefixes (names, etc.)
      const cleanedText = lowerText
        .replace(/^(linda|mom|dad|hey|hello|hi|um|uh),?\s*/i, '') // Remove name prefixes
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
      
      const finalText = cleanedText.length >= 3 ? cleanedText : lowerText;
      console.log(`✅ Using input: "${finalText}" (cleaned from "${lowerText}")`);
      return [finalText];
    }
    
    // For longer text, try to find the first question-like segment
    const segments = lowerText.split(/\s+/);
    let bestPhrase = '';
    
    // Look for question patterns starting with common words
    for (let i = 0; i < segments.length - 2; i++) {
      const word = segments[i];
      if (['where', 'what', 'how', 'when', 'why', 'can', 'could', 'i'].includes(word)) {
        // Take up to 8 words from this point
        const phrase = segments.slice(i, i + 8).join(' ');
        if (phrase.length >= 5 && phrase.length <= 50) {
          bestPhrase = phrase;
          break;
        }
      }
    }
    
    const result = bestPhrase ? [bestPhrase] : [lowerText.slice(0, 50)];
    console.log(`✅ Extracted phrase: "${result[0]}"`);
    return result;
  };

  // Check if spoken text matches any recorded questions (with phrase extraction)
  const checkForQuestionMatch = (spokenText: string) => {
    console.log('🔍 Raw speech input:', spokenText);
    
    const now = Date.now();
    
    // 🚫 GLOBAL PROCESSING LOCK: Skip if we're already processing a match
    if (isProcessingMatch) {
      console.log('🚫 Skipping - already processing a match');
      return;
    }
    
    // 🔒 AUDIO LOCK: Skip if audio is currently playing
    if (isAudioPlaying || currentlyPlaying) {
      console.log('🚫 Skipping - audio already playing');
      return;
    }
    
    // 📝 EXTRACT CLEAN PHRASES: Get meaningful phrases from concatenated text
    const cleanPhrases = extractCleanPhrases(spokenText);
    
    if (cleanPhrases.length === 0) {
      console.log('🚫 No clean phrases extracted');
      return;
    }
    
    const lowerSpoken = cleanPhrases[0]; // Use the most recent clean phrase
    console.log('🎯 Processing clean phrase:', lowerSpoken);
    
    // 🛡️ AGGRESSIVE DEBOUNCING: Skip if very similar phrase was just processed
    const timeSinceLastProcess = now - lastProcessedTime;
    const phraseSimilarity = calculateSimilarity(lowerSpoken, lastProcessedPhrase);
    
    // More aggressive similarity detection for key-related phrases
    const isKeyPhrase = lowerSpoken.includes('key');
    const wasRecentKeyPhrase = lastProcessedPhrase.includes('key');
    const similarityThreshold = (isKeyPhrase && wasRecentKeyPhrase) ? 0.4 : 0.6;
    const timeThreshold = (isKeyPhrase && wasRecentKeyPhrase) ? 8000 : 5000;
    
    if (timeSinceLastProcess < timeThreshold && phraseSimilarity > similarityThreshold) {
      console.log('🚫 Skipping - too similar to recent phrase:', { 
        similarity: phraseSimilarity.toFixed(2), 
        timeSince: timeSinceLastProcess,
        threshold: similarityThreshold
      });
      return;
    }
    
    // 🕐 BATCH PROCESSING: Clear any pending timeout and set a new one
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }
    
    processingTimeoutRef.current = setTimeout(() => {
      processQuestionMatchInternal(lowerSpoken, now);
    }, 1200); // Even longer delay to prevent overlaps
  };

  // Internal function that actually processes the question match
  const processQuestionMatchInternal = (lowerSpoken: string, timestamp: number) => {
    console.log('⚡ Processing batched match:', lowerSpoken);
    
    // Set processing lock
    setIsProcessingMatch(true);
    
    // Update debouncing state
    setLastProcessedPhrase(lowerSpoken);
    setLastProcessedTime(timestamp);
    
    const now = Date.now(); // Get current time for cooldown calculations
    
    // Find matching questions using simple keyword matching
    const matchedQuestions = recordings.filter(recording => {
      const lowerQuestion = recording.question.toLowerCase();
      
      // 🕒 COOLDOWN: Skip if this question was triggered recently
      if (recording.lastTriggered) {
        const timeSinceLastTrigger = now - new Date(recording.lastTriggered).getTime();
        if (timeSinceLastTrigger < 8000) { // 8 second cooldown per question
          console.log(`🕒 Question "${recording.question}" in cooldown (${timeSinceLastTrigger}ms ago)`);
          return false;
        }
      }
      
      // FLEXIBLE MATCHING: Support variations while preventing concatenation
      const spokenWords = lowerSpoken.split(' ').filter(word => word.length > 2);
      const questionWords = lowerQuestion.split(' ').filter(word => word.length > 2);
      
      // Skip if phrase is VERY long (likely concatenated speech)
      if (spokenWords.length > 15) { // Much more generous limit
        console.log(`🚫 Phrase too long (${spokenWords.length} words) - likely concatenated`);
        return false;
      }
      
      // Count matching words (including partial matches)
      const matchingWords = spokenWords.filter(word => 
        questionWords.some(qWord => 
          qWord.includes(word) || 
          word.includes(qWord) ||
          // Handle common variations
          (qWord === 'keys' && ['key', 'car', 'house', 'door'].includes(word))
        )
      );
      
      // FLEXIBLE REQUIREMENTS: Support phrase variations and short phrases
      const coreWords = ['where', 'are', 'my', 'keys']; 
      const hasCoreStructure = coreWords.filter(core => 
        spokenWords.some(spoken => spoken.includes(core))
      ).length >= 2; // At least 2 core words must match
      
      // Special handling for very short phrases like "my keys"
      const isShortKeyPhrase = spokenWords.length <= 3 && 
        (spokenWords.includes('keys') || spokenWords.includes('key')) &&
        (spokenWords.includes('my') || spokenWords.includes('car'));
      
      const matchPercentage = matchingWords.length / questionWords.length;
      const hasEnoughMatches = matchingWords.length >= 2 || isShortKeyPhrase;
      const hasDecentPercentage = matchPercentage >= 0.3; // Even more flexible
      
      console.log(`🔍 Matching "${recording.question}": ${matchingWords.length}/${questionWords.length} words (${(matchPercentage*100).toFixed(0)}%) - Core: ${hasCoreStructure} - Short: ${isShortKeyPhrase}`);
      
      return hasEnoughMatches && (hasDecentPercentage || hasCoreStructure || isShortKeyPhrase);
    });
    
    if (matchedQuestions.length > 0) {
      const question = matchedQuestions[0]; // Use first match
      console.log('✅ Question matched:', question.question);
      
      // Set audio playing lock
      setIsAudioPlaying(true);
      
      // Increment trigger count
      const updatedRecordings = recordings.map(r => 
        r.id === question.id 
          ? { ...r, triggerCount: r.triggerCount + 1, lastTriggered: new Date() }
          : r
      );
      saveRecordings(updatedRecordings); // Note: not awaiting to avoid blocking
      
      // Find a response to play
      const availableResponses = (['comfort', 'redirect', 'acknowledge'] as ResponseCategory[])
        .map(category => ({ category, response: question.responses[category] }))
        .filter(({ response }) => response?.hasRecording);
      
      if (availableResponses.length > 0) {
        // For now, just play the first available response
        const { category, response } = availableResponses[0];
        console.log('Playing response:', category, response?.text);
        
                 // Play the audio - with overlap prevention
         if (response?.audioBlob) {
           console.log('🔊 Attempting to play audio response...');
           
           // Stop any currently playing audio first
           stopCurrentAudio();
           
           const audioUrl = URL.createObjectURL(response.audioBlob);
           const audio = new Audio(audioUrl);
           
           // Store reference to current audio
           currentAudioRef.current = audio;
           
           audio.volume = 1.0;
           setCurrentlyPlaying(response.text);
           
           audio.onended = () => {
             setCurrentlyPlaying('');
             setIsAudioPlaying(false); // 🔓 Release audio lock
             setIsProcessingMatch(false); // 🔓 Release processing lock
             URL.revokeObjectURL(audioUrl);
             currentAudioRef.current = null;
             console.log('✅ Audio playback completed - all locks released');
           };
           
           audio.onerror = () => {
             console.error('❌ Audio playback error');
             setCurrentlyPlaying('');
             setIsAudioPlaying(false); // 🔓 Release audio lock
             setIsProcessingMatch(false); // 🔓 Release processing lock
             URL.revokeObjectURL(audioUrl);
             currentAudioRef.current = null;
           };
           
           // Try to play - if it fails, show the manual prompt
           const playPromise = audio.play();
           
           if (playPromise !== undefined) {
             playPromise.then(() => {
               console.log('✅ Audio auto-play successful');
               setAudioEnabled(true);
             }).catch(error => {
               console.log('⚠️ Auto-play blocked, showing manual prompt');
               setCurrentlyPlaying('');
               setIsAudioPlaying(false); // 🔓 Release audio lock
               setIsProcessingMatch(false); // 🔓 Release processing lock
               currentAudioRef.current = null;
               
               if (response.audioBlob) {
                 setShowAudioPrompt({
                   question: question.question,
                   response: response.text,
                   audioBlob: response.audioBlob
                 });
               }
             });
           }
         }
         
         // Show visual feedback (but make it less intrusive)
         console.log(`✅ MATCH DETECTED: "${question.question}" → Playing: "${response?.text}"`);
      } else {
        console.log('No recorded responses available for this question');
        setIsProcessingMatch(false); // 🔓 Release processing lock
      }
    } else {
      console.log('No questions matched');
      setIsProcessingMatch(false); // 🔓 Release processing lock
    }
  };

  // Handle manual audio playback when autoplay fails
  const handleManualPlayback = () => {
    if (!showAudioPrompt) return;
    
    // Stop any currently playing audio first
    stopCurrentAudio();
    
    const audioUrl = URL.createObjectURL(showAudioPrompt.audioBlob);
    const audio = new Audio(audioUrl);
    
    // Store reference to current audio
    currentAudioRef.current = audio;
    
    audio.volume = 1.0;
    setCurrentlyPlaying(showAudioPrompt.response);
    
    audio.onended = () => {
      setCurrentlyPlaying('');
      setIsAudioPlaying(false); // 🔓 Release audio lock
      setIsProcessingMatch(false); // 🔓 Release processing lock
      URL.revokeObjectURL(audioUrl);
      currentAudioRef.current = null;
    };
    
    audio.play().then(() => {
      console.log('Manual playback successful');
      setAudioEnabled(true);
      setShowAudioPrompt(null);
    }).catch(error => {
      console.error('Manual playback failed:', error);
      setCurrentlyPlaying('');
      currentAudioRef.current = null;
      setShowAudioPrompt(null);
    });
  };

  const startRecording = async (category: ResponseCategory) => {
    if (!selectedQuestion) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Give speech recognition a moment to process final words
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Capture the current transcript from ref (persists after stopping recognition)
        const currentTranscript = transcriptRef.current.trim();
        console.log('Captured transcript from ref:', currentTranscript);
        console.log('Captured transcript from state:', speechTranscript.trim());
        
        // Stop speech recognition
        stopSpeechRecognition();
        
        // Use the captured speech transcript or fallback
        let transcribedText = currentTranscript;
        
        if (!transcribedText) {
          console.log('No transcript captured, using fallback');
          // Fallback responses if speech recognition didn't work
          const fallbackResponses = [
            "Your keys are safe, honey. I put them in the bowl by the door where they always go.",
            "Let's check the kitchen counter together - that's where we usually keep them.",
            "I can see you're looking for your keys. That must feel frustrating when you can't find them."
          ];
          transcribedText = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        } else {
          console.log('Using actual transcript:', transcribedText);
        }
        
        const updatedRecordings = recordings.map(r => 
          r.id === selectedQuestion.id 
            ? { 
                ...r, 
                responses: {
                  ...r.responses,
                  [category]: {
                    text: transcribedText,
                    audioBlob,
                    hasRecording: true,
                    transcribed: !!currentTranscript // true if actually transcribed
                  }
                }
              }
            : r
        );
        saveRecordings(updatedRecordings);
        
        setSelectedQuestion(prev => prev ? {
          ...prev,
          responses: {
            ...prev.responses,
            [category]: {
              text: transcribedText,
              audioBlob,
              hasRecording: true,
              transcribed: !!currentTranscript
            }
          }
        } : null);
        
        stream.getTracks().forEach(track => track.stop());
        setSpeechTranscript(''); // Clear the transcript display
        transcriptRef.current = ''; // Clear the stored transcript
      };

      mediaRecorder.start();
      setIsRecording(true);
      setCurrentRecordingCategory(category);
      
      // Clear previous transcript and start speech recognition
      setSpeechTranscript('');
      transcriptRef.current = '';
      startSpeechRecognition();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setCurrentRecordingCategory(null);
    }
    stopSpeechRecognition();
  };

  const playRecording = (recording: Recording, category: ResponseCategory) => {
    const response = recording.responses[category];
    console.log('🎵 playRecording called:', { category, response, hasAudioBlob: !!response?.audioBlob });
    
    if (response?.audioBlob) {
      try {
        const audioUrl = URL.createObjectURL(response.audioBlob);
        const audio = new Audio(audioUrl);
        console.log('🎵 Created audio URL:', audioUrl);
        
        audio.onloadeddata = () => console.log('🎵 Audio loaded successfully');
        audio.onerror = (e) => console.error('🎵 Audio error:', e);
        
        audio.play().then(() => {
          console.log('🎵 Audio playback started');
        }).catch(error => {
          console.error('🎵 Audio playback failed:', error);
        });
      } catch (error) {
        console.error('🎵 Error creating audio:', error);
      }
    } else {
      console.log('🎵 No audio blob found for playback');
      debugLocalStorage(); // Show what's in storage
    }
  };

  const deleteRecording = (category: ResponseCategory) => {
    if (!selectedQuestion) return;
    
    const updatedQuestion = {
      ...selectedQuestion,
      responses: {
        ...selectedQuestion.responses,
        [category]: {
          text: "",
          hasRecording: false,
          transcribed: false
        }
      }
    };
    
    setSelectedQuestion(updatedQuestion);
    const updatedRecordings = recordings.map(r => 
      r.id === selectedQuestion.id ? updatedQuestion : r
    );
    saveRecordings(updatedRecordings);
  };

  const addNewQuestion = () => {
    if (newQuestion.trim()) {
      const newRecording: Recording = {
        id: Date.now(),
        question: newQuestion.trim(),
        responses: {
          comfort: { text: "", hasRecording: false, transcribed: false },
          redirect: { text: "", hasRecording: false, transcribed: false },
          acknowledge: { text: "", hasRecording: false, transcribed: false }
        },
        triggerCount: 0
      };
      saveRecordings([...recordings, newRecording]);
      setNewQuestion('');
      setSelectedQuestion(newRecording);
    }
  };

  const deleteQuestion = (id: number) => {
    saveRecordings(recordings.filter(r => r.id !== id));
    if (selectedQuestion?.id === id) {
      setSelectedQuestion(null);
    }
  };

  const getCategoryName = (category: ResponseCategory) => {
    switch (category) {
      case 'comfort': return 'Comfort';
      case 'redirect': return 'Redirect';
      case 'acknowledge': return 'Acknowledge';
    }
  };

  const getSuggestionText = (category: ResponseCategory) => {
    switch (category) {
      case 'comfort': return 'Your keys are safe, I put them in the bowl by the door...';
      case 'redirect': return 'Let\'s check the kitchen counter together...';
      case 'acknowledge': return 'You\'re looking for your keys. That must feel frustrating...';
    }
  };

  const totalRecorded = recordings.reduce((total, r) => {
    return total + Object.values(r.responses).filter(resp => resp.hasRecording).length;
  }, 0);

  const totalNeeded = recordings.length * 3; // 3 categories per question

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" 
                   style={{ backgroundColor: '#678A97' }}>
                C
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Calm Recall</h1>
            </div>
            
            <button
              onClick={() => {
                if (isListening) {
                  stopContinuousListening();
                  setIsListening(false);
                } else {
                  setIsListening(true);
                  startContinuousListening();
                }
              }}
              className={`px-4 py-2 rounded font-medium ${
                isListening 
                  ? "bg-gray-100 text-gray-700" 
                  : "text-white"
              }`}
              style={{ backgroundColor: isListening ? undefined : '#678A97' }}
            >
              {isListening ? "Stop Listening" : "Start Listening"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        {/* Left Panel - Questions */}
        <div className="w-1/3 bg-white border-r border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Dad's Questions/Concerns</h2>
            
            <div className="flex">
              <input
                type="text"
                placeholder="Add new question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addNewQuestion()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:border-gray-400"
              />
              <button
                onClick={addNewQuestion}
                disabled={!newQuestion.trim()}
                className="px-4 py-2 border border-l-0 border-gray-300 rounded-r hover:bg-gray-50 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          <div className="overflow-y-auto">
            {recordings.map((question) => (
              <div
                key={question.id}
                onClick={() => setSelectedQuestion(question)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedQuestion?.id === question.id ? 'bg-gray-100' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">{question.question}</p>
                    <p className="text-sm text-gray-500">Asked {question.triggerCount} times</p>
                    <div className="flex mt-2 space-x-1">
                      {Object.entries(question.responses).map(([category, response]) => (
                        <div
                          key={category}
                          className={`w-2 h-2 rounded-full ${
                            response.hasRecording ? 'bg-gray-400' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteQuestion(question.id);
                    }}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Responses */}
        <div className="flex-1 bg-white">
          {selectedQuestion ? (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-medium text-gray-900 mb-2">{selectedQuestion.question}</h1>
                <p className="text-gray-600">Record different response types. The app will rotate them automatically.</p>
                
                {/* Listening Status */}
                {isListening && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-2"></span>
                      <span className="text-sm text-blue-800 font-medium">Listening for questions...</span>
                    </div>
                    {listeningTranscript && (
                      <p className="text-xs text-blue-600 mt-1">Heard: "{listeningTranscript}"</p>
                    )}
                  </div>
                )}
                
                {/* Audio Playing Status */}
                {currentlyPlaying && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse mr-2"></span>
                      <span className="text-sm text-green-800 font-medium">Playing response...</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">"{currentlyPlaying}"</p>
                  </div>
                                 )}
                </div>

              <div className="flex-1 p-6">
                {/* Audio Permission Prompt */}
                {showAudioPrompt && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-yellow-800">Question Detected!</h3>
                        <p className="mt-1 text-sm text-yellow-700">
                          <strong>"{showAudioPrompt.question}"</strong>
                        </p>
                        <p className="mt-2 text-sm text-yellow-700">
                          Response ready: "{showAudioPrompt.response}"
                        </p>
                        <div className="mt-3 flex space-x-3">
                          <button
                            onClick={handleManualPlayback}
                            className="bg-yellow-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-yellow-700"
                          >
                            ▶ Play Response
                          </button>
                          <button
                            onClick={() => setShowAudioPrompt(null)}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-400"
                          >
                            Dismiss
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-yellow-600">
                          Click "Play Response" to enable automatic audio playback for future detections.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Recorded Responses List */}
                <div className="mb-8">
                  <h3 className="font-medium text-gray-900 mb-4">My Recorded Responses</h3>
                  <div className="space-y-3">
                    {(['comfort', 'redirect', 'acknowledge'] as ResponseCategory[]).map((category) => {
                      const response = selectedQuestion.responses[category];
                      if (!response?.hasRecording) return null;
                      
                      return (
                        <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-700">{getCategoryName(category)}</span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-500">
                                {response.transcribed ? 'Audio transcribed' : 'Recorded'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 font-medium">{response.text}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => playRecording(selectedQuestion, category)}
                              className="p-1 text-gray-500 hover:text-gray-700"
                              title="Play recording"
                            >
                              ▶
                            </button>
                            <button
                              onClick={() => deleteRecording(category)}
                              className="p-1 text-gray-400 hover:text-red-500"
                              title="Delete recording"
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {Object.values(selectedQuestion.responses).every(r => !r.hasRecording) && (
                    <p className="text-gray-500 text-center py-8">No responses recorded yet</p>
                  )}
                </div>

                {/* Record New Responses */}
                <div className="space-y-6">
                  <h3 className="font-medium" style={{ color: '#678A97' }}>Record New Responses</h3>
                  
                  {(['comfort', 'redirect', 'acknowledge'] as ResponseCategory[]).map((category) => {
                    const response = selectedQuestion.responses[category];
                    const isCurrentlyRecording = isRecording && currentRecordingCategory === category;
                    
                    return (
                      <div key={category} className="border border-gray-200 rounded p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium" style={{ color: '#678A97' }}>{getCategoryName(category)}</h4>
                          <div className="flex items-center space-x-2">
                            {isCurrentlyRecording && (
                              <span className="text-sm text-red-600 flex items-center">
                                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2"></span>
                                Recording...
                              </span>
                            )}
                            <button
                              onClick={() => isCurrentlyRecording ? stopRecording() : startRecording(category)}
                              className={`px-3 py-1 text-sm rounded font-medium ${
                                isCurrentlyRecording
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : 'text-white hover:opacity-90'
                              }`}
                              style={{ 
                                backgroundColor: isCurrentlyRecording ? undefined : '#678A97'
                              }}
                            >
                              {isCurrentlyRecording ? 'Stop & Save' : 'Record'}
                            </button>
                          </div>
                        </div>

                        <div className="text-sm">
                          {isCurrentlyRecording && speechTranscript ? (
                            <div className="mb-2">
                              <p className="text-xs text-gray-500 mb-1">Live transcription:</p>
                              <p className="text-blue-600 bg-blue-50 p-2 rounded">{speechTranscript}</p>
                            </div>
                          ) : null}
                          <p className="text-gray-600 italic">Suggestion: {getSuggestionText(category)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg">Select a question to view and record responses</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
