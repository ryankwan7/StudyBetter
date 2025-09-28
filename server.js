const http = require("http");
const { Pool } = require("pg");

// connection pool to the PostgreSQL database
const pool = new Pool({
  connectionString: "postgresql://educationmoney_user:X8FS1Cov2gftjtidsFaoBim7Nw6FkKEf@dpg-d3c36dd6ubrc73efgl00-a.oregon-postgres.render.com/educationmoney",
  ssl: { rejectUnauthorized: false } // required for Render Postgres
});

// Create HTTP server
const server = http.createServer(async (req, res) => {
  try{
    // Get all betters
    if (req.url === "/better" && req.method === "GET") {
      const result = await pool.query("SELECT * FROM better");
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(result.rows));
    }

    // Get all students
    if (req.url === "/students" && req.method === "GET") {
      const result = await pool.query("SELECT * FROM student");
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(result.rows));
    }

    // Get all transactions / bets
    if (req.url === "/bets" && req.method === "GET") {
      const result = await pool.query("SELECT * FROM transaction");
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(result.rows));
    }

    // Get all organizers
    if (req.url === "/organizers" && req.method === "GET") {
      const result = await pool.query("SELECT * FROM organiser");
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(result.rows));
    }

    // Get all groups
    if (req.url === "/groups" && req.method === "GET") {
      const result = await pool.query("SELECT * FROM groups");
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(result.rows));
    }

  

  } catch (error) {
    console.error("Server error:", error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

// Start server
server.listen(3000, () =>
  console.log("Server running at http://localhost:3000")
);