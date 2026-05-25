def extract_prescription_fields(raw_text):

    text = raw_text or ''
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    medicines = []
    for line in lines:
        if any(char.isdigit() for char in line):
            medicines.append(line)

    return {
        'total_lines': len(lines),
        'medication_lines': medicines,
    }
