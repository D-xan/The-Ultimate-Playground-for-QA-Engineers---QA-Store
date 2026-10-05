import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PracticeElement } from '@/components/practice/PracticeElement';
import { PracticeSection as Section } from '@/components/practice/PracticeSection';

/** What the page has seen come back, so each task can tick itself. */
interface Seen { mocked: boolean; s404: boolean; s500: boolean; mutated: boolean; aborted: boolean }
const roleOf = (body: string) => { try { return JSON.parse(body)?.role; } catch { return undefined; } };

export default function ApiInterception() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [requestBody, setRequestBody] = useState('{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}');
  const [activeReqTab, setActiveReqTab] = useState('body');
  
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [seen, setSeen] = useState<Seen>({ mocked: false, s404: false, s500: false, mutated: false, aborted: false });
  const note = (patch: Partial<Seen>) => setSeen((prev) => ({ ...prev, ...patch }));

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
      
      const sentRole = options.body ? roleOf(String(options.body)) : undefined;
      if (res.status === 200 && data?.message === 'Intercepted!') note({ mocked: true });
      if (res.status === 404) note({ s404: true });
      if (res.status === 500) note({ s500: true });
      if (sentRole === 'user' && data?.role === 'admin') note({ mutated: true });
      setResponse({
        status: res.status,
        statusText: res.statusText,
        time: Math.round(endTime - startTime),
        data
      });
    } catch (e: any) {
      const endTime = performance.now();
      note({ aborted: true });
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
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">API Testing & Network Interception</h1>
        <p className="text-slate-500">
          A working mini API client. Use your tool’s network layer to mock responses, force error codes, rewrite requests and cut the connection. The page checks what came back, so each task ticks itself once your interception works.
        </p>
      </div>

      <Section n={1} title="API client">
      {/* Postman-like UI */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col h-[700px]">
        {/* Top URL Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-2">
          <select 
            className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-md font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/50 w-32"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            id="api-method-select"
            aria-label="HTTP method"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
          
          <input 
            type="text" 
            className="flex-1 min-w-0 basis-40 px-4 py-2 border border-slate-300 rounded-md font-mono text-sm outline-none focus:ring-2 focus:ring-primary/50"
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
                <div className="h-full flex items-center justify-center text-slate-400 italic font-sans">
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
      </Section>

      <Section n={2} title="Tasks">
        <PracticeElement
          id="api-mock" label="Mock a response"
          goal={'Send a GET request and make it come back as 200 with the body {"message": "Intercepted!"}, without the request reaching the real server.'}
          pass={['The status reads 200', 'The response body shows your JSON']}
          fail={['Registering the mock after clicking Send', 'A URL pattern that does not match, so the real post comes back']}
          hint="Register the route or intercept before you click Send. Match the URL with a glob such as **/posts/**."
          code={{
            playwright: "await page.route('**/posts/**', (route) => route.fulfill({ status: 200, json: { message: 'Intercepted!' } }));\nawait page.locator('#api-send-btn').click();\nawait expect(page.locator('#api-response-body')).toContainText('Intercepted!');",
            seleniumJava: '// Selenium 4 (Chromium): NetworkInterceptor answers matching requests itself\ntry (NetworkInterceptor ni = new NetworkInterceptor(driver, Route.matching(req -> req.getUri().contains("/posts/"))\n    .to(() -> req -> new HttpResponse().setStatus(200)\n      .addHeader("Content-Type", "application/json")\n      .setContent(Contents.utf8String("{\\"message\\":\\"Intercepted!\\"}"))))) {\n  driver.findElement(By.id("api-send-btn")).click();\n  wait.until(ExpectedConditions.textToBePresentInElementLocated(By.id("api-response-body"), "Intercepted!"));\n}',
            seleniumPython: '# Selenium has no built-in mocking in Python; selenium-wire adds it\ndef interceptor(request):\n    if "/posts/" in request.url:\n        request.create_response(status_code=200, headers={"Content-Type": "application/json"},\n                                body=b\'{"message": "Intercepted!"}\')\ndriver.request_interceptor = interceptor\ndriver.find_element(By.ID, "api-send-btn").click()',
            cypress: "cy.intercept('GET', '**/posts/**', { statusCode: 200, body: { message: 'Intercepted!' } });\ncy.get('#api-send-btn').click();\ncy.get('#api-response-body').should('contain', 'Intercepted!');",
          }}
          done={seen.mocked}
        >
          <p className="text-sm text-slate-600">Use the API client above.</p>
        </PracticeElement>

        <PracticeElement
          id="api-errors" label="Force error codes"
          goal="Make one request come back as 404 and another as 500."
          pass={['The status badge turns amber for 404 and red for 500', 'Both codes have been seen']}
          fail={['Pointing the URL at a missing page on the real server: that tests their server, not your mock', 'Leaving the first route active so the second request still gets 404']}
          hint="Fulfil with a status code only. Remove or replace the first route before the second request."
          code={{
            playwright: "await page.route('**/posts/**', (r) => r.fulfill({ status: 404, body: 'Not found' }));\nawait page.locator('#api-send-btn').click();\nawait expect(page.locator('#api-status')).toContainText('404');\nawait page.unroute('**/posts/**');\nawait page.route('**/posts/**', (r) => r.fulfill({ status: 500, body: 'Server error' }));\nawait page.locator('#api-send-btn').click();\nawait expect(page.locator('#api-status')).toContainText('500');",
            seleniumJava: 'for (int code : new int[] {404, 500}) {\n  try (NetworkInterceptor ni = new NetworkInterceptor(driver, Route.matching(req -> req.getUri().contains("/posts/"))\n      .to(() -> req -> new HttpResponse().setStatus(code)))) {\n    driver.findElement(By.id("api-send-btn")).click();\n    wait.until(ExpectedConditions.textToBePresentInElementLocated(By.id("api-status"), String.valueOf(code)));\n  }\n}',
            seleniumPython: 'for code in (404, 500):\n    driver.request_interceptor = lambda req, c=code: req.create_response(status_code=c, body=b"")\n    driver.find_element(By.ID, "api-send-btn").click()\n    wait.until(EC.text_to_be_present_in_element((By.ID, "api-status"), str(code)))',
            cypress: "cy.intercept('**/posts/**', { statusCode: 404 }).as('first');\ncy.get('#api-send-btn').click();\ncy.get('#api-status').should('contain', '404');\ncy.intercept('**/posts/**', { statusCode: 500 }); // the newest intercept wins\ncy.get('#api-send-btn').click();\ncy.get('#api-status').should('contain', '500');",
          }}
          done={seen.s404 && seen.s500}
        >
          <p className="text-sm text-slate-600">Seen so far: <span data-testid="api-codes-seen">{[seen.s404 && '404', seen.s500 && '500'].filter(Boolean).join(', ') || 'none'}</span></p>
        </PracticeElement>

        <PracticeElement
          id="api-mutate" label="Rewrite a request in flight"
          goal={'Set the method to POST with the body {"role": "user"}. Change role to admin on the way out, so the server echoes back admin.'}
          pass={['The textarea still says user', 'The response echoes "role": "admin"']}
          fail={['Editing the textarea instead: the page checks it still says user', 'Mocking the response: rewrite the request and let it through']}
          hint="Intercept, read the outgoing body, change it, then continue the request with the new body. jsonplaceholder echoes what it receives."
          code={{
            playwright: "await page.route('**/posts', async (route) => {\n  const body = { ...route.request().postDataJSON(), role: 'admin' };\n  await route.continue({ postData: JSON.stringify(body) });\n});\nawait page.locator('#api-method-select').selectOption('POST');\nawait page.locator('#api-url-input').fill('https://jsonplaceholder.typicode.com/posts');\nawait page.locator('#api-body-textarea').fill('{\"role\": \"user\"}');\nawait page.locator('#api-send-btn').click();\nawait expect(page.locator('#api-response-body')).toContainText('\"role\": \"admin\"');",
            seleniumJava: '// A Filter sees each request and can pass on a changed copy\nFilter toAdmin = next -> req -> {\n  if (req.getMethod() == HttpMethod.POST && req.getUri().endsWith("/posts"))\n    req.setContent(Contents.utf8String(Contents.string(req).replace("\\"user\\"", "\\"admin\\"")));\n  return next.execute(req);\n};\ntry (NetworkInterceptor ni = new NetworkInterceptor(driver, toAdmin)) {\n  // choose POST, set the URL and body, click Send\n}',
            seleniumPython: 'import json\ndef interceptor(request):\n    if request.method == "POST" and request.url.endswith("/posts"):\n        body = json.loads(request.body)\n        body["role"] = "admin"\n        request.body = json.dumps(body).encode()\n        del request.headers["Content-Length"]\n        request.headers["Content-Length"] = str(len(request.body))\ndriver.request_interceptor = interceptor  # selenium-wire',
            cypress: "cy.intercept('POST', '**/posts', (req) => { req.body.role = 'admin'; });\ncy.get('#api-method-select').select('POST');\ncy.get('#api-url-input').clear().type('https://jsonplaceholder.typicode.com/posts');\ncy.get('#api-body-textarea').clear().type('{\"role\": \"user\"}', { parseSpecialCharSequences: false });\ncy.get('#api-send-btn').click();\ncy.get('#api-response-body').should('contain', '\"role\": \"admin\"');",
          }}
          done={seen.mutated}
        >
          <p className="text-sm text-slate-600">Use the API client above.</p>
        </PracticeElement>

        <PracticeElement
          id="api-abort" label="Cut the connection"
          goal="Make the request fail at the network level, as if the user went offline."
          pass={['The client shows “Network Error” instead of a status code']}
          fail={['Returning a 500: that is a server answer, not a dropped connection']}
          hint="Abort the request in your interceptor instead of fulfilling it."
          code={{
            playwright: "await page.route('**/posts/**', (route) => route.abort('internetdisconnected'));\nawait page.locator('#api-send-btn').click();\nawait expect(page.locator('#api-status-error')).toHaveText('Network Error');",
            seleniumJava: '// Chromium DevTools: emulate going offline\nDevTools dt = ((HasDevTools) driver).getDevTools();\ndt.createSession();\ndt.send(Network.enable(Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty()));\ndt.send(Network.emulateNetworkConditions(true, 0, -1, -1, Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty()));\ndriver.findElement(By.id("api-send-btn")).click();',
            seleniumPython: 'driver.set_network_conditions(offline=True, latency=0, download_throughput=0, upload_throughput=0)\ndriver.find_element(By.ID, "api-send-btn").click()\nwait.until(EC.visibility_of_element_located((By.ID, "api-status-error")))',
            cypress: "cy.intercept('**/posts/**', { forceNetworkError: true });\ncy.get('#api-send-btn').click();\ncy.get('#api-status-error').should('have.text', 'Network Error');",
          }}
          done={seen.aborted}
        >
          <p className="text-sm text-slate-600">Use the API client above.</p>
        </PracticeElement>
      </Section>
    </div>
  );
}
