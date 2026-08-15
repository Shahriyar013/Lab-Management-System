const fs = require("fs");
const readline = require("readline");
const crypto = require("crypto");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const USER_FILE = "users.json";
const COMPLAINT_FILE = "complaints.json";
let currentUser = null;
function hashPassword(password) {
    return crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
}



const read = file =>
    JSON.parse(fs.readFileSync(file, "utf8"));

const save = (file, data) =>
    fs.writeFileSync(file, JSON.stringify(data, null, 2));


// ===== START MENU =====

function start() {
    console.log("\n=== UNIVERSITY LAB MANAGEMENT ===");
    console.log("1. Student Sign Up");
    console.log("2. Student Login");
    console.log("3. Admin Login");
    console.log("4. Exit");

    rl.question("Choice: ", choice => {

        if (choice === "1") signup();
        else if (choice === "2") login();
        else if (choice === "3") adminLogin();
        else if (choice === "4") rl.close();
        else {
            console.log("Invalid choice!");
            start();
        }
    });
}


// ===== SIGN UP =====

function signup() {
    const users = read(USER_FILE);

    console.log("\n=== SIGN UP ===");

    rl.question("Name: ", name => {
        rl.question("Student ID: ", id => {
            rl.question("Email: ", email => {
                rl.question("Password: ", password => {

                    if (!name || !id || !email || !password) {
                        console.log("All fields are required!");
                        return start();
                    }

                    if (users.some(u => u.id === id)) {
                        console.log("Student ID already exists!");
                        return start();
                    }

                    users.push({
                     name,
                     id,
                    email,
                    password: hashPassword(password)
                    });
                    save(USER_FILE, users);

                    console.log("Account created successfully!");
                    start();
                });
            });
        });
    });
}


// ===== STUDENT LOGIN =====

function login() {
    const users = read(USER_FILE);

    console.log("\n=== STUDENT LOGIN ===");

    rl.question("Student ID: ", id => {
        rl.question("Password: ", password => {

           currentUser = users.find(u =>
        u.id === id &&
        u.password === hashPassword(password)
);

            if (!currentUser) {
                console.log("Invalid login!");
                return start();
            } 

            console.log(`Welcome ${currentUser.name}!`);
            studentMenu();
        });
    });
}







// ===== STUDENT MENU =====

function studentMenu() {

    console.log("\n=== STUDENT PANEL ===");
    console.log("1. Submit Complaint");
    console.log("2. View My Complaints");
    console.log("3. Logout");
    console.log("4. Exit");

    rl.question("Choice: ", choice => {

        if (choice === "1") submitComplaint();
        else if (choice === "2") myComplaints();
        else if (choice === "3") {
            currentUser = null;
            start();
        }
        else if (choice === "4") rl.close();
        else {
            console.log("Invalid choice!");
            studentMenu();
        }
    });
}


// ===== SUBMIT COMPLAINT =====

function submitComplaint() {

    const complaints = read(COMPLAINT_FILE);

    console.log("\n=== SUBMIT COMPLAINT ===");

    rl.question("Room Number: ", room => {

        rl.question("Component Name: ", component => {

            rl.question("Component ID: ", componentId => {

                rl.question("Problem Description: ", problem => {

                    console.log("\nProblem Priority:");
                    console.log("1. Low");
                    console.log("2. Medium");
                    console.log("3. High");

                    rl.question("Select Priority: ", choice => {

                        const priorities = [
                            "Low",
                            "Medium",
                            "High"
                        ];

                        const priority =
                            priorities[Number(choice) - 1];

                        if (
                            !room.trim() ||
                            !component.trim() ||
                            !componentId.trim() ||
                            !problem.trim() ||
                            !priority
                        ) {
                            console.log(
                                "\nInvalid input!"
                            );

                            return studentMenu();
                        }

                        const complaint = {

                            id:
                                "C" +
                                String(
                                    complaints.length + 1
                                ).padStart(3, "0"),

                            studentId:
                                currentUser.id,

                            room: room,

                            component: component,

                            componentId: componentId,

                            problem: problem,

                            priority: priority,

                            status: "Pending",

                            date:
                                new Date().toLocaleString()
                        };

                        complaints.push(complaint);

                        save(
                            COMPLAINT_FILE,
                            complaints
                        );

                        console.log(
                            "\nComplaint submitted successfully!"
                        );

                        console.log(
                            "Complaint ID:",
                            complaint.id
                        );

                        studentMenu();
                    });
                });
            });
        });
    });
}

// ===== MY COMPLAINTS =====

function myComplaints() {

    const complaints = read(COMPLAINT_FILE).filter(
        c => c.studentId === currentUser.id
    );

    console.log("\n=== MY COMPLAINTS ===");

    if (complaints.length === 0) {
        console.log("No complaints found.");
    } else {

        complaints.forEach(c => {
            console.log("\n-----------------------");
            console.log("ID:", c.id);
            console.log("Room:", c.room);
            console.log("Problem:", c.problem);
            console.log("Priority:", c.priority);
            console.log("Status:", c.status);
            console.log("Date:", c.date);
        });
    }

    rl.question("\nPress Enter to return to menu...", () => {
        studentMenu();
    });
}



// ===== START PROGRAM =====

start();
