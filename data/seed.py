from app.database import get_driver

def seed_database():
    driver = get_driver()

    with driver.session() as session:
         # Remove old sample data
        session.run("MATCH (n) DETACH DELETE n")
        
        # Create sample threat graph
        session.run("""
        CREATE
        (attacker:Attacker {
            name: "APT-29",
            type: "Threat Actor",
            risk: "Critical"
        }),

        (phishing:Technique {
            name: "Spear Phishing",
            mitre_id: "T1566"
        }),

        (email:Indicator {
            value: "malicious@example.com",
            type: "Email"
        }),

        (device1:Device {
            name: "FINANCE-PC-01",
            ip: "192.168.1.15",
            status: "Compromised"
        }),

        (device2:Device {
            name: "HR-LAPTOP-07",
            ip: "192.168.1.22",
            status: "Suspicious"
        }),

        (user:User {
            name: "john.smith",
            department: "Finance"
        }),

        (alert:Alert {
            title: "Suspicious PowerShell Activity",
            severity: "High",
            status: "Open"
        }),

        (attacker)-[:USES]->(phishing),
        (attacker)-[:ASSOCIATED_WITH]->(email),
        (phishing)-[:TARGETS]->(user),
        (email)-[:DELIVERED_TO]->(user),
        (user)-[:USES]->(device1),
        (user)-[:USES]->(device2),
        (device1)-[:TRIGGERED]->(alert)
        """)

    print("ThreatGraph sample data created successfully!")


if __name__ == "__main__":
    seed_database()