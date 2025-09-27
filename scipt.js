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
            id: 1,
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

    if (!currentUser) {
        throw new Error("No user logged in");
    }

    if (amount > currentUser.money) {
        throw new Error("Insufficient funds");
    }
    
    if (!students.find(s => s.id === betOnId)) {
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
        date: new Date().toLocaleDateString()
    }

    currentUser.money -= amount;
    bets.push(newBet);
    console.log("Bet placed successfully");
}