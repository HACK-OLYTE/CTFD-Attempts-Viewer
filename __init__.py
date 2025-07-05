from flask import Blueprint, render_template, jsonify, request
from CTFd.plugins import register_plugin_assets_directory, register_plugin_script
from CTFd.models import db
from CTFd.utils.decorators import authed_only, admins_only
from CTFd.utils.user import get_current_user, get_current_team
from sqlalchemy.sql import text

# --- Nouveau modèle dédié ---
class AttemptsViewerSettings(db.Model):
    __tablename__ = "attempts_viewer_settings"
    id = db.Column(db.Integer, primary_key=True)
    show_main_button = db.Column(db.Boolean, default=False)

def load(app):
    viewer_bp = Blueprint(
        'ctfd_attempts_viewer',
        __name__,
        template_folder='templates',
        static_folder='assets',
        url_prefix='/plugins/ctfd-attempts-viewer'
    )

    # --- Initialisation table et config par défaut ---
    with app.app_context():
        #AttemptsViewerSettings.__table__.drop(db.engine)
        db.create_all()
        settings = AttemptsViewerSettings.query.first()
        if not settings:
            settings = AttemptsViewerSettings(show_main_button=False)
            db.session.add(settings)
            db.session.commit()

    @viewer_bp.route('/admin')
    @admins_only
    def admin_page():
        return render_template('ctfd_attempts_viewer_admin.html')

    @viewer_bp.route('/admin/save', methods=['POST'])
    @admins_only
    def save_admin_settings():
        data = request.get_json()

        settings = AttemptsViewerSettings.query.first()
        if not settings:
            settings = AttemptsViewerSettings()

        settings.show_main_button = data.get('show_main_button', False)

        db.session.add(settings)
        db.session.commit()

        return jsonify({'success': True})

    @viewer_bp.route('/api/settings', methods=['GET'])
    @admins_only
    def get_settings():
        settings = AttemptsViewerSettings.query.first()
        if not settings:
            return jsonify({'show_main_button': False})

        return jsonify({
            'show_main_button': settings.show_main_button
        })

    @viewer_bp.route('/attempts')
    @authed_only
    def attempts_page():
        return render_template('ctfd_attempts_viewer_attempts.html')

    @viewer_bp.route('/api/my-team-submissions')
    @authed_only
    def team_submissions():
        user = get_current_user()
        team = get_current_team()

        if not user or not team:
            return jsonify({
                "success": False,
                "data": [],
                "error": "Utilisateur non connecté ou non membre d'une équipe"
            }), 403

        sql = text("""
            SELECT
                submissions.challenge_id,
                submissions.provided,
                submissions.type,
                submissions.date,
                challenges.name AS challenge_name,
                users.name AS user_name
            FROM submissions
            JOIN challenges ON submissions.challenge_id = challenges.id
            JOIN users ON submissions.user_id = users.id
            WHERE submissions.team_id = :team_id
        """)

        rows = db.session.execute(sql, {"team_id": team.id}).fetchall()

        data = [{
            "challenge_id": row.challenge_id,
            "challenge_name": row.challenge_name,
            "submission": row.provided,
            "type": row.type,
            "date": row.date.strftime('%Y-%m-%d %H:%M:%S'),
            "user_name": row.user_name
        } for row in rows]

        return jsonify({"success": True, "data": data})

    # Plugin registration
    app.register_blueprint(viewer_bp)

    register_plugin_assets_directory(app, base_path='/plugins/ctfd-attempts-viewer/assets')
    register_plugin_script('/plugins/ctfd-attempts-viewer/assets/settings.js')
