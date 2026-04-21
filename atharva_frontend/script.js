function goTo(page) {
    window.location.href = page;
}

function logout() {
    window.location.href = "login.html";
}

function updateStats() {
    let sales = JSON.parse(localStorage.getItem("sales")) || [];

    let totalSales = sales.length;
    let totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);

    document.getElementById("totalSales").innerText = totalSales;
    document.getElementById("totalRevenue").innerText = "₹ " + totalRevenue;
}

window.onload = updateStats;

function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    // Simple login (you can change this)
    if (username === "admin" && password === "1234") {
        alert("Login Successful ✅");
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid Username or Password ❌");
    }
}

// TIME
function updateTime() {
    let now = new Date();
    document.getElementById("time").innerText = now.toLocaleTimeString();
}
setInterval(updateTime, 1000);

// STATS
function updateStats() {
    let sales = JSON.parse(localStorage.getItem("sales")) || [];

    let totalSales = sales.length;
    let totalRevenue = sales.reduce((sum, s) => sum + Number(s.total || 0), 0);

    document.getElementById("totalSales").innerText = totalSales;
    document.getElementById("totalRevenue").innerText = "₹ " + totalRevenue;
}

// CHART
function loadChart() {
    let ctx = document.getElementById("salesChart");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [
                {
                    label: "Petrol",
                    data: [10, 20, 15, 25, 30, 28, 35],
                    borderColor: "#00A651",
                    fill: false
                },
                {
                    label: "Diesel",
                    data: [15, 18, 22, 20, 27, 30, 32],
                    borderColor: "#FFD500",
                    fill: false
                }
            ]
        }
    });
}

window.onload = function () {
    updateStats();
    loadChart();
};



function showSection(sectionId) {

    // hide all sections
    let sections = document.querySelectorAll(".section");
    sections.forEach(sec => sec.style.display = "none");

    // show selected section
    document.getElementById(sectionId).style.display = "block";

    // remove active class
    let menus = document.querySelectorAll(".sidebar li");
    menus.forEach(m => m.classList.remove("active"));

    // add active class
    document.getElementById("menu-" + sectionId).classList.add("active");
}