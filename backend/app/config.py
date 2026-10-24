from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False,
    )

    database_url: str = "sqlite:///./data/fruti.db"
    secret_key: str = ""
    admin_username: str = ""
    admin_password: str = ""
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    frontend_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    cookie_secure: bool = False
    cookie_samesite: str = "lax"

    def origin_list(self) -> list[str]:
        """Orígenes permitidos para el navegador.

        Falla con un mensaje claro si la configuración es inválida: un
        `FRONTEND_ORIGINS` mal puesto deja el panel sin acceso y es difícil de
        diagnosticar.
        """
        origins: list[str] = []
        for raw in self.frontend_origins.split(","):
            item = raw.strip().rstrip("/")
            if not item:
                continue
            if not item.startswith(("http://", "https://")):
                raise ValueError(
                    f"FRONTEND_ORIGINS contiene un origen inválido: {item!r}. "
                    "Cada origen debe empezar por http:// o https://."
                )
            origins.append(item)

        if not origins:
            raise ValueError(
                "FRONTEND_ORIGINS está vacío. Define al menos el origen del "
                "frontend, por ejemplo http://localhost:3000"
            )
        return origins


@lru_cache
def get_settings() -> Settings:
    return Settings()
