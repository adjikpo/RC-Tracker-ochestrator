import datetime

def get_current_week():
    return datetime.date.today().strftime("%Y-W%W")