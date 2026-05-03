import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const problemBank = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays",
    functionName: "twoSum",
    description:
      "Given an integer array nums and an integer target, return indices of the two numbers such that they add up to target. You may assume exactly one valid answer exists, and you may not use the same element twice.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i], target <= 10^9",
      "Exactly one valid answer exists.",
    ],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
    ],
    testcases: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1], isPublic: true },
      { args: [[3, 2, 4], 6], expected: [1, 2], isPublic: true },
      { args: [[3, 3], 6], expected: [0, 1], isPublic: false },
    ],
    starterCode: {
      javascript:
        "function twoSum(nums, target) {\n  // TODO: write your logic here\n  // return [index1, index2];\n}\n\nmodule.exports = twoSum;",
      java:
        "import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // TODO: write your logic here\n        return new int[]{-1, -1};\n    }\n}",
      python:
        "def twoSum(nums, target):\n    # TODO: write your logic here\n    # return [index1, index2]\n    pass",
      c:
        "#include <stdio.h>\n#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // TODO: write your logic here\n    *returnSize = 2;\n    int* ans = (int*)malloc(sizeof(int) * 2);\n    ans[0] = -1;\n    ans[1] = -1;\n    return ans;\n}",
      cpp:
        "#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // TODO: write your logic here\n        return {-1, -1};\n    }\n};",
      csharp:
        "using System;\n\npublic class Solution {\n    public int[] TwoSum(int[] nums, int target) {\n        // TODO: write your logic here\n        return new int[] { -1, -1 };\n    }\n}",
    },
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Stack",
    functionName: "isValid",
    description:
      "Given a string s containing only parentheses characters '()[]{}', determine if the input string is valid.",
    constraints: [
      "1 <= s.length <= 10^4",
      "s contains only the characters '()[]{}'.",
    ],
    examples: [
      {
        input: "s = \"()[]{}\"",
        output: "true",
      },
      {
        input: "s = \"(]\"",
        output: "false",
      },
    ],
    testcases: [
      { args: ["()[]{}"], expected: true, isPublic: true },
      { args: ["(]"], expected: false, isPublic: true },
      { args: ["{[]}"], expected: true, isPublic: false },
    ],
    starterCode: {
      javascript:
        "function isValid(s) {\n  // TODO: write your logic here\n  // return true or false;\n}\n\nmodule.exports = isValid;",
      java:
        "import java.util.*;\n\nclass Solution {\n    public boolean isValid(String s) {\n        // TODO: write your logic here\n        return false;\n    }\n}",
      python:
        "def isValid(s: str) -> bool:\n    # TODO: write your logic here\n    pass",
      c:
        "#include <stdbool.h>\n#include <string.h>\n\nbool isValid(char * s){\n    // TODO: write your logic here\n    return false;\n}",
      cpp:
        "#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // TODO: write your logic here\n        return false;\n    }\n};",
      csharp:
        "using System;\n\npublic class Solution {\n    public bool IsValid(string s) {\n        // TODO: write your logic here\n        return false;\n    }\n}",
    },
  },
];

const normalize = (value) => {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    const obj = {};
    keys.forEach((key) => {
      obj[key] = normalize(value[key]);
    });
    return obj;
  }
  return value;
};

const isEqual = (a, b) => JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));

const getProblemById = (problemId) => problemBank.find((problem) => problem.id === problemId);

const execWithInput = (cmd, args, cwd, stdin = "", timeoutMs = 4000) =>
  new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, windowsHide: true });
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ ok: false, error: String(error.message || error), stdout, stderr });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) {
        resolve({ ok: false, error: "Execution timed out", stdout, stderr });
        return;
      }
      resolve({
        ok: code === 0,
        code,
        stdout,
        stderr,
        error: code === 0 ? null : `Process exited with code ${code}`,
      });
    });

    if (stdin) child.stdin.write(stdin);
    child.stdin.end();
  });

const createRuntimeFiles = async (problemId, language, code, tempDir) => {
  if (problemId === "two-sum") {
    if (language === "javascript") {
      const source = `${code}
const fs = require("fs");
const raw = fs.readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);
const n = raw[0];
const nums = raw.slice(1, 1 + n);
const target = raw[1 + n];
const fn = typeof twoSum !== "undefined" ? twoSum : module.exports;
const ans = fn(nums, target);
process.stdout.write(JSON.stringify(ans));`;
      await fs.writeFile(path.join(tempDir, "main.js"), source);
      return { compile: null, run: { cmd: "node", args: ["main.js"] } };
    }
    if (language === "python") {
      const source = `${code}
import sys, json
raw = list(map(int, sys.stdin.read().strip().split()))
n = raw[0]
nums = raw[1:1+n]
target = raw[1+n]
fn = globals().get("twoSum") or globals().get("two_sum")
if not fn:
    raise Exception("Function twoSum not found")
print(json.dumps(fn(nums, target)))`;
      await fs.writeFile(path.join(tempDir, "main.py"), source);
      return { compile: null, run: { cmd: "python", args: ["main.py"] } };
    }
    if (language === "java") {
      const source = `${code}
public class Main {
  public static void main(String[] args) throws Exception {
    java.io.BufferedReader br = new java.io.BufferedReader(new java.io.InputStreamReader(System.in));
    java.util.List<Integer> vals = new java.util.ArrayList<>();
    String line;
    while ((line = br.readLine()) != null) {
      line = line.trim();
      if (line.isEmpty()) continue;
      for (String part : line.split("\\\\s+")) vals.add(Integer.parseInt(part));
    }
    int n = vals.get(0);
    int[] nums = new int[n];
    for (int i = 0; i < n; i++) nums[i] = vals.get(i + 1);
    int target = vals.get(n + 1);
    int[] ans = new Solution().twoSum(nums, target);
    System.out.print("[" + ans[0] + "," + ans[1] + "]");
  }
}`;
      await fs.writeFile(path.join(tempDir, "Main.java"), source);
      return {
        compile: { cmd: "javac", args: ["Main.java"] },
        run: { cmd: "java", args: ["Main"] },
      };
    }
    if (language === "c") {
      const source = `${code}
#include <stdio.h>
int main() {
  int n;
  if (scanf("%d", &n) != 1) return 0;
  int nums[10005];
  for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
  int target;
  scanf("%d", &target);
  int size = 0;
  int* ans = twoSum(nums, n, target, &size);
  if (size >= 2) printf("[%d,%d]", ans[0], ans[1]);
  else printf("[-1,-1]");
  return 0;
}`;
      await fs.writeFile(path.join(tempDir, "main.c"), source);
      return {
        compile: { cmd: "gcc", args: ["main.c", "-O2", "-o", "main.exe"] },
        run: { cmd: "main.exe", args: [] },
      };
    }
    if (language === "cpp") {
      const source = `${code}
int main() {
  int n;
  if (!(cin >> n)) return 0;
  vector<int> nums(n);
  for (int i = 0; i < n; i++) cin >> nums[i];
  int target;
  cin >> target;
  vector<int> ans = Solution().twoSum(nums, target);
  if (ans.size() >= 2) cout << "[" << ans[0] << "," << ans[1] << "]";
  else cout << "[-1,-1]";
  return 0;
}`;
      await fs.writeFile(path.join(tempDir, "main.cpp"), source);
      return {
        compile: { cmd: "g++", args: ["main.cpp", "-std=c++17", "-O2", "-o", "main.exe"] },
        run: { cmd: "main.exe", args: [] },
      };
    }
    if (language === "csharp") {
      const source = `${code}
using System;
using System.Collections.Generic;
public class Program {
  public static void Main() {
    var tokens = new List<int>();
    string line;
    while ((line = Console.ReadLine()) != null) {
      foreach (var p in line.Trim().Split(new [] {' '}, StringSplitOptions.RemoveEmptyEntries))
        tokens.Add(int.Parse(p));
    }
    int n = tokens[0];
    var nums = new int[n];
    for (int i = 0; i < n; i++) nums[i] = tokens[i + 1];
    int target = tokens[n + 1];
    var ans = new Solution().TwoSum(nums, target);
    Console.Write("[" + ans[0] + "," + ans[1] + "]");
  }
}`;
      await fs.writeFile(path.join(tempDir, "Program.cs"), source);
      return {
        compile: { cmd: "csc", args: ["Program.cs"] },
        run: { cmd: "Program.exe", args: [] },
      };
    }
  }

  if (problemId === "valid-parentheses") {
    if (language === "javascript") {
      const source = `${code}
const fs = require("fs");
const s = fs.readFileSync(0, "utf8").trim();
const fn = typeof isValid !== "undefined" ? isValid : module.exports;
const ans = fn(s);
process.stdout.write(String(ans).toLowerCase());`;
      await fs.writeFile(path.join(tempDir, "main.js"), source);
      return { compile: null, run: { cmd: "node", args: ["main.js"] } };
    }
    if (language === "python") {
      const source = `${code}
import sys
s = sys.stdin.read().strip()
fn = globals().get("isValid") or globals().get("is_valid")
if not fn:
    raise Exception("Function isValid not found")
print(str(fn(s)).lower())`;
      await fs.writeFile(path.join(tempDir, "main.py"), source);
      return { compile: null, run: { cmd: "python", args: ["main.py"] } };
    }
    if (language === "java") {
      const source = `${code}
public class Main {
  public static void main(String[] args) throws Exception {
    java.io.BufferedReader br = new java.io.BufferedReader(new java.io.InputStreamReader(System.in));
    String s = br.readLine();
    if (s == null) s = "";
    System.out.print(new Solution().isValid(s) ? "true" : "false");
  }
}`;
      await fs.writeFile(path.join(tempDir, "Main.java"), source);
      return {
        compile: { cmd: "javac", args: ["Main.java"] },
        run: { cmd: "java", args: ["Main"] },
      };
    }
    if (language === "c") {
      const source = `${code}
#include <stdio.h>
int main() {
  char s[20005];
  if (!fgets(s, sizeof(s), stdin)) return 0;
  for (int i = 0; s[i]; i++) { if (s[i] == '\\n' || s[i] == '\\r') { s[i] = '\\0'; break; } }
  printf("%s", isValid(s) ? "true" : "false");
  return 0;
}`;
      await fs.writeFile(path.join(tempDir, "main.c"), source);
      return {
        compile: { cmd: "gcc", args: ["main.c", "-O2", "-o", "main.exe"] },
        run: { cmd: "main.exe", args: [] },
      };
    }
    if (language === "cpp") {
      const source = `${code}
int main() {
  string s;
  getline(cin, s);
  cout << (Solution().isValid(s) ? "true" : "false");
  return 0;
}`;
      await fs.writeFile(path.join(tempDir, "main.cpp"), source);
      return {
        compile: { cmd: "g++", args: ["main.cpp", "-std=c++17", "-O2", "-o", "main.exe"] },
        run: { cmd: "main.exe", args: [] },
      };
    }
    if (language === "csharp") {
      const source = `${code}
using System;
public class Program {
  public static void Main() {
    string s = Console.ReadLine() ?? "";
    Console.Write(new Solution().IsValid(s) ? "true" : "false");
  }
}`;
      await fs.writeFile(path.join(tempDir, "Program.cs"), source);
      return {
        compile: { cmd: "csc", args: ["Program.cs"] },
        run: { cmd: "Program.exe", args: [] },
      };
    }
  }

  throw new Error("Unsupported language/problem combination");
};

const toInput = (problemId, args) => {
  if (problemId === "two-sum") {
    const [nums, target] = args;
    return `${nums.length}\n${nums.join(" ")}\n${target}\n`;
  }
  if (problemId === "valid-parentheses") {
    return `${args[0]}\n`;
  }
  return "";
};

const parseOutput = (problemId, output) => {
  const text = (output || "").trim();
  if (problemId === "two-sum") {
    try {
      return JSON.parse(text);
    } catch {
      const parts = text.split(/\s+/).map(Number).filter((v) => !Number.isNaN(v));
      return parts.slice(0, 2);
    }
  }
  if (problemId === "valid-parentheses") {
    return text.toLowerCase() === "true";
  }
  return text;
};

const runAgainstTests = async ({ code, language, problem, tests }) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "judge-"));
  try {
    const config = await createRuntimeFiles(problem.id, language, code, tempDir);
    if (config.compile) {
      const compiled = await execWithInput(config.compile.cmd, config.compile.args, tempDir, "", 10000);
      if (!compiled.ok) {
        throw new Error(compiled.stderr || compiled.error || "Compilation failed");
      }
    }

    const results = [];
    for (const test of tests) {
      const execRes = await execWithInput(
        config.run.cmd,
        config.run.args,
        tempDir,
        toInput(problem.id, test.args),
        4000
      );
      if (!execRes.ok) {
        results.push({
          passed: false,
          input: test.args,
          expected: test.expected,
          received: execRes.stderr || execRes.error || "Runtime error",
        });
        continue;
      }
      const received = parseOutput(problem.id, execRes.stdout);
      results.push({
        passed: isEqual(received, test.expected),
        input: test.args,
        expected: test.expected,
        received,
      });
    }
    return results;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
};

export const generateProblem = async (req, res) => {
  try {
    const { difficulty, topic } = req.body || {};
    const filtered = problemBank.filter((problem) => {
      if (difficulty && problem.difficulty !== difficulty) return false;
      if (topic && problem.topic !== topic) return false;
      return true;
    });

    const source = filtered.length ? filtered : problemBank;
    const index = Math.floor(Math.random() * source.length);
    const selected = source[index];

    return res.json({
      problem: {
        id: selected.id,
        title: selected.title,
        difficulty: selected.difficulty,
        topic: selected.topic,
        functionName: selected.functionName,
        description: selected.description,
        constraints: selected.constraints,
        examples: selected.examples,
        starterCode: selected.starterCode,
        publicTests: selected.testcases.filter((test) => test.isPublic).map((test) => ({
          args: test.args,
          expected: test.expected,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate problem." });
  }
};

export const runCode = async (req, res) => {
  try {
    const { code, problemId, language = "javascript" } = req.body || {};
    if (!code || !problemId) {
      return res.status(400).json({ message: "Code and problemId are required." });
    }

    const problem = getProblemById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found." });
    }

    const tests = problem.testcases.filter((test) => test.isPublic);
    const results = await runAgainstTests({
      code,
      language,
      problem,
      tests,
    });

    return res.json({
      mode: "run",
      passedCount: results.filter((result) => result.passed).length,
      totalCount: results.length,
      results,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Run failed. Check code, language runtime, and function signature.",
      details: String(error.message || error),
    });
  }
};

export const submitCode = async (req, res) => {
  try {
    const { code, problemId, language = "javascript" } = req.body || {};
    if (!code || !problemId) {
      return res.status(400).json({ message: "Code and problemId are required." });
    }

    const problem = getProblemById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found." });
    }

    const results = await runAgainstTests({
      code,
      language,
      problem,
      tests: problem.testcases,
    });

    const passedCount = results.filter((result) => result.passed).length;
    const totalCount = results.length;
    const accepted = passedCount === totalCount;

    return res.json({
      mode: "submit",
      verdict: accepted ? "Accepted" : "Wrong Answer",
      passedCount,
      totalCount,
      failedCase: results.find((result) => !result.passed) || null,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Submit failed. Check function name and return format.",
      details: String(error.message || error),
    });
  }
};