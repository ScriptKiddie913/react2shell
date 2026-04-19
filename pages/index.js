import { useState } from "react";

export default function Home() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });

      const data = await res.json();
      setOutput(data.output || data.error);
    } catch (e) {
      setOutput("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚛️ React Live Preview</h1>

      <textarea
        style={styles.textarea}
        placeholder="Enter JSX or JS expression..."
        onChange={(e) => setCode(e.target.value)}
      />

      <button style={styles.button} onClick={runCode}>
        {loading ? "Running..." : "Preview"}
      </button>

      <pre style={styles.output}>{output}</pre>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "monospace",
    padding: "40px",
    background: "#0f172a",
    color: "#e2e8f0",
    minHeight: "100vh"
  },
  title: {
    fontSize: "28px"
  },
  textarea: {
    width: "100%",
    height: "150px",
    marginTop: "20px",
    background: "#020617",
    color: "#38bdf8",
    border: "1px solid #1e293b",
    padding: "10px"
  },
  button: {
    marginTop: "10px",
    padding: "10px 20px",
    background: "#38bdf8",
    border: "none",
    cursor: "pointer"
  },
  output: {
    marginTop: "20px",
    background: "#020617",
    padding: "15px"
  }
};
