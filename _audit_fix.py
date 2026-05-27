import json

with open('data/oefeningen.json','r',encoding='utf-8') as f:
    data = json.load(f)

# Fix h6-mc-9 — restore proper question that matches its MC options
for e in data:
    if e['id'] == 'h6-mc-9':
        e['question'] = "Wanneer is de equivalentcijfermethode aangewezen?"
        e['tags'] = ["equivalent","kostprijs"]
        e['explanation'] = "De equivalentcijfermethode is geschikt voor producten die weinig van elkaar verschillen (massaproductie), bv. een brouwerij of bakkerij."
        print("Fixed h6-mc-9 question")

# Audit: check that each MC question semantically matches its options
print("\n--- AUDIT: MC questions vs options (suspicious matches) ---")
SUSPICIOUS_KEYWORDS = {
    "mc": [],
}
for e in data:
    if e['type'] != 'mc': continue
    q = e['question'].lower()
    opts = ' | '.join(e['options']).lower()
    # Red flag: question is numeric/calculation but options are text categories
    if ('hoeveel' in q or 'bereken' in q or 'euro' in q) and 'euro' not in opts and '%' not in opts and not any(c.isdigit() for c in opts):
        print(f"  WARN {e['id']}: numeric Q but text options")
        print(f"    Q: {e['question'][:90]}")
        print(f"    O: {opts[:90]}")

# Also audit open exercises with mismatched accept
print("\n--- AUDIT: open exercises (verify accept matches question topic) ---")
for e in data:
    if e['type'] != 'open': continue
    q = e['question'].lower()
    accept = e.get('accept', [])
    # If accept contains pure numbers but Q has no numeric expectation, or vice versa
    has_num_accept = any(a.replace(',','').replace('.','').replace(' ','').isdigit() for a in accept)
    expects_num = 'hoeveel' in q or 'bereken' in q or '(in euro' in q or '(cijfer)' in q
    if has_num_accept and not expects_num:
        print(f"  WARN {e['id']}: numeric accept but Q doesn't ask for number")
        print(f"    Q: {e['question'][:90]}")
        print(f"    accept: {accept[:3]}")
    if expects_num and not has_num_accept:
        print(f"  WARN {e['id']}: Q asks number but accept is text")
        print(f"    Q: {e['question'][:90]}")
        print(f"    accept: {accept[:3]}")

with open('data/oefeningen.json','w',encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("\nSaved.")
