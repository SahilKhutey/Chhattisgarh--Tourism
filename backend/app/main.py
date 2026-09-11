from fastapi import FastAPI

from app.modules.content_template.api.routes import router as template_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="CG Tourism API",
        version="1.0.0",
    )

    app.include_router(template_router)

    @app.get("/health")
    async def health():
        return {
            "status": "ok",
            "service": "cg-tourism-api",
        }

    return app


app = create_app()
