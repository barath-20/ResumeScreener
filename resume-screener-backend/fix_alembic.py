from app import create_app, db


def clear_alembic_version() -> None:
    app = create_app()
    with app.app_context():
        conn = db.engine.connect()
        trans = conn.begin()
        try:
            # Ensure alembic_version table exists
            conn.execute(db.text(
                """
                CREATE TABLE IF NOT EXISTS alembic_version (
                    version_num VARCHAR(32) NOT NULL
                )
                """
            ))
            # Clear any existing revision rows
            conn.execute(db.text("DELETE FROM alembic_version"))
            trans.commit()
            print("Cleared alembic_version successfully.")
        except Exception as exc:
            trans.rollback()
            print(f"Failed to clear alembic_version: {exc}")
            raise
        finally:
            conn.close()


if __name__ == "__main__":
    clear_alembic_version()


