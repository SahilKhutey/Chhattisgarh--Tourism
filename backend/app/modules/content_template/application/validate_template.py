from ..domain.errors import TemplateValidationError
from ..domain.validation import validate_config
from ..infrastructure.models import ContentTemplateModel


def validate_template(
    template: ContentTemplateModel,
) -> list[str]:

    errors: list[str] = []

    if not template.name.strip():
        errors.append("Template name cannot be empty.")

    if not template.slug.strip():
        errors.append("Template slug cannot be empty.")

    fields = sorted(
        template.fields,
        key=lambda item: item.display_order,
    )

    keys = set()

    for field in fields:
        if field.key in keys:
            errors.append(f"Duplicate field key: {field.key}")

        keys.add(field.key)

        try:
            validate_config(
                field.type,
                field.config,
            )
        except TemplateValidationError as exc:
            errors.append(f"{field.key}: {exc}")

    orders = [field.display_order for field in fields]

    if len(orders) != len(set(orders)):
        errors.append("Field display orders must be unique.")

    return errors
