from multiprocessing import Process, Queue
from bb92_key_exchange import alice_send_bits, bob_receive_qubits
from utils import string_to_bits, bits_to_string, xor_bits
import random

# ---------------------- Eve Logic ---------------------
def eve_intercept_qubits(bits, alice_bases, chaos_level=0.7):
    eve_bases = [random.randint(0, 1) for _ in range(len(bits))]
    intercepted_bits = []

    for bit, eve_basis in zip(bits, eve_bases):
        if bit == 1:
            state = 0  # Simulate |0⟩
        else:
            state = random.choice([0, 1])  # Simulate |+⟩

        if eve_basis == 0:
            measured = state
        else:
            measured = random.choice([0, 1]) if state == 0 else state

        if random.random() < chaos_level:
            measured = 1 - measured

        if measured == 0:
            intercepted_bits.append(0)  # Simulate |+⟩
        else:
            intercepted_bits.append(1)  # Simulate |0⟩

    return intercepted_bits

# ---------------------- Key Comparison ---------------------
def compare_keys(alice_key, bob_key, sample_size=20, eve_present=True):
    if not eve_present:
        print("[Detector] Eve disabled. Skipping mismatch check.")
        return False

    sample_size = min(sample_size, len(alice_key), len(bob_key))
    if sample_size == 0:
        print("[Detector] Not enough key bits to compare.")
        return False

    alice_sample = alice_key[:sample_size]
    bob_sample = bob_key[:sample_size]

    mismatches = sum(1 for a, b in zip(alice_sample, bob_sample) if a != b)
    error_rate = mismatches / sample_size

    print(f"[Detector] Sample mismatch rate: {error_rate:.2%}")
    return error_rate > 0.2

# ---------------------- Alice ---------------------
def alice(q_send_to_eve, q_recv_key, q_recv_eve_result, q_send_to_bob, message):
    print(f"[Alice] Original message: {message}")

    bits, bases, alice_key = alice_send_bits()
    q_send_to_eve.put((bits, bases))

    bob_key = q_recv_key.get()
    sample_size = min(20, len(alice_key), len(bob_key))
    q_send_to_bob.put(alice_key[:sample_size])

    eve_detected = q_recv_eve_result.get()
    if eve_detected:
        print("[Alice] Eve detected! Aborting communication.")
        return

    message_bits = string_to_bits(message)
    if len(bob_key) < len(message_bits):
        print("[Alice] Key too short. Cannot encrypt.")
        return

    encrypted_bits = xor_bits(message_bits, bob_key[:len(message_bits)])
    q_send_to_bob.put(encrypted_bits)
    print("[Alice] Message encrypted and sent.")

# ---------------------- Eve ---------------------
def eve(q_recv_from_alice, q_send_to_bob, eve_present, chaos_level=0.7):
    bits, bases = q_recv_from_alice.get()
    if eve_present:
        tampered_bits = eve_intercept_qubits(bits, bases, chaos_level)
        print("[Eve] Intercepted and tampered with qubits.")
    else:
        tampered_bits = bits
        print("[Eve] Letting qubits pass through untouched.")
    q_send_to_bob.put((tampered_bits, bases))

# ---------------------- Bob ---------------------
def bob(q_recv_from_eve, q_send_key, q_send_eve_result, q_recv_from_alice, eve_present):
    bits, alice_bases = q_recv_from_eve.get()
    measurements, bob_bases, key = bob_receive_qubits(bits)

    q_send_key.put(key)

    alice_sample = q_recv_from_alice.get()
    eve_detected = compare_keys(alice_sample, key[:len(alice_sample)], eve_present)
    q_send_eve_result.put(eve_detected)

    if eve_detected:
        print("[Bob] Eve detected! Aborting decryption.")
        return

    encrypted_bits = q_recv_from_alice.get()
    decrypted_bits = xor_bits(encrypted_bits, key[:len(encrypted_bits)])
    decrypted_message = bits_to_string(decrypted_bits)

    print(f"[Bob] Decrypted message: {decrypted_message}")

# ---------------------- Main ---------------------
if __name__ == "__main__":
    message = "quantum secure chat"
    eve_present = False      # Toggle to simulate Eve
    chaos_level = 0.9           # Increase for more aggressive eavesdropping

    # Queues
    q_a_to_e = Queue()
    q_e_to_b = Queue()
    q_b_to_a_key = Queue()
    q_b_to_a_detect = Queue()
    q_a_to_b = Queue()

    # Processes
    p_alice = Process(target=alice, args=(q_a_to_e, q_b_to_a_key, q_b_to_a_detect, q_a_to_b, message))
    p_eve   = Process(target=eve, args=(q_a_to_e, q_e_to_b, eve_present, chaos_level))
    p_bob   = Process(target=bob, args=(q_e_to_b, q_b_to_a_key, q_b_to_a_detect, q_a_to_b, eve_present))

    p_bob.start()
    p_eve.start()
    p_alice.start()

    p_alice.join()
    p_eve.join()
    p_bob.join()
