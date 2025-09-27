const http = require("http");
const { Pool } = require("pg");

// connection pool to the PostgreSQL database
const pool = new Pool({
    user: "educationmoney_user",       
  host: "dpg-d3c36dd6ubrc73efgl00-a",      // check!!!
  database: "educationmoney",       
  password: "X8FS1Cov2gftjtidsFaoBim7Nw6FkKEf",   
  port: 5432,            
});

// Create HTTP server
const server = http.createServer(async (req, res) => {

    if (req.url === "/login" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      const { username, password } = JSON.parse(body);

      try {
        const result = await pool.query(
          "SELECT * FROM betters WHERE username = $1 AND password = $2",
          [username, password]
        );

        if (result.rows.length > 0) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, message: "Login successful!" }));
        } else {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, message: "Invalid credentials" }));
        }
      } catch (err) {
        console.error(err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Server error" }));
      }
    });}
  
    else if (req.url === "/students" && req.method === "GET") {
    try {
      const result = await pool.query("SELECT * FROM students");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      console.error(err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Database error");
    }
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }


});

// Start server
server.listen(3000, () =>
  console.log("Server running at http://localhost:3000")
);