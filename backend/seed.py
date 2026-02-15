import sys
import os
import random
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(__file__))

from database import Base, SessionLocal, engine
from models import AuditLog, User
from auth import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

SEED_USERS = [
    {"username": "admin",     "email": "admin@demo.com", "password": "Admin1234!", "role": "admin"},
    {"username": "moderator", "email": "mod@demo.com",   "password": "Mod1234!",   "role": "moderator"},
    {"username": "demouser",  "email": "user@demo.com",  "password": "User1234!",  "role": "user"},
]

ACTIONS   = ["LOGIN", "LOGIN", "LOGIN", "FAILED_LOGIN", "FAILED_LOGIN", "REGISTER", "LOGOUT", "LOCKED"]
STATUSES  = {"LOGIN": "SUCCESS", "REGISTER": "SUCCESS", "LOGOUT": "SUCCESS",
             "FAILED_LOGIN": "FAILED", "LOCKED": "FAILED"}
EMAILS    = ["admin@demo.com", "mod@demo.com", "user@demo.com",
             "attacker@evil.com", "test@example.com"]
IPS       = ["192.168.1.1", "10.0.0.42", "172.16.0.5", "203.0.113.99", "198.51.100.12"]


# Create seed users
for u in SEED_USERS:
    existing = db.query(User).filter(User.email == u["email"]).first()
    if existing:
        print(f"[SKIP] User already exists: {u['email']}")
    else:
        user = User(
            username=u["username"],
            email=u["email"],
            hashed_password=hash_password(u["password"]),
            role=u["role"],
        )
        db.add(user)
        db.commit()
        print(f"[CREATE] User created: {u['email']} ({u['role']})")


# Seed 20 varied audit log entries spanning last 7 days
now = datetime.now(timezone.utc)
for i in range(20):
    action = random.choice(ACTIONS)
    status = STATUSES[action]
    timestamp = now - timedelta(
        days=random.randint(0, 6),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
    )
    log = AuditLog(
        email=random.choice(EMAILS),
        ip_address=random.choice(IPS),
        action=action,
        status=status,
        user_agent="Mozilla/5.0 (seed data)",
        timestamp=timestamp,
    )
    db.add(log)

db.commit()
print(f"[CREATE] 20 fake audit log entries seeded")
print("\n[DONE] Database seeding complete.")
print("\nDemo credentials:")
for u in SEED_USERS:
    print(f"  {u['role']:12} — {u['email']} / {u['password']}")

db.close()
