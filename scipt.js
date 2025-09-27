let currentUser = null;
let betters = [];
let students = [];
let bets = [];

function initApp() {
    loadInitialData();
}

function loadInitialData() {
    students = [
        {
            id: 1,
            username: "alice123",
            name: "Alice",
            school: "SFU",
            major: "Computer Science"
        }
    ]
    betters = [
        {
            id: 1,let currentUser = null;
let students = [];
let bets = [];

function initApp() {
    loadInitialData();
}

function loadInitialData() {
    students = [
        {
            id: 1,
            username: "alice123",
            name: "Alice",
            money: 100
        }
    ]
}

function loginUser(username){
    let user = students.find(s => s.username.toLowerCase() === username.toLowerCase());
    currentUser = user || null;
}

function placeBet(betOnId, amount){
    let newBet = {
        id: bets.length + 1,
        betterId: currentUser.id,
        betOnId: betOnId,
        amount: amount,
        status: "active"
    }

    currentUser.money -= amount;
    bets.push(newBet);
}
            username: "bob456",
            name: "Bob",
            money: 150
        }
    ]
}

function loginUser(username){
    let user = betters.find(s => s.username.toLowerCase() === username.toLowerCase());
    currentUser = user || null;
}

function placeBet(betOnId, amount){
    let newBet = {
        id: bets.length + 1,
        betterId: currentUser.id,
        betOnId: betOnId,
        amount: amount,
        status: "active"
    }

    currentUser.money -= amount;
    bets.push(newBet);
}
