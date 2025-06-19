import React, { useState, useRef } from "react";
import "./App.css";

interface Recording {
  id: number;
  question: string;
  responses: {
    comfort?: { text: string; audioBlob?: Blob; hasRecording: boolean };
    redirect?: { text: string; audioBlob?: Blob; hasRecording: boolean };
    acknowledge?: { text: string; audioBlob?: Blob; hasRecording: boolean };
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
        comfort: { text: "Your keys are safe, I put them in the bowl by the door where they always go.", hasRecording: true },
        redirect: { text: "Let's check the kitchen counter together - that's where we usually keep them.", hasRecording: true },
        acknowledge: { text: "You're looking for your keys. That must feel frustrating.", hasRecording: false }
      },
      triggerCount: 12,
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
      mentionedEntities: ["keys"]
    },
    { 
      id: 2, 
      question: "When is dinner?", 
      responses: {
        comfort: { text: "Dinner will be ready at 6 PM, just like always. You don't need to worry.", hasRecording: true },
        redirect: { text: "Let's go check what we're making for dinner tonight.", hasRecording: false },
        acknowledge: { text: "You're thinking about dinner. That sounds important to you.", hasRecording: false }
      },
      triggerCount: 8,
      lastTriggered: new Date(Date.now() - 30 * 60 * 1000),
    },
    { 
      id: 3, 
      question: "I need to get home", 
      responses: {
        comfort: { text: "You are home, sweetheart. This is your safe place with me.", hasRecording: false },
        redirect: { text: "Let's look at some photos of our home together.", hasRecording: false },
        acknowledge: { text: "You're feeling like you want to be somewhere familiar. That makes sense.", hasRecording: false }
      },
      triggerCount: 15,
      mentionedEntities: ["home"]
    },
    { 
      id: 4, 
      question: "Where is Sarah?", 
      responses: {
        comfort: { text: "Sarah is doing well. She sends her love and thinks about you often.", hasRecording: false },
        redirect: { text: "Would you like to look at some pictures of Sarah together?", hasRecording: false },
        acknowledge: { text: "You're missing Sarah. She's very special to you.", hasRecording: false }
      },
      triggerCount: 18,
      mentionedEntities: ["Sarah"]
    }
  ]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordings(prev => prev.map(r => 
          r.id === selectedQuestion.id 
            ? { 
                ...r, 
                responses: {
                  ...r.responses,
                  [category]: {
                    ...r.responses[category],
                    audioBlob,
                    hasRecording: true
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
              ...prev.responses[category],
              audioBlob,
              hasRecording: true
            }
          }
        } : null);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setCurrentRecordingCategory(category);
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
  };

  const playRecording = (recording: Recording, category: ResponseCategory) => {
    const response = recording.responses[category];
    if (response?.audioBlob) {
      const audioUrl = URL.createObjectURL(response.audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const addNewQuestion = () => {
    if (newQuestion.trim()) {
      const newRecording: Recording = {
        id: Date.now(),
        question: newQuestion.trim(),
        responses: {
          comfort: { text: "", hasRecording: false },
          redirect: { text: "", hasRecording: false },
          acknowledge: { text: "", hasRecording: false }
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

  const getComfortSuggestion = (question: Recording) => {
    if (!question.mentionedEntities) return null;
    
    const entity = question.mentionedEntities[0];
    if (question.triggerCount >= 10) {
      return {
        entity,
        suggestion: `${entity} has been mentioned ${question.triggerCount} times. Would you like to create a comfort story about ${entity}?`
      };
    }
    return null;
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
                              <span className="text-xs text-gray-500">Recorded</span>
                            </div>
                            <p className="text-sm text-gray-600">{response.text}</p>
                          </div>
                          <button
                            onClick={() => playRecording(selectedQuestion, category)}
                            className="ml-4 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-white"
                          >
                            ▶ Play
                          </button>
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
                    return (
                      <div key={category} className="border border-gray-200 rounded p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{getCategoryName(category)}</h4>
                          {response?.hasRecording && (
                            <span className="text-sm text-gray-500">Already recorded</span>
                          )}
                        </div>

                        <textarea
                          value={response?.text || ''}
                          onChange={(e) => {
                            const updatedQuestion = {
                              ...selectedQuestion,
                              responses: {
                                ...selectedQuestion.responses,
                                [category]: {
                                  ...selectedQuestion.responses[category],
                                  text: e.target.value
                                }
                              }
                            };
                            setSelectedQuestion(updatedQuestion);
                            setRecordings(prev => prev.map(r => 
                              r.id === selectedQuestion.id ? updatedQuestion : r
                            ));
                          }}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 mb-3"
                          placeholder={`Enter ${category} response...`}
                        />

                        <button
                          onClick={() => startRecording(category)}
                          disabled={isRecording || !response?.text?.trim()}
                          className={`px-4 py-2 text-sm rounded font-medium disabled:opacity-50 ${
                            isRecording && currentRecordingCategory === category
                              ? 'bg-gray-600 text-white'
                              : response?.hasRecording
                              ? 'border border-gray-300 hover:bg-gray-50'
                              : 'text-white'
                          }`}
                          style={{ 
                            backgroundColor: isRecording && currentRecordingCategory === category 
                              ? undefined 
                              : response?.hasRecording 
                              ? undefined 
                              : '#678A97' 
                          }}
                        >
                          {isRecording && currentRecordingCategory === category 
                            ? 'Recording...' 
                            : response?.hasRecording
                            ? 'Re-record'
                            : 'Record'
                          }
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Recording Indicator */}
                {isRecording && (
                  <div className="mt-6 p-4 bg-gray-100 rounded text-center">
                    <p className="text-gray-700 mb-2">Recording {getCategoryName(currentRecordingCategory!)} response...</p>
                    <button
                      onClick={stopRecording}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Stop & Save
                    </button>
                  </div>
                )}
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