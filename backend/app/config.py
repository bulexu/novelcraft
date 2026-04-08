"""
Configuration management using pydantic-settings
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "NovelCraft"
    app_env: str = "development"
    debug: bool = True
    secret_key: str = "your-secret-key-change-in-production"

    # Neo4j (Knowledge Graph Storage for LightRAG)
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "novelcraft123"

    # LLM
    llm_api_key: str = ""
    llm_base_url: str = "https://api.openai.com/v1"
    llm_model_name: str = "gpt-4"
    llm_temperature: float = 0.7
    llm_max_tokens: int = 4000

    # Embedding
    embedding_model: str = "text-embedding-3-small"
    embedding_dimension: int = 1536

    # LightRAG
    lightrag_working_dir: str = "./data/lightrag"
    lightrag_max_tokens: int = 32768

    # File-based storage (Vibe Writing)
    projects_data_dir: str = "./data/projects"

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:8000"

    # Logging
    log_level: str = "INFO"
    log_format: str = "json"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Export settings instance
settings = get_settings()