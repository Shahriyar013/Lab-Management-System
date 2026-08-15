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


//START MENU

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
            console.log("Invalid choice! please enter valid choice");
            start();
        }
    });
}


//SIGN UP

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


//STUDENT LOGIN

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

//STUDENT MENU

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

// Admin Login
function adminLogin() {

    console.log("\n=== ADMIN LOGIN ===");

    rl.question("Username: ", username => {
        rl.question("Password: ", password => {

            if (username === "Admin" && password === "1234") {
                adminModule.adminMenu();
            } else {
                console.log("Invalid admin login!");
                start();
            }
        });
    });
}



//SUBMIT COMPLAINT

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

//MY COMPLAINTS

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

function adminMenu() {

    console.log("\n=== ADMIN PANEL ===");
    console.log("1. View All Complaints");
    console.log("2. View Pending Complaints");
    console.log("3. Update Complaint");
    console.log("4. Logout");
    console.log("5. Exit");

    rl.question("Choice: ", (choice) => {

        switch (choice.trim()) {

            case "1":
                viewAll();
                break;

            case "2":
                viewPending();
                break;

            case "3":
                updateComplaint();
                break;

            case "4":
                start();
                break;

            case "5":
                rl.close();
                break;

            default:
                console.log("Invalid choice! Please Enter Valid choice");
                adminMenu();
        }
    });
}






//ALL COMPLAINTS

function viewAll() {

    const complaints = read(COMPLAINT_FILE);

    console.log("\n=== ALL COMPLAINTS ===");

    if (complaints.length === 0) {
        console.log("No complaints.");
    } else {
        complaints.forEach(showComplaint);
    }

    rl.question("\nPress Enter to continue...", () => {
        adminMenu();
    });
}

function showComplaint(c) {

    console.log("-----------------------");
    console.log("ID:", c.id);
    console.log("Student:", c.studentId);
    console.log("Room:", c.room);
  
    
    console.log("Problem:", c.problem);
    console.log("Priority:", c.priority);
    console.log("Status:", c.status);
}


//PENDING COMPLAINTS

function viewPending() {

    const complaints = read(COMPLAINT_FILE).filter(
        c => c.status === "Pending"
    );

    console.log("\n=== PENDING COMPLAINTS ===");

    if (complaints.length === 0) {
        console.log("No pending complaints.");
    } else {
        complaints.forEach(showComplaint);
    }

    rl.question("\nPress Enter to continue...", () => {
        adminMenu();
    });
}

//UPDATE COMPLAINT 

function updateComplaint() {

    const complaints = read(COMPLAINT_FILE);

    console.log("\n=== UPDATE COMPLAINT ===");

    rl.question("Enter Complaint ID: ", (id) => {

        id = id.trim();

        const complaint = complaints.find(
            c => c.id.toUpperCase() === id.toUpperCase()
        );

        if (!complaint) {
            console.log("Complaint not found!");
            return adminMenu();
        }

        console.log("\nCurrent Status:", complaint.status);

        console.log("\n1. Pending");
        console.log("2. In Progress");
        console.log("3. Solved");

        rl.question("New Status: ", (choice) => {

            choice = choice.trim();

            let status;

            if (choice === "1") {
                status = "Pending";
            }
            else if (choice === "2") {
                status = "In Progress";
            }
            else if (choice === "3") {
                status = "Solved";
            }
            else {
                console.log("Invalid choice!");
                return adminMenu();
            }

            complaint.status = status;

            save(COMPLAINT_FILE, complaints);

            console.log(
                "\nComplaint updated successfully!"
            );

            console.log(
                "New Status:",
                complaint.status
            );

            rl.question(
                "\nPress Enter to continue...",
                () => {
                    adminMenu();
                }
            );
        });
    });
}

//  START PROGRAM 

start();
