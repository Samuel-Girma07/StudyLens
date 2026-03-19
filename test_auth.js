async function runTests() {
  console.log("Testing POST /api/auth/signup")
  try {
    const res = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test_integration@studylens.com",
        password: "password123"
      })
    })

    const data = await res.json().catch(() => ({}));
    console.log("Status:", res.status)
    console.log("Response:", data)
    
    // We expect this to fail with 500 because the Neon Postgres push failed,
    // so the User table doesn't exist in the remote database.
  } catch (err) {
    console.error("Test Request Failed:", err.message)
  }
}

runTests();
