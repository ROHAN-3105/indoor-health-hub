from main import export_data
from db import init_db

init_db()
try:
    res = export_data("monacos_room_01")
    print("SUCCESS: Retrieved response object.")
except Exception as e:
    import traceback
    traceback.print_exc()
