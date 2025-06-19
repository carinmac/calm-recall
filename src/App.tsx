import React, { useState, useRef } from "react";
import "./App.css";

interface Recording {
  id: number;
  question: string;
  response: string;
  audioBlob?: Blob;
  hasRecording: boolean;
  timesPlayed: number;
}

function App() {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecordingId, setCurrentRecordingId] = useState<number | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([
    { 
      id: 1, 
      question: "Where are my keys?", 
      response: "Your keys are safe, I put them in the bowl by the door.", 
      hasRecording: true,
      timesPlayed: 12
    },
    { 
      id: 2, 
      question: "When is dinner?", 
      response: "Dinner will be ready at 6 PM, just like always.", 
      hasRecording: true,
      timesPlayed: 8
    },
    { 
      id: 3, 
      question: "I want to go home", 
      response: "You are home, sweetheart. This is your safe place with me.", 
      hasRecording: false,
      timesPlayed: 0
    }
  ]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async (recordingId: number) => {
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
          r.id === recordingId 
            ? { ...r, audioBlob, hasRecording: true }
            : r
        ));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setCurrentRecordingId(recordingId);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setCurrentRecordingId(null);
    }
  };

  const playRecording = (recording: Recording) => {
    if (recording.audioBlob) {
      const audioUrl = URL.createObjectURL(recording.audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      
      setRecordings(prev => prev.map(r => 
        r.id === recording.id 
          ? { ...r, timesPlayed: r.timesPlayed + 1 }
          : r
      ));
    }
  };

  const recordedCount = recordings.filter(r => r.hasRecording).length;
  const totalPlayed = recordings.reduce((sum, r) => sum + r.timesPlayed, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Simple Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg" 
                 style={{ backgroundColor: '#678A97' }}>
              CR
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calm Recall</h1>
              <p className="text-gray-600">Voice Library Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4" style={{ borderLeftColor: '#678A97' }}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                     style={{ backgroundColor: '#678A97' }}>
                  🎙️
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Responses Recorded</p>
                <p className="text-2xl font-bold text-gray-900">{recordedCount}/3</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-400">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold">
                  ▶️
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Times Played</p>
                <p className="text-2xl font-bold text-gray-900">{totalPlayed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-400">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                  👂
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Listening Mode</p>
                <p className="text-lg font-bold text-gray-900">
                  {isListening ? "Active" : "Off"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <button
              onClick={() => setIsListening(!isListening)}
              className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-all ${
                isListening
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "text-white hover:opacity-90"
              }`}
              style={{ backgroundColor: isListening ? undefined : '#678A97' }}
            >
              {isListening ? "🛑 Stop Listening" : "▶️ Start Listening"}
            </button>
          </div>
        </div>

        {/* Recordings Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Voice Responses</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {recordings.map((recording) => (
              <div key={recording.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">
                      "{recording.question}"
                    </h3>
                    {recording.hasRecording && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                        ✓ Ready
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    "{recording.response}"
                  </p>

                  {recording.hasRecording && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Played {recording.timesPlayed} times
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {recording.hasRecording ? (
                      <>
                        <button
                          onClick={() => playRecording(recording)}
                          className="w-full py-3 px-4 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors"
                        >
                          ▶️ Play Recording
                        </button>
                        <button
                          onClick={() => startRecording(recording.id)}
                          disabled={isRecording}
                          className="w-full py-2 px-4 text-gray-600 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          🎙️ Re-record
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startRecording(recording.id)}
                        disabled={isRecording}
                        className="w-full py-4 px-4 text-white rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        style={{ backgroundColor: '#678A97' }}
                      >
                        {isRecording && currentRecordingId === recording.id 
                          ? "🎙️ Recording..." 
                          : "🎙️ Record Your Voice"
                        }
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recording Controls */}
        {isRecording && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-full shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-red-300 rounded-full animate-pulse"></div>
              <span className="font-medium">Recording in progress...</span>
              <button
                onClick={stopRecording}
                className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
              >
                Stop & Save
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">🌟 How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">1.</span>
              <span>Record your voice answering each question in your own warm, comforting way</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">2.</span>
              <span>Turn on "Listening Mode" when you're ready for the app to help</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">3.</span>
              <span>When they ask the same question, they'll hear your familiar voice respond</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;