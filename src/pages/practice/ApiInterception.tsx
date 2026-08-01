import React, { useState } from 'react';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';

export default function ApiInterception() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [requestBody, setRequestBody] = useState('{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}');
  const [activeReqTab, setActiveReqTab] = useState('body');
  
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);
    const startTime = performance.now();
    
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (method !== 'GET' && method !== 'HEAD' && requestBody) {
        // Simple validation to ensure it doesn't crash on bad JSON if they type junk
        try {
          JSON.parse(requestBody);
          options.body = requestBody;
        } catch(e) {
          options.body = requestBody; // Send as text if not valid JSON
        }
      }
      
      const res = await fetch(url, options);
      const endTime = performance.now();
      
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }
      
      setResponse({
        status: res.status,
        statusText: res.statusText,
        time: Math.round(endTime - startTime),
        data
      });
    } catch (e: any) {
      const endTime = performance.now();
      setResponse({
        error: true,
        message: e.message || 'Network connection aborted or failed',
        time: Math.round(endTime - startTime)
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-50 border-green-200';
    if (status >= 300 && status < 400) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (status >= 400 && status < 500) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (status >= 500) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">API Testing & Network Interception</h1>
        <p className="text-slate-500">
          A fully functional mini-API client. Use your automation tool (Playwright, Cypress, Selenium CDPs) to intercept these requests, modify payloads, and simulate all HTTP methods and error codes!
        </p>
      </div>

      <div className="mb-4">
        <TaskQuestions tasks={[
          {
            "title": "Mock a GET Request (200 OK)",
            "description": "Send a GET request to any URL. Intercept it and return a 200 status code with a custom JSON body `{ \"message\": \"Intercepted!\" }`.",
            "positive": [
              "The response body displays your custom JSON.",
              "The status code displays as 200 OK."
            ],
            "negative": [
              "The original response from the server is displayed."
            ]
          },
          {
            "title": "Simulate Error Codes (404 & 500)",
            "description": "Send a request and intercept it to force a 404 Not Found, and then a 500 Internal Server Error.",
            "positive": [
              "The status badge turns amber for 404 and red for 500.",
              "The UI accurately reflects the mocked status codes."
            ],
            "negative": [
              "The request passes through to the real API and returns a 200 or 201."
            ]
          },
          {
            "title": "Modify Request Payload (POST/PUT)",
            "description": "Set the Method to POST. Enter `{\"role\": \"user\"}` in the body. Intercept the request outbound, change the role to `\"admin\"`, and let it hit a mock server (e.g. `https://jsonplaceholder.typicode.com/posts`).",
            "positive": [
              "The response from the server echoes back the modified `\"role\": \"admin\"` body.",
              "The assertion verifies the payload was mutated mid-flight."
            ],
            "negative": [
              "The server echoes back the original `\"role\": \"user\"` payload."
            ]
          }
        ]} />
      </div>

      {/* Postman-like UI */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col h-[700px]">
        {/* Top URL Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-2">
          <select 
            className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-md font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/50 w-32"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            id="api-method-select"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
          
          <input 
            type="text" 
            className="flex-1 px-4 py-2 border border-slate-300 rounded-md font-mono text-sm outline-none focus:ring-2 focus:ring-primary/50"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter request URL"
            id="api-url-input"
          />
          
          <Button 
            onClick={handleSend} 
            disabled={loading} 
            className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold"
            id="api-send-btn"
          >
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </div>

        {/* Workspace Split */}
        <div className="flex flex-col flex-1 overflow-hidden">
          
          {/* Request Section */}
          <div className="flex-1 flex flex-col border-b border-slate-200 min-h-[200px]">
            <div className="flex border-b border-slate-200 bg-slate-50 px-2">
              <button 
                className={`px-4 py-2 text-sm font-medium border-b-2 ${activeReqTab === 'params' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
                onClick={() => setActiveReqTab('params')}
              >
                Params
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium border-b-2 ${activeReqTab === 'headers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
                onClick={() => setActiveReqTab('headers')}
              >
                Headers
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium border-b-2 ${activeReqTab === 'body' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
                onClick={() => setActiveReqTab('body')}
                id="tab-body"
              >
                Body
              </button>
            </div>
            
            <div className="flex-1 p-0 bg-white relative">
              {activeReqTab === 'body' && (
                <textarea
                  className="w-full h-full p-4 font-mono text-sm text-slate-800 resize-none outline-none"
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  disabled={method === 'GET' || method === 'HEAD'}
                  placeholder={method === 'GET' ? "Body is not supported for GET requests." : "Enter JSON body here..."}
                  id="api-body-textarea"
                  spellCheck={false}
                />
              )}
              {activeReqTab !== 'body' && (
                <div className="p-4 text-slate-400 italic flex items-center justify-center h-full">
                  (Simulated UI: Use your automation tool to inject headers/params at the network layer)
                </div>
              )}
            </div>
          </div>

          {/* Response Section */}
          <div className="flex-1 flex flex-col bg-slate-50 min-h-[250px]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
              <div className="font-semibold text-sm text-slate-700">Response</div>
              
              {response && !response.error && (
                <div className="flex gap-4 text-xs font-mono">
                  <span className={`px-2 py-1 rounded border ${getStatusColor(response.status)}`} id="api-status">
                    Status: {response.status} {response.statusText}
                  </span>
                  <span className="px-2 py-1 rounded border border-slate-200 text-slate-600" id="api-time">
                    Time: {response.time}ms
                  </span>
                </div>
              )}
              {response && response.error && (
                <div className="flex gap-4 text-xs font-mono">
                  <span className="px-2 py-1 rounded border border-red-200 bg-red-50 text-red-600" id="api-status-error">
                    Network Error
                  </span>
                  <span className="px-2 py-1 rounded border border-slate-200 text-slate-600" id="api-time">
                    Time: {response.time}ms
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 p-4 overflow-auto bg-[#1e1e1e] text-[#d4d4d4]" id="api-response-body">
              {!response ? (
                <div className="h-full flex items-center justify-center text-slate-500 italic font-sans">
                  Hit Send to get a response
                </div>
              ) : response.error ? (
                <div className="text-red-400 font-mono text-sm">
                  {response.message}
                </div>
              ) : (
                <pre className="font-mono text-sm whitespace-pre-wrap break-all">
                  {typeof response.data === 'object' 
                    ? JSON.stringify(response.data, null, 2) 
                    : response.data}
                </pre>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
