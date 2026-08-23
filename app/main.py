from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.database import verify_connection, get_driver


app = FastAPI(
    title="ThreatGraph API",
    description="Graph-Based Threat Intelligence API",
    version="1.0.0"
)


app.mount(
    "/static",
    StaticFiles(directory="app/static"),
    name="static"
)


@app.get("/")
def home():
    return FileResponse("app/static/index.html")


@app.get("/investigation")
def investigation_page():
    return FileResponse("app/static/investigation.html")

@app.get("/investigation-result")
def investigation_result_page():
    return FileResponse("app/static/investigation-result.html")

@app.get("/graph-explorer")
def graph_explorer_page():
    return FileResponse("app/static/graph-explorer.html")

@app.get("/alert")
def alerts_page():
    return FileResponse("app/static/alert.html")
    

@app.get("/verify-connection")
def verify_db_connection():
    if verify_connection():
        return {
            "message": "Database connection successful."
        }

    raise HTTPException(
        status_code=500,
        detail="Database connection failed."
    )


@app.get("/test-db")
def test_db():
    driver = get_driver()

    try:
        with driver.session() as session:
            result = session.run(
                "RETURN 'ThreatGraph connected to CognoDB!' AS message, 1 AS test"
            )

            record = result.single()

            if record and record["test"] == 1:
                return {
                    "message": record["message"]
                }

            raise HTTPException(
                status_code=500,
                detail="Database connection test failed."
            )

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection error: {str(error)}"
        )


@app.get("/api/stats")
def get_stats():
    driver = get_driver()

    try:
        with driver.session() as session:

            result = session.run("""
                MATCH (n)
                RETURN count(n) AS total_entities
            """)
            total_entities = result.single()["total_entities"]

            result = session.run("""
                MATCH (d:Device)
                RETURN count(d) AS devices
            """)
            devices = result.single()["devices"]

            result = session.run("""
                MATCH (a:Alert)
                WHERE a.status = 'Open'
                RETURN count(a) AS alerts
            """)
            alerts = result.single()["alerts"]

            result = session.run("""
                MATCH ()-[r]->()
                RETURN count(r) AS relationships
            """)
            relationships = result.single()["relationships"]

            return {
                "total_entities": total_entities,
                "devices": devices,
                "alerts": alerts,
                "relationships": relationships
            }
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )    

@app.get("/api/graph")
def get_graph():
    driver = get_driver()

    try:
        with driver.session() as session:

            result = session.run("""
                MATCH (source)-[relationship]->(target)

                RETURN
                    id(source) AS source_id,
                    labels(source)[0] AS source_label,
                    source.name AS source_name,

                    id(target) AS target_id,
                    labels(target)[0] AS target_label,
                    target.name AS target_name,

                    type(relationship) AS relationship
            """)

            nodes = {}
            relationships = []

            for record in result:

                source_id = str(record["source_id"])
                target_id = str(record["target_id"])

                nodes[source_id] = {
                    "id": source_id,
                    "label": record["source_label"],
                    "name": record["source_name"] or source_id
                }

                nodes[target_id] = {
                    "id": target_id,
                    "label": record["target_label"],
                    "name": record["target_name"] or target_id
                }

                relationships.append({
                    "source": source_id,
                    "target": target_id,
                    "type": record["relationship"]
                })

            return {
                "nodes": list(nodes.values()),
                "relationships": relationships
            }

               

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@app.get("/api/investigate/{search_value}")
def investigate(search_value: str):

    driver = get_driver()

    try:
        with driver.session() as session:

            result = session.run(
                """
                MATCH (n)
                WHERE toLower(n.name) CONTAINS toLower($search_value)
                   OR toLower(n.ip) CONTAINS toLower($search_value)

                OPTIONAL MATCH (n)-[r]-(connected)

                RETURN
                    n,
                    type(r) AS relationship,
                    connected
                """,
                search_value=search_value
            )

            results = []

            for record in result:

                node = record["n"]
                connected = record["connected"]

                item = {
                    "entity": dict(node),
                    "relationship": record["relationship"],
                    "connected_entity": (
                        dict(connected) if connected else None
                    )
                }

                results.append(item)

            if not results:
                raise HTTPException(
                    status_code=404,
                    detail="No threat intelligence found."
                )

            return {
                "search": search_value,
                "results": results
            }


    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )       


@app.get("/api/alerts")
def get_alerts():

    driver = get_driver()

    try:

        with driver.session() as session:

            result = session.run("""
                MATCH (a:Alert)

                RETURN
                    a.name AS name,
                    a.description AS description,
                    a.severity AS severity,
                    a.status AS status
            """)

            alerts = []

            for record in result:

                alerts.append({
                    "name": record["name"],
                    "description": record["description"],
                    "severity": record["severity"],
                    "status": record["status"]
                })

            return {
                "alerts": alerts
            }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )        