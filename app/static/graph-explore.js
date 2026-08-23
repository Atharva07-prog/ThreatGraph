const graphExplorerContainer =
    document.getElementById("graph-explorer-container");


async function loadGraphExplorer() {

    if (!graphExplorerContainer) {
        return;
    }

    try {

        graphExplorerContainer.innerHTML =
            "<p>Loading threat graph...</p>";


        const response =
            await fetch("/api/graph");


        if (!response.ok) {

            throw new Error(
                "Failed to load graph data"
            );

        }


        const data =
            await response.json();


        graphExplorerContainer.innerHTML = "";


        const positions = [

            { x: 10, y: 20 },
            { x: 30, y: 20 },
            { x: 50, y: 20 },
            { x: 70, y: 20 },

            { x: 20, y: 60 },
            { x: 45, y: 60 },
            { x: 70, y: 60 }

        ];


        data.nodes.forEach((node, index) => {

            const graphNode =
                document.createElement("div");


            graphNode.classList.add(
                "graph-explorer-node"
            );


            if (node.label === "Alert") {

                graphNode.classList.add(
                    "alert"
                );

            }


            const position =
                positions[
                    index % positions.length
                ];


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

                <div class="node-icon">
                    ${icon}
                </div>

                <span>
                    ${node.label}
                </span>

                <small>
                    ${node.name}
                </small>

            `;


            graphExplorerContainer.appendChild(
                graphNode
            );

        });


    } catch (error) {

        console.error(error);


        graphExplorerContainer.innerHTML = `

            <p class="graph-error">

                Failed to load threat graph.

            </p>

        `;

    }

}


/* Refresh Graph Button */

const reloadGraphButton =
    document.getElementById(
        "reload-graph-btn"
    );


if (reloadGraphButton) {

    reloadGraphButton.addEventListener(
        "click",
        function () {

            loadGraphExplorer();

        }
    );

}


/* Load graph once when page opens */

document.addEventListener("DOMContentLoaded", function () {

    loadGraphExplorer();

});