let currentUser = null;
let betters = [];
let students = [];
let organizers = [];
let bets = [];
let userType = null; // "better" or "organizer"

const API_BASE = "http://localhost:3000";

async function loadInitialData() {
  try {
    console.log("Loading initial data...");

    const [
      bettersResponse,
      studentsResponse,
      betsResponse,
      organizersResponse,
    ] = await Promise.all([
      fetch(`${API_BASE}/better`),
      fetch(`${API_BASE}/students`),
      fetch(`${API_BASE}/bets`),
      fetch(`${API_BASE}/organizers`),
    ]);

    betters = bettersResponse.ok ? await bettersResponse.json() : [];
    students = studentsResponse.ok ? await studentsResponse.json() : [];
    bets = betsResponse.ok ? await betsResponse.json() : [];
    organizers = organizersResponse.ok ? await organizersResponse.json() : [];

    console.log("Data loaded successfully");
  } catch (error) {
    console.error("Error loading initial data:", error);
    loadHardcodedData();
  }
}

function loadHardcodedData() {
  students = [
    {
      id: 1,
      name: "Alice",
      school: "SFU",
      faculty: "Computer Science",
    },
  ];
  betters = [
    {
      id: 1,
      username: "bob456",
      name: "Bob",
      money: 150,
    },
  ];
}

function loginUser(username, password) {
  let user = betters.find(
    (s) => s.username.toLowerCase() === username.toLowerCase().trim()
  );
  if (!user) {
    console.log("User not found");
    return;
  }
  if (user.password !== password) {
    console.log("Incorrect password");
    return;
  }
  currentUser = user;
  userType = "better";
}

function loginOrganizer(username, password) {
  let user = organizers.find(
    (o) => o.username.toLowerCase() === username.toLowerCase().trim()
  );

  if (!user) {
    console.log("Organizer not found");
    return;
  }

  if (user.password !== password) {
    console.log("Incorrect password");
    return;
  }
  currentUser = user;
  userType = "organizer";
}

function logoutUser() {
  currentUser = null;
  userType = null;
}

async function registerStudent(first_name, last_name, school, faculty) {
  let newStudent = {
    id: students.length + 1,
    first_name: first_name,
    last_name: last_name,
    school: school,
    faculty: faculty,
  };
  try {
    const response = await fetch(`${API_BASE}/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStudent),
    });

    if (response.ok) {
      const savedStudent = await response.json();
      newStudent = savedStudent;
    }
  } catch (error) {
    console.error("Error saving student to server:", error);
  }

  students.push(newStudent);
  console.log("Student registered successfully");
}

async function placeBet(betOnId, amount) {
  if (!currentUser) {
    throw new Error("No user logged in");
  }

  if (amount > currentUser.money) {
    throw new Error("Insufficient funds");
  }

  if (!students.find((s) => s.id === betOnId)) {
    throw new Error("Student not found");
  }

  if (amount <= 0) {
    throw new Error("Bet amount must be positive");
  }

  let newBet = {
    id: bets.length + 1,
    betterId: currentUser.id,
    betOnId: betOnId,
    amount: amount,
    status: "active",
    date: new Date().toLocaleDateString(),
  };

  try {
    const response = await fetch(`${API_BASE}/bets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newBet),
    });

    if (response.ok) {
      const savedBet = await response.json();
      newBet = savedBet;
    }
  } catch (error) {
    console.error("Error saving bet to server:", error);
  }

  currentUser.money -= amount;
  bets.push(newBet);
  console.log("Bet placed successfully");
}

function resolveBet(betId, winningId) {
  let bet = bets.find((b) => b.id === betId);
  if (!bet) throw new Error("Bet not found");

  if (bet.betOnId === winningId) {
    let winnings = bet.amount * 2;
    let better = betters.find((b) => b.id === bet.betterId);
    better.money += winnings;
    console.log(`Bet won! ${better.name} received $${winnings}`);
  } else {
    console.log("Bet lost.");
  }
  bet.status = "inactive";
}

function getStudentById(id) {
  return students.find((s) => s.id === id) || null;
}

function getBetterById(id) {
  return betters.find((b) => b.id === id) || null;
}

function getBetsForCurrentUser() {
  if (!currentUser) return [];
  return bets.filter((b) => b.betterId === currentUser.id);
}

function isBetter() {
  return userType === "better";
}

function isOrganizer() {
  return userType === "organizer";
}
