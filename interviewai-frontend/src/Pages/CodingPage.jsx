import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { serverUrl } from "../App";

function CodingPage() {
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeStarterCode = useMemo(() => {
    return problem?.starterCode?.[language] || "";
  }, [problem, language]);

  const fetchProblem = async () => {
    setIsLoadingProblem(true);
    setError("");
    try {
      const { data } = await axios.post(`${serverUrl}/api/coding/generate`, {});
      const fetchedProblem = data?.problem || null;
      setProblem(fetchedProblem);
      setCode(fetchedProblem?.starterCode?.[language] || "");
      setRunResult(null);
      setSubmitResult(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to fetch coding problem.");
    } finally {
      setIsLoadingProblem(false);
    }
  };

  const runCode = async () => {
    if (!problem?.id) return;
    setIsRunning(true);
    setError("");
    setSubmitResult(null);
    try {
      const { data } = await axios.post(`${serverUrl}/api/coding/run`, {
        code,
        problemId: problem.id,
        language,
      });
      setRunResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Code execution failed.");
      setRunResult(null);
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (!problem?.id) return;
    setIsSubmitting(true);
    setError("");
    try {
      const { data } = await axios.post(`${serverUrl}/api/coding/submit`, {
        code,
        problemId: problem.id,
        language,
      });
      setSubmitResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Submit failed.");
      setSubmitResult(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCode = () => {
    setCode(activeStarterCode);
    setRunResult(null);
    setSubmitResult(null);
    setError("");
  };

  useEffect(() => {
    fetchProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCode(activeStarterCode);
  }, [activeStarterCode]);

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4 gap-3">
            <h1 className="text-2xl font-bold">DSA Practice Arena</h1>
            <button
              onClick={fetchProblem}
              disabled={isLoadingProblem}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            >
              {isLoadingProblem ? "Loading..." : "New Problem"}
            </button>
          </div>

          {problem ? (
            <div className="space-y-4 text-sm">
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-950 border border-blue-800 rounded text-blue-300">
                  {problem.difficulty}
                </span>
                <span className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-300">
                  {problem.topic}
                </span>
              </div>
              <h2 className="text-xl font-semibold">{problem.title}</h2>
              <p className="text-gray-300 leading-relaxed">{problem.description}</p>
              <div>
                <p className="text-gray-400 font-medium mb-1">Function</p>
                <p className="text-gray-300 font-mono">{problem.functionName}(...args)</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium mb-2">Examples</p>
                <div className="space-y-2">
                  {problem.examples?.map((example, idx) => (
                    <div key={idx} className="bg-gray-950 border border-gray-800 rounded-xl p-3">
                      <p className="text-gray-300">
                        <span className="text-gray-500">Input:</span> {example.input}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-500">Output:</span> {example.output}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-gray-400 font-medium mb-2">Constraints</p>
                <ul className="list-disc pl-5 text-gray-300 space-y-1">
                  {problem.constraints?.map((constraint, idx) => (
                    <li key={idx}>{constraint}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Loading problem...</p>
          )}
        </section>

        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-sm text-blue-300 bg-blue-950/60 border border-blue-900 rounded px-3 py-1.5">
              {language.toUpperCase()} mode
            </p>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
            >
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="csharp">C#</option>
            </select>
            <button
              onClick={resetCode}
              className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-sm cursor-pointer"
            >
              Reset Code
            </button>
          </div>

          <Editor
            height="360px"
            language={language === "cpp" ? "cpp" : language === "csharp" ? "csharp" : language}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark"
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />

          <div className="mt-4 flex gap-3">
            <button
              onClick={runCode}
              disabled={isRunning}
              className="bg-gray-800 hover:bg-gray-700 disabled:opacity-60 px-5 py-2.5 rounded-lg font-medium cursor-pointer"
            >
              {isRunning ? "Running..." : "Run"}
            </button>
            <button
              onClick={submitCode}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-5 py-2.5 rounded-lg font-medium cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-950 border border-red-800 text-red-300 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          {runResult && (
            <div className="mt-4 bg-gray-950 border border-gray-800 rounded-xl p-3">
              <p className="text-gray-300 text-sm mb-2">
                Run Result: {runResult.passedCount}/{runResult.totalCount} public testcases passed
              </p>
              <div className="space-y-2 text-sm">
                {runResult.results?.map((item, idx) => (
                  <div key={idx} className={`rounded-lg p-2 border ${item.passed ? "border-green-800 bg-green-950/30" : "border-red-800 bg-red-950/30"}`}>
                    <p>{item.passed ? "Passed" : "Failed"} testcase #{idx + 1}</p>
                    {!item.passed && (
                      <p className="text-gray-300">
                        Expected: {JSON.stringify(item.expected)} | Got: {JSON.stringify(item.received)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {submitResult && (
            <div className={`mt-4 border rounded-xl p-3 ${submitResult.verdict === "Accepted" ? "bg-green-950/30 border-green-800" : "bg-red-950/30 border-red-800"}`}>
              <p className="font-semibold">{submitResult.verdict}</p>
              <p className="text-sm text-gray-300">
                Passed {submitResult.passedCount}/{submitResult.totalCount} testcases
              </p>
              {submitResult.failedCase && (
                <p className="text-sm text-gray-300 mt-1">
                  Failed Input: {JSON.stringify(submitResult.failedCase.input)} | Expected: {JSON.stringify(submitResult.failedCase.expected)} | Got: {JSON.stringify(submitResult.failedCase.received)}
                </p>
              )}
            </div>
          )}

          <div className="mt-4 bg-gray-950 border border-gray-800 rounded-xl p-3">
            <p className="text-gray-400 mb-2 text-sm">Testcase Panel</p>
            <div className="space-y-2 min-h-16">
              {problem?.publicTests?.map((test, idx) => (
                <div key={idx} className="border border-gray-800 rounded-lg p-2 bg-gray-900/60">
                  <p className="text-xs text-gray-400">Case {idx + 1}</p>
                  <p className="text-sm text-gray-200">
                    <span className="text-gray-500">Input:</span> {JSON.stringify(test.args)}
                  </p>
                  <p className="text-sm text-gray-200">
                    <span className="text-gray-500">Expected:</span> {JSON.stringify(test.expected)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CodingPage;