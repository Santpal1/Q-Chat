import random
from qiskit import QuantumCircuit
from qiskit_aer import Aer
from qiskit.visualization import plot_histogram

def send_qubits(bits, bob_bases):
    backend = Aer.get_backend('aer_simulator')
    measurements = []

    for bit, bob_basis in zip(bits, bob_bases):
        qc = QuantumCircuit(1, 1)

        # Alice encodes using BB92 protocol (only sends states for 0 and 1 depending on basis)
        if bit == 0:
            qc.h(0)
        # else: do nothing (represents |0⟩)

        # Bob measures in his random basis
        if bob_basis == 1:
            qc.h(0)
        qc.measure(0, 0)

        result = backend.run(qc, shots=1, memory=True).result()
        measured_bit = int(result.get_memory()[0])
        measurements.append(measured_bit)

    return measurements

def bb92_key_exchange(n=100):
    alice_bits = [random.randint(0, 1) for _ in range(n)]
    bob_bases = [random.randint(0, 1) for _ in range(n)]

    print("[Alice] Sending bits...")
    print("[Bob] Choosing measurement bases...")

    measurements = send_qubits(alice_bits, bob_bases)

    indices_to_keep = []
    key = []

    for i in range(n):
        if (alice_bits[i] == 0 and measurements[i] == 1) or \
           (alice_bits[i] == 1 and measurements[i] == 0):
            indices_to_keep.append(i)
            key.append(alice_bits[i])

    print(f"[Alice] Sent bits")
    print(f"[Bob] Bases")
    print(f"[Bob] Measurements")
    print(f"[Bob] Indices to keep")
    print(f"[Alice & Bob] Final key")
    print(f"[Shared] Key length: {len(key)}")
    
    return key

def alice_send_bits(n=10000):
    print("[Alice] Sending bits...")
    bits = [random.randint(0, 1) for _ in range(n)]
    bases = [random.randint(0, 1) for _ in range(n)]
    return bits, bases, bits  # key not generated here

def bob_receive_qubits(bits, n=10000, eve_present=False):
    print("[Bob] Choosing measurement bases...")
    bob_bases = [random.randint(0, 1) for _ in range(n)]
    print("[Bob] Receiving qubits...")

    measurements = []

    for i, (bit, bob_basis) in enumerate(zip(bits, bob_bases)):
        # Simulate Eve's interference
        if eve_present:
            eve_basis = random.randint(0, 1)

            # Eve "measures" the bit
            if bit == 0:  # |+⟩ sent by Alice
                eve_measurement = random.choice([0, 1])
            else:         # |0⟩ sent by Alice
                eve_measurement = 0  # Always measured as 0

            # Eve resends qubit (simulate disturbance)
            if eve_basis == 0:
                bit = eve_measurement  # Eve uses what she measured
            else:
                bit = random.choice([0, 1])  # Randomize if wrong basis

        # Bob now measures
        if bit == 1:
            measurements.append(random.choice([0, 1]))
        else:
            measurements.append(0)

    # Randomly keep half of the positions (like sifting in QKD)
    indices_to_keep = [i for i in range(n) if random.choice([True, False])]
    key = [measurements[i] for i in indices_to_keep]

    return measurements, bob_bases, key

    indices_to_keep = [i for i in range(n) if random.choice([True, False])]
    key = [measurements[i] for i in indices_to_keep]

    return measurements, bob_bases, key


def eve_intercept_qubits(bits, alice_bases):
    eve_bases = [random.randint(0, 1) for _ in range(len(bits))]
    intercepted_bits = []

    for bit, eve_basis in zip(bits, eve_bases):
        # Eve decodes the qubit (simulating with classical logic)
        if bit == 1:
            # Represents |0⟩, no H gate used by Alice
            state = 0
        else:
            # Represents |+⟩, Alice applied H => equal superposition
            state = random.choice([0, 1])

        # Eve measures in her basis
        if eve_basis == 0:
            measured = state  # direct measurement
        else:
            measured = random.choice([0, 1]) if state == 0 else state  # if state was 0, H adds randomness

        # Eve resends qubit using her measured value
        if measured == 0:
            intercepted_bits.append(0)  # She sends |+⟩ (simulate H gate)
        else:
            intercepted_bits.append(1)  # She sends |0⟩ (no gate)

    return intercepted_bits
