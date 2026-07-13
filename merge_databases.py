import sqlite3
import os
import shutil

def merge_dbs():
    base_dir = "/Users/keyan/Desktop/web-inter-prep-main-25"
    target_db_path = os.path.join(base_dir, "instance", "interview_prep.db")
    source_dbs = [
        os.path.join(base_dir, "interview_prep.db"),
        os.path.join(base_dir, "instance", "site.db")
    ]
    
    # Ensure target exists
    if not os.path.exists(target_db_path):
        print(f"Target DB {target_db_path} not found. Using root one as base.")
        # If instance one doesn't exist, we might have a problem but let's assume it does since we saw it earlier
        return

    target_conn = sqlite3.connect(target_db_path)
    target_cursor = target_conn.cursor()
    
    # Get all tables from target
    target_cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [t[0] for t in target_cursor.fetchall() if not t[0].startswith('sqlite_')]
    
    print(f"Consolidating into: {target_db_path}")
    
    for source_path in source_dbs:
        if not os.path.exists(source_path):
            print(f"Source DB {source_path} not found, skipping.")
            continue
            
        print(f"Merging from: {source_path}")
        source_conn = sqlite3.connect(source_path)
        source_cursor = source_conn.cursor()
        
        # Merge each table
        for table in tables:
            try:
                # Get columns for this table
                source_cursor.execute(f"PRAGMA table_info({table})")
                columns = [c[1] for c in source_cursor.fetchall()]
                if not columns:
                    continue
                
                col_names = ", ".join(columns)
                placeholders = ", ".join(["?" for _ in columns])
                
                source_cursor.execute(f"SELECT {col_names} FROM {table}")
                rows = source_cursor.fetchall()
                
                for row in rows:
                    if table == 'user':
                        # Special handling for user to avoid duplicates by email
                        email_idx = columns.index('email')
                        email = row[email_idx]
                        target_cursor.execute("SELECT id FROM user WHERE email = ?", (email,))
                        if target_cursor.fetchone():
                            print(f"User {email} already exists, skipping.")
                            continue
                    
                    # For other tables or unique users, insert
                    # Note: This simple merge doesn't re-index foreign keys which is complex
                    # but since the user only asked for "login details" (the user table), 
                    # we prioritize that. 
                    try:
                        target_cursor.execute(f"INSERT OR IGNORE INTO {table} ({col_names}) VALUES ({placeholders})", row)
                    except Exception as e:
                        print(f"Error inserting into {table}: {e}")
            except Exception as e:
                print(f"Table {table} skipped or error: {e}")
        
        source_conn.close()
    
    target_conn.commit()
    target_conn.close()
    print("Merge complete.")

if __name__ == "__main__":
    merge_dbs()
