import sys
sys.stdout.reconfigure(encoding='utf-8')
from mongo_config import db
m = db.db['knowledge_base']
m.update_one({'id': 865}, {'$set': {'question_hindi': 'ओ पी जिंदल कौन है'}})
d = m.find_one({'id': 865})
print(f'q_hi={d["question_hindi"]}')
print(f'a_hi={d["answer_hindi"][:120]}')
