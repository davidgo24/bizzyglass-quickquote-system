# test_db_connection.py
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv



# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("Error: DATABASE_URL environment variable not set.")
else:
    print(f"Attempting to connect to: {DATABASE_URL.split('@')[1].split('?')[0]}") # Print host/port/db for verification
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as connection:
            # Test by fetching current database name
            result = connection.execute(text("SELECT current_database();")).scalar()
            print(f"Successfully connected to database: {result}")

            # Test by listing tables to see if 'leads' or 'alembic_version' exist
            print("\nTables in the connected database:")
            tables_query = text("""
                SELECT tablename FROM pg_tables
                WHERE schemaname = 'public';
            """)
            tables = connection.execute(tables_query).fetchall()
            if tables:
                for table in tables:
                    print(f"- {table[0]}")
            else:
                print("No tables found in 'public' schema.")

    except SQLAlchemyError as e:
        print(f"Database connection failed: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")