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
  
  const [recordings, setRecordings] = useState<Recording[]>([
    { 
      id: 1, 
      question: "Where are my keys?", 
      responses: {
        comfort: { text: "Your keys are safe, I put them in the bowl by the door where they always go.", hasRecording: true, transcribed: false },
        redirect: { text: "Let's check the kitchen counter together - that's where we usually keep them.", hasRecording: true, transcribed: false },
        acknowledge: { text: "", hasRecording: false, transcribed: false }
      },
      triggerCount: 12,
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
      mentionedEntities: ["keys"]
    },
    { 
      id: 2, 
      question: "When is dinner?", 
      responses: {
        comfort: { text: "Dinner will be ready at 6 PM, just like always. You don't need to worry.", hasRecording: true, transcribed: false },
        redirect: { text: "", hasRecording: false, transcribed: false },
        acknowledge: { text: "", hasRecording: false, transcribed: false }
      },
      triggerCount: 8,
      lastTriggered: new Date(Date.now() - 30 * 60 * 1000),
    },
    { 
      id: 3, 
      question: "I need to get home", 
      responses: {
        comfort: { text: "", hasRecording: false, transcribed: false },
        redirect: { text: "", hasRecording: false, transcribed: false },
        acknowledge: { text: "", hasRecording: false, transcribed: false }
      },
      triggerCount: 15,
      mentionedEntities: ["home"]
    },
    { 
      id: 4, 
      question: "Where is Sarah?", 
      responses: {
        comfort: { text: "Sarah is doing well. She sends her love and thinks about you often.", hasRecording: false, transcribed: false },
        redirect: { text: "Would you like to look at some pictures of Sarah together?", hasRecording: false, transcribed: false },
        acknowledge: { text: "You're missing Sarah. She's very special to you.", hasRecording: false, transcribed: false }
      },
      triggerCount: 18,
      mentionedEntities: ["Sarah"]
    }
  ]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const [speechTranscript, setSpeechTranscript] = useState<string>('');

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
        
        setRecordings(prev => prev.map(r => 
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
        ));
        
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
    if (response?.audioBlob) {
      const audioUrl = URL.createObjectURL(response.audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
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
    setRecordings(prev => prev.map(r => 
      r.id === selectedQuestion.id ? updatedQuestion : r
    ));
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
      setRecordings([...recordings, newRecording]);
      setNewQuestion('');
      setSelectedQuestion(newRecording);
    }
  };

  const deleteQuestion = (id: number) => {
    setRecordings(recordings.filter(r => r.id !== id));
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
              onClick={() => setIsListening(!isListening)}
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
            <h2 className="text-lg font-medium text-gray-900 mb-4">Questions</h2>
            
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
              </div>

              <div className="flex-1 p-6">
                {/* Recorded Responses List */}
                <div className="mb-8">
                  <h3 className="font-medium text-gray-900 mb-4">Recorded Responses</h3>
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
                  <h3 className="font-medium text-gray-900">Record New Responses</h3>
                  
                  {(['comfort', 'redirect', 'acknowledge'] as ResponseCategory[]).map((category) => {
                    const response = selectedQuestion.responses[category];
                    const isCurrentlyRecording = isRecording && currentRecordingCategory === category;
                    
                    return (
                      <div key={category} className="border border-gray-200 rounded p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{getCategoryName(category)}</h4>
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