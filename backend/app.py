#  Remove eventlet entirely
# import eventlet
# eventlet.monkey_patch()

from flask import Flask, request, jsonify
from quantum_chat_core import run_quantum_chat
from flask_cors import CORS
from flask_socketio import SocketIO, emit

app = Flask(__name__)
CORS(app, supports_credentials=True)

#  Use threading async mode (eventlet doesn't play nice on Windows)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

# 🧪 Endpoint for standalone quantum simulation
@app.route("/run-chat", methods=["POST"])
def run_chat():
    data = request.get_json()
    message = data.get("message", "quantum secure chat")
    eve_present = data.get("eve_present", False)
    chaos_level = data.get("chaos_level", 0.9)

    try:
        result = run_quantum_chat(message, eve_present, chaos_level)
        return jsonify({
            "success": True,
            "message": "Quantum chat simulation completed.",
            "original_message": result["original"],
            "encrypted_bits": result["encrypted"],
            "decrypted_message": result["decrypted"],
            "eve_detected": result["eve_detected"]
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# 🧾 In-memory message history
chat_history = {
    "Alice": [],
    "Bob": []
}

# 📤 Send message and emit real-time SocketIO event
@app.route("/send-message", methods=["POST"])
def send_message():
    data = request.get_json()
    sender = data.get("sender")
    receiver = data.get("receiver")
    message = data.get("message")
    eve_present = data.get("eve_present", False)
    chaos_level = data.get("chaos_level", 0.9)

    if sender not in chat_history or receiver not in chat_history:
        return jsonify({"success": False, "error": "Invalid sender or receiver"}), 400

    try:
        result = run_quantum_chat(message, eve_present, chaos_level)

        decrypted_message = result["decrypted"]
        eve_detected = result["eve_detected"]

        chat_history[receiver].append({
            "sender": sender,
            "message": decrypted_message,
            "eve_detected": eve_detected
        })

        # 🔁 Emit to connected frontend via socket
        # 🔁 Emit a structured message that matches what the frontend expects
        socketio.emit("receive_message", {
            "success": True,
            "receiver": receiver,
            "sender": sender,
            "original_message": result["original"],
            "encrypted_bits": result["encrypted"],
            "decrypted_message": decrypted_message,
            "eve_detected": eve_detected
        })


        
        print("=== Incoming message from frontend ===")
        print("Sender:", sender)
        print("Receiver:", receiver)
        print("Original message:", message)


        return jsonify({
            "success": True,
            "message": "Message sent successfully.",
            "sender": sender,
            "receiver": receiver,
            "original_message": result["original"],
            "encrypted_bits": result["encrypted"],
            "decrypted_message": decrypted_message,
            "eve_detected": eve_detected
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# 📥 Fetch chat history
@app.route("/get-messages", methods=["GET"])
def get_messages():
    user = request.args.get("user")
    if user not in chat_history:
        return jsonify({"success": False, "error": "Invalid user"}), 400

    return jsonify({"success": True, "messages": chat_history[user]})


# ✅ Socket.IO connection check
@socketio.on("connect")
def handle_connect():
    print("A user connected via WebSocket")
    emit("server_message", {"text": "Connected to Q-Chat server"})


# 🚀 Start Flask app using threading backend
if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True)
