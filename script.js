let currentUser = null;
let betters = [];
let students = [];
let organizers = [];
let bets = [];
let groups = [];
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
      groupsResponse,
    ] = await Promise.all([
      fetch(`${API_BASE}/better`),
      fetch(`${API_BASE}/students`),
      fetch(`${API_BASE}/bets`),
      fetch(`${API_BASE}/organizers`),
      fetch(`${API_BASE}/groups`),
    ]);

    betters = bettersResponse.ok ? await bettersResponse.json() : [];
    students = studentsResponse.ok ? await studentsResponse.json() : [];
    bets = betsResponse.ok ? await betsResponse.json() : [];
    organizers = organizersResponse.ok ? await organizersResponse.json() : [];
    groups = groupsResponse.ok ? await groupsResponse.json() : [];

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

async function createGroup(student1, student2) {
  const student1Exists = getStudentById(student1);
  const student2Exists = getStudentById(student2);

  if (!student1Exists || !student2Exists) {
    throw new Error("One or both students not found");
  }

  if (student1 === student2) {
    throw new Error("Cannot create group with the same student");
  }

  let newGroup = {
    id: groups.length + 1,
    student1Id: student1,
    student2Id: student2,
    poolMoney: 0,
    active_status: true,
  };

  try {
    const response = await fetch(`${API_BASE}/groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newGroup),
    });

    if (response.ok) {
      const savedGroup = await response.json();
      newGroup = savedGroup;
    }
  } catch (error) {
    console.error("Error saving group to server:", error);
  }

  groups.push(newGroup);
  console.log("Group created successfully");
}

async function placeBet(groupId, betOnId, amount) {
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

  const group = getGroupById(groupId);
  if (!group) {
    throw new Error("Group not found");
  }

  let newBet = {
    id: bets.length + 1,
    betterId: currentUser.id,
    groupId: groupId,
    betOnId: betOnId,
    amount: amount,
    active_status: true,
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

  const newPoolMoney = group.poolMoney + amount;
  try {
    await fetch(`${API_BASE}/groups/${groupId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ poolMoney: newPoolMoney }),
    });
  } catch (error) {
    console.error("Error updating group pool money:", error);
  }

  currentUser.money -= amount;
  group.poolMoney += amount;

  bets.push(newBet);
  console.log("Bet placed successfully");
}

function resolveBet(groupId, betId, winningId) {
  let bet = getBetById(betId);
  if (!bet) throw new Error("Bet not found");

  let group = getGroupById(groupId);
  if (!group) throw new Error("Group not found");

  if (bet.groupId !== groupId) {
    throw new Error("Bet does not belong to this group");
  }

  if (!bet.active_status) {
    throw new Error("Bet is not active");
  }

  let better = getBetterById(bet.betterId);
  if (!better) throw new Error("Better not found");

  if (bet.betOnId === winningId) {
    let winnings = bet.amount * 2;
    better.money += winnings;

    console.log(`Bet won! ${better.name} received $${winnings}`);
  } else {
    console.log("Bet lost.");
  }

  try {
    fetch(`${API_BASE}/groups/${groupId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active_status: false }),
    });
    fetch(`${API_BASE}/bets/${betId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active_status: false }),
    });
  } catch (error) {
    console.error("Error updating group or bet status:", error);
  }
  try {
    fetch(`${API_BASE}/betters/${bet.betterId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ money: better.money }),
    });
  } catch (error) {
    console.error("Error updating better's money:", error);
  }
}

function getStudentById(id) {
  return students.find((s) => s.id === id) || null;
}

function getBetterById(id) {
  return betters.find((b) => b.id === id) || null;
}

function getGroupById(id) {
  return groups.find((g) => g.id === id) || null;
}

function getBetById(id) {
  return bets.find((b) => b.id === id) || null;
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
