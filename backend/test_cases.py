from app.core.database import SessionLocal
from app.api.routes.cases import get_case_detail

db = SessionLocal()
try:
    print("Testing get_case_detail for case 1")
    res = get_case_detail(1, db)
    print(res.dict())
except Exception as e:
    print("Error:", e)
    import traceback
    traceback.print_exc()
finally:
    db.close()
