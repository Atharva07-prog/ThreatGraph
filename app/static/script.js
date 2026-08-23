async function checkDatabase() {
    const statusElement = document.getElementById("db-status");

    try {
        const response = await fetch("/verify-connection");

        if (response.ok) {
            statusElement.textContent = "Connected";
        } else {
            statusElement.textContent = "Disconnected";
        }

    } catch (error) {
        statusElement.textContent = "Disconnected";
        console.error(error);
    }
}

async function loadStats() {
    try {
        const response = await fetch("/api/stats");

        if (!response.ok) {
            throw new Error("Failed to load statistics");
        }

        const data = await response.json();

        document.getElementById("total-entities").textContent =
            data.total_entities;

        document.getElementById("device-count").textContent =
            data.devices;

        document.getElementById("alert-count").textContent =
            data.alerts;

        document.getElementById("relationship-count").textContent =
            data.relationships;

    } catch (error) {
        console.error("Error loading stats:", error);
    }
}
async function loadGraph() {

    const graphContainer =
        document.querySelector(".graph-placeholder");

    try {

        const response = await fetch("/api/graph");

        if (!response.ok) {
            throw new Error("Failed to load graph");
        }

        const data = await response.json();

        graphContainer.innerHTML = "";

        const positions = [
    { x: 8, y: 20 },
    { x: 21, y: 20 },
    { x: 34, y: 20 },
    { x: 46, y: 20 },
    { x: 58, y: 20 },
    { x: 70, y: 20 },
    { x: 82, y: 20 }
];

        data.nodes.forEach((node, index) => {

            const graphNode =
                document.createElement("div");

            graphNode.classList.add("graph-node");

            if (node.label === "Alert") {
                graphNode.classList.add("alert");
            }

            const position =
                positions[index % positions.length];

            graphNode.style.left =
                position.x + "%";

            graphNode.style.top =
                position.y + "%";

            let icon = "●";

            if (node.label === "User") {
                icon = "👤";
            }

            else if (node.label === "Device") {
                icon = "💻";
            }

            else if (node.label === "Indicator") {
                icon = "🌐";
            }

            else if (node.label === "Alert") {
                icon = "⚠";
            }

            else if (node.label === "Attacker") {
                icon = "🕵";
            }

            else if (node.label === "Technique") {
                icon = "🎯";
            }

            graphNode.innerHTML = `
                <div class="node-icon">${icon}</div>
                <span>${node.label}</span>
                <small>${node.name}</small>
            `;

            graphContainer.appendChild(graphNode);

        });

    } catch (error) {

        console.error(error);

        graphContainer.innerHTML = `
            <p class="graph-error">
                Failed to load graph data.
            </p>
        `;
    }
}


const refreshButton = document.getElementById("refresh-btn");

if (refreshButton) {

    refreshButton.addEventListener("click", function () {

        checkDatabase();
        loadStats();
        loadGraph();
        

        alert("ThreatGraph data refreshed!");
    });

}

const investigationButton =
    document.getElementById("investigate-search-btn");

if (investigationButton) {

    investigationButton.addEventListener("click", function () {

        const input =
            document.getElementById("investigation-input");

        const searchValue = input.value.trim();

        if (searchValue === "") {

            alert("Please enter something to investigate.");

            return;
        }

        window.location.href =
            `/investigation-result?search=${encodeURIComponent(searchValue)}`;
    });

}

const investigationDetails =
    document.getElementById("investigation-details");

if (investigationDetails) {

    async function loadInvestigationResult() {

        const params = new URLSearchParams(
            window.location.search
        );

        const searchValue = params.get("search");

        if (!searchValue) {

            investigationDetails.innerHTML =
                "<p>No investigation value provided.</p>";

            return;
        }

        try {

            const response = await fetch(
                `/api/investigate/${encodeURIComponent(searchValue)}`
            );

            const data = await response.json();

            if (!response.ok) {

                investigationDetails.innerHTML =
                    `<p>${data.detail}</p>`;

                return;
            }

            const firstResult = data.results[0];

            let html = `
                <h2>
                    ${firstResult.entity.name || "Unknown Entity"}
                </h2>

                <p>
                    <strong>Entity Type:</strong>
                    ${firstResult.entity.type || "Unknown"}
                </p>

                <hr>

                <h3>Connected Entities</h3>
            `;

            data.results.forEach(item => {

                if (item.connected_entity) {

                    html += `

                        <div class="connection-item">

                            <p>
                                <strong>Relationship:</strong>
                                ${item.relationship}
                            </p>

                            <p>
                                <strong>Connected Entity:</strong>
                                ${item.connected_entity.name || "Unknown"}
                            </p>

                        </div>

                    `;
                }

            });

            investigationDetails.innerHTML = html;

        } catch (error) {

            console.error(error);

            investigationDetails.innerHTML =
                "<p>Unable to load investigation details.</p>";

        }

    }

    loadInvestigationResult();

}    

    if (document.getElementById("db-status")) {
    checkDatabase();
}

if (document.getElementById("total-entities")) {
    loadStats();
}

if (document.querySelector(".graph-placeholder")) {
    loadGraph();
}


