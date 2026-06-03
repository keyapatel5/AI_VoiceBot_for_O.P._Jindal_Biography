import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.path.insert(0, r'D:\jingle_steel\JindalBot')
from mongo_config import db
c = db.db.knowledge_base.find_one({})
print('KEYS:', list(c.keys()))
hq = c.get('question_hindi','')
ha = c.get('answer_hindi','')
print('question_hindi type:', type(hq).__name__, 'len:', len(hq))
print('question_hindi repr:', repr(hq))
print('answer_hindi repr:', repr(ha))
eq = c.get('question_english','')
ea = c.get('answer_english','')
print('question_english:', repr(eq))
print('answer_english:', repr(ea))
import re
has_dev = bool(re.search(r'[\u0900-\u097F]', hq))
print('question_hindi has Devanagari:', has_dev)
has_dev_a = bool(re.search(r'[\u0900-\u097F]', ha))
print('answer_hindi has Devanagari:', has_dev_a)
