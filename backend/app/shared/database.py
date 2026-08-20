from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from dotenv import load_dotenv
from os import environ

load_dotenv()
DATABASE_URL = environ["DATABASE_URL"]
engine = create_async_engine(DATABASE_URL)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as db:
        yield db