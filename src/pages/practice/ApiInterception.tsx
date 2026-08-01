import React, { useState } from 'react';
import { TaskQuestions } from '@/components/ui/TaskQuestions';
import { Button } from '@/components/ui/Button';

export default function ApiInterception() {
  const [userData, setUserData] = useState<{name?: string, error?: string} | null>(null);
  const [orderStatus, setOrderStatus] = useState<{status: 'success' | 'error', message: string} | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const fetchUser = async () => {
    setLoadingUser(true);
    setUserData(null);
    try {
      // Using a real public API so it doesn't 404 by default
      const res = await fetch('https://jsonplaceholder.typicode.com/users/1');
      const data = await res.json();
      setUserData({ name: data.name });
    } catch (e) {
      setUserData({ error: 'Network Failure' });
    } finally {
      setLoadingUser(false);
    }
  };

  const submitOrder = async () => {
    setLoadingOrder(true);
    setOrderStatus(null);
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ item: 'Laptop', price: 999 }),
      });
      
      if (!res.ok) {
        setOrderStatus({ status: 'error', message: `Server Error: ${res.status}` });
      } else {
        setOrderStatus({ status: 'success', message: 'Order submitted successfully!' });
      }
    } catch (e) {
      setOrderStatus({ status: 'error', message: 'Network connection aborted' });
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Network & API Interception</h1>
        <p className="text-slate-500">
          Modern UI automation tools (like Playwright and Cypress) can intercept network requests directly from the browser. 
          Practice mocking API responses, simulating server errors, and aborting requests.
        </p>
      </div>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">1. Mocking API Responses</h2>
        <div className="mb-4 mt-2">
          <TaskQuestions tasks={[
            {
              "title": "Intercept and mock the GET request",
              "description": "Intercept the GET request to `https://jsonplaceholder.typicode.com/users/1`. Instead of letting the real response through, return a mock JSON object with `{ \"name\": \"QA Automation Master\" }`.",
              "positive": [
                "The UI displays 'Name: QA Automation Master' instead of 'Leanne Graham'."
              ],
              "negative": [
                "The script fails to intercept the request and the real name is shown."
              ]
            }
          ]} />
        </div>
        
        <div className="flex flex-col items-start gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
          <Button onClick={fetchUser} disabled={loadingUser} id="btn-fetch-user">
            {loadingUser ? 'Fetching...' : 'Fetch User Data'}
          </Button>
          
          <div className="min-h-[60px] w-full bg-white p-4 rounded-md border border-slate-200" id="user-data-display">
            {userData ? (
              userData.error ? (
                <span className="text-red-500">{userData.error}</span>
              ) : (
                <span className="text-slate-900 font-medium">Name: {userData.name}</span>
              )
            ) : (
              <span className="text-slate-400 italic">Click the button to fetch data...</span>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">2. Simulating Server Errors (500)</h2>
        <div className="mb-4 mt-2">
          <TaskQuestions tasks={[
            {
              "title": "Simulate a 500 Internal Server Error",
              "description": "Intercept the POST request to `https://jsonplaceholder.typicode.com/posts` and force it to return a 500 status code to verify the frontend error handling.",
              "positive": [
                "The UI correctly handles the error and displays 'Server Error: 500'."
              ],
              "negative": [
                "The script lets the request pass normally and 'Order submitted successfully!' is shown."
              ]
            }
          ]} />
        </div>
        
        <div className="flex flex-col items-start gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
          <Button onClick={submitOrder} disabled={loadingOrder} id="btn-submit-order" className="bg-amber-500 hover:bg-amber-600">
            {loadingOrder ? 'Submitting...' : 'Submit Order'}
          </Button>
          
          <div className="min-h-[60px] w-full bg-white p-4 rounded-md border border-slate-200 flex items-center" id="order-status-display">
            {orderStatus ? (
              <div className={`flex items-center gap-2 font-medium ${orderStatus.status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {orderStatus.status === 'error' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                )}
                {orderStatus.message}
              </div>
            ) : (
              <span className="text-slate-400 italic">No order submitted yet.</span>
            )}
          </div>
        </div>
      </section>
      
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">3. Aborting Network Requests</h2>
        <div className="mb-4 mt-2">
          <TaskQuestions tasks={[
            {
              "title": "Abort the request to simulate a network failure",
              "description": "Intercept the POST request to `https://jsonplaceholder.typicode.com/posts` when clicking the Submit button below, and abort/fail the network request entirely (simulating an offline state or blocked request).",
              "positive": [
                "The UI catches the exception and displays 'Network connection aborted'."
              ],
              "negative": [
                "The request succeeds or returns a standard 500 error instead of a hard network abort."
              ]
            }
          ]} />
        </div>
        
        <div className="p-4 border-l-4 border-primary bg-primary/10 rounded-r-lg">
          <p className="text-sm font-medium text-slate-800">
            💡 Use the exact same <strong>Submit Order</strong> button from Challenge #2. The frontend logic catches hard network failures (like CORS or aborted requests) differently than server HTTP status codes!
          </p>
        </div>
      </section>

    </div>
  );
}
