from app.repositories.base import BaseRepository
from app.models.hunting_model import SavedHunt

class SavedHuntRepository(BaseRepository[SavedHunt]):
    pass

saved_hunt_repo = SavedHuntRepository(SavedHunt)
