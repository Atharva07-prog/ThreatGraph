const alertsContainer =
    document.getElementById("alerts-container");


async function loadAlerts() {

    if (!alertsContainer) {
        return;
    }

    try {

        alertsContainer.innerHTML =
            "<p>Loading security alerts...</p>";


        const response =
            await fetch("/api/alerts");


        if (!response.ok) {

            throw new Error(
                "Failed to load alerts"
            );

        }


        const data =
            await response.json();


        alertsContainer.innerHTML = "";


        if (data.alerts.length === 0) {

            alertsContainer.innerHTML =
                "<p>No active alerts found.</p>";

            return;

        }


        data.alerts.forEach(alert => {

            const alertCard =
                document.createElement("div");


            alertCard.classList.add(
                "alert-card"
            );


            const severity =
                alert.severity
                    ? alert.severity.toLowerCase()
                    : "medium";


            alertCard.innerHTML = `

                <div class="alert-card-icon">
                    ⚠
                </div>


                <div class="alert-card-details">

                    <h3>
                        ${alert.name || "Unknown Alert"}
                    </h3>


                    <p>
                        ${alert.description ||
                        "No description available."}
                    </p>

                </div>


                <div class="alert-card-info">

                    <span class="severity ${severity}">
                        ${alert.severity || "Medium"}
                    </span>

                    <p>
                        Status: ${alert.status || "Unknown"}
                    </p>

                </div>

            `;


            alertsContainer.appendChild(
                alertCard
            );

        });


    } catch (error) {

        console.error(error);


        alertsContainer.innerHTML = `

            <p class="graph-error">

                Failed to load security alerts.

            </p>

        `;

    }

}


/* Refresh Alerts */

const refreshAlertsButton =
    document.getElementById(
        "refresh-alerts-btn"
    );


if (refreshAlertsButton) {

    refreshAlertsButton.addEventListener(
        "click",
        function () {

            loadAlerts();

        }
    );

}


/* Load alerts when page opens */

loadAlerts();