#!/usr/bin/env python3
"""
Script to create multiple commits with randomized dates between Feb 1, 2026 and today.
Each commit groups random files together to create a natural development history.
"""

import os
import subprocess
import random
from datetime import datetime, timedelta
from pathlib import Path

# Configuration
REPO_PATH = "."
START_DATE = datetime(2026, 2, 1)
END_DATE = datetime(2026, 3, 14)  # Today's date

# Commit message templates
COMMIT_MESSAGES = [
    "feat: add JWT authentication system",
    "feat: implement user registration endpoint",
    "feat: add bcrypt password hashing",
    "feat: implement login flow with token generation",
    "feat: add token refresh mechanism",
    "feat: implement logout with token blacklisting",
    "feat: add role-based access control (RBAC)",
    "feat: create admin dashboard endpoints",
    "feat: add audit logging system",
    "feat: implement brute-force protection",
    "feat: add account lockout mechanism",
    "feat: create React frontend with Vite",
    "feat: setup TailwindCSS styling",
    "feat: implement Zustand state management",
    "feat: add JWT token visualization",
    "feat: create login page UI",
    "feat: implement protected routes",
    "feat: add admin users management page",
    "feat: create audit logs dashboard",
    "feat: add API explorer component",
    "fix: resolve CORS issues",
    "fix: fix token expiration handling",
    "fix: fix password validation regex",
    "fix: resolve database connection issues",
    "fix: fix frontend API interceptors",
    "fix: fix responsive design issues",
    "refactor: improve error handling",
    "refactor: cleanup database models",
    "refactor: optimize API routes structure",
    "refactor: improve component organization",
    "refactor: reorganize authentication logic",
    "docs: add API documentation",
    "docs: add setup instructions",
    "docs: add security architecture notes",
    "style: improve code formatting",
    "test: add authentication tests",
    "chore: update dependencies",
    "chore: configure build pipeline",
    "chore: setup development environment",
]

def get_git_safe_path(path):
    """Convert Windows path to git-safe format"""
    return path.replace("\\", "/")

def generate_random_dates(num_commits):
    """Generate random dates between START_DATE and END_DATE"""
    dates = []
    date_range = (END_DATE - START_DATE).days
    
    for _ in range(num_commits):
        random_days = random.randint(0, date_range)
        random_hour = random.randint(8, 20)  # Business hours
        random_minute = random.randint(0, 59)
        random_second = random.randint(0, 59)
        
        date = START_DATE + timedelta(days=random_days, hours=random_hour, minutes=random_minute, seconds=random_second)
        dates.append(date)
    
    return sorted(dates)

def get_all_tracked_files():
    """Get all files that should be tracked (respecting gitignore)"""
    all_files = []
    
    for root, dirs, files in os.walk(REPO_PATH):
        # Skip git and hidden directories
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['__pycache__', 'node_modules', 'venv']]
        
        for file in files:
            # Skip hidden files and files that match gitignore patterns
            if not file.startswith('.') and not file.endswith('.pyc'):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, REPO_PATH)
                all_files.append(get_git_safe_path(rel_path))
    
    return sorted(all_files)

def create_commits_with_dates(repo_path):
    """Create multiple commits with random dates"""
    os.chdir(repo_path)
    
    # Configure git user
    subprocess.run(["git", "config", "user.email", "deepanshunegi06@gmail.com"], check=True)
    subprocess.run(["git", "config", "user.name", "Deepanshu Negi"], check=True)
    
    # Get all files
    all_files = get_all_tracked_files()
    
    if not all_files:
        print("No files found to commit!")
        return
    
    # Group files into commits
    num_commits = min(15, max(5, len(all_files) // 3))
    commit_dates = generate_random_dates(num_commits)
    
    # Shuffle files and split into groups
    random.shuffle(all_files)
    files_per_commit = len(all_files) // num_commits
    
    commit_count = 0
    for i, commit_date in enumerate(commit_dates):
        # Determine which files for this commit
        start_idx = i * files_per_commit
        if i == len(commit_dates) - 1:
            # Last commit gets remaining files
            commit_files = all_files[start_idx:]
        else:
            commit_files = all_files[start_idx:start_idx + files_per_commit]
        
        if not commit_files:
            continue
        
        # Stage files
        for file in commit_files:
            subprocess.run(["git", "add", file], check=False)
        
        # Create commit with specific date
        commit_msg = random.choice(COMMIT_MESSAGES)
        date_str = commit_date.strftime("%a %b %d %H:%M:%S %Y %z")
        
        env = os.environ.copy()
        env["GIT_AUTHOR_DATE"] = date_str
        env["GIT_COMMITTER_DATE"] = date_str
        
        result = subprocess.run(
            ["git", "commit", "-m", commit_msg],
            env=env,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            commit_count += 1
            print("[OK] Commit {}: {}".format(commit_count, commit_msg))
            print("     Date: {}".format(commit_date.strftime('%Y-%m-%d %H:%M:%S')))
            print("     Files: {}".format(len(commit_files)))
        else:
            print("[ERROR] Failed to commit: {}".format(result.stderr))
    
    print("\n[SUCCESS] Created {} commits successfully!".format(commit_count))
    
    # Show commit history
    print("\nCommit history:")
    subprocess.run(["git", "log", "--oneline", "--decorate"])

if __name__ == "__main__":
    repo_path = "."
    print("Creating multiple commits with varied dates...\n")
    create_commits_with_dates(repo_path)
