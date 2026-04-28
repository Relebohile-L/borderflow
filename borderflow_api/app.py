from flask import Flask
from flask_cors import CORS
import os
from routes.sync_control import sync_control_bp
from routes.auth import auth_bp
from routes.resources import resources_bp

app = Flask(__name__)
CORS(app)
app.register_blueprint(sync_control_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(resources_bp)

SITE = os.getenv("SITE")

@app.route("/")
def home():
    return {"status": f"{SITE} API running"}

if SITE == "sa":
    from routes.trip_sa import trip_sa_bp
    from routes.incident_sa import incident_sa_bp
    from routes.milestone_sa import milestone_sa_bp
    from routes.handover_sa import handover_sa_bp
    from routes.clearance_sa import clearance_sa_bp
    from routes.client_sa import client_sa_bp
    app.register_blueprint(trip_sa_bp)
    app.register_blueprint(incident_sa_bp)
    app.register_blueprint(milestone_sa_bp)
    app.register_blueprint(handover_sa_bp)
    app.register_blueprint(clearance_sa_bp)
    app.register_blueprint(client_sa_bp)

elif SITE == "moz":
    from routes.trip_moz import trip_moz_bp
    from routes.incident_moz import incident_moz_bp
    from routes.milestone_moz import milestone_moz_bp
    from routes.handover_moz import handover_moz_bp
    from routes.clearance_moz import clearance_moz_bp
    from routes.client_moz import client_moz_bp
    app.register_blueprint(milestone_moz_bp)
    app.register_blueprint(trip_moz_bp)
    app.register_blueprint(incident_moz_bp)
    app.register_blueprint(handover_moz_bp)
    app.register_blueprint(clearance_moz_bp)
    app.register_blueprint(client_moz_bp)

elif SITE == "mru":
    from routes.trip_mru import trip_mru_bp
    from routes.incident_mru import incident_mru_bp
    from routes.milestone_mru import milestone_mru_bp
    from routes.handover_mru import handover_mru_bp
    from routes.clearance_mru import clearance_mru_bp
    from routes.client_mru import client_mru_bp
    app.register_blueprint(milestone_mru_bp)
    app.register_blueprint(trip_mru_bp)
    app.register_blueprint(incident_mru_bp)
    app.register_blueprint(handover_mru_bp)
    app.register_blueprint(clearance_mru_bp)
    app.register_blueprint(client_mru_bp)
    



# Add this section to start the server
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    host = os.environ.get("HOST", "0.0.0.0")
    debug = os.environ.get("DEBUG", "False").lower() == "true"
    
    app.run(host=host, port=port, debug=debug)