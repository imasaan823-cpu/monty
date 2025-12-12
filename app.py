import sqlite3
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_NAME = "scores.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS highscores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            score INTEGER NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

@app.route("/")
def home():
    return render_template("index.html")

@app.post("/api/highscores")
def save_score():
    data = request.json
    name = data.get("name", "Player")
    score = int(data.get("score", 0))

    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("INSERT INTO highscores (name, score) VALUES (?, ?)", (name, score))
    conn.commit()
    conn.close()

    return jsonify({"status": "success"})

@app.get("/api/highscores")
def get_scores():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT name, score FROM highscores ORDER BY score DESC LIMIT 20")
    rows = c.fetchall()
    conn.close()
    return jsonify([{"name": r[0], "score": r[1]} for r in rows])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000, debug=True)
