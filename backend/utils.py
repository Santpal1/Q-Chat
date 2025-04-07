def string_to_bits(message):
    return [int(bit) for char in message.encode('utf-8') for bit in format(char, '08b')]

def bits_to_string(bits):
    chars = [bits[i:i+8] for i in range(0, len(bits), 8)]
    return ''.join([chr(int(''.join(str(b) for b in byte), 2)) for byte in chars])

def xor_bits(bits1, bits2):
    return [b1 ^ b2 for b1, b2 in zip(bits1, bits2)]
