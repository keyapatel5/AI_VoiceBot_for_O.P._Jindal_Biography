import json, sys
sys.stdout.reconfigure(encoding='utf-8')
with open('D:\\jingle_steel\\JindalBot\\jindal_data.json', encoding='utf-8') as f:
    data = json.load(f)
d = next(x for x in data if x['id'] == 865)
print('OLD:', d['question_hindi'])
print('NEW: ओ पी जिंदल कौन है')
# Update
old = d['question_hindi']
d['question_hindi'] = 'ओ पी जिंदल कौन है'
with open('D:\\jingle_steel\\JindalBot\\jindal_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print('JSON file updated')
