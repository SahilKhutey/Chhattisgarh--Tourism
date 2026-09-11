from app.modules.content_entries.services.schema_compiler import EntrySchemaCompiler


def test_schema_compiler_generates_valid_schema(destination_template):
    _, version = destination_template
    compiler = EntrySchemaCompiler()
    schema = compiler.compile(version)

    assert schema["type"] == "object"
    assert "properties" in schema
    assert "name" in schema["properties"]
    assert schema["properties"]["name"]["type"] == "string"
    assert schema["properties"]["entry_fee"]["type"] == "number"
    assert schema["properties"]["is_active"]["type"] == "boolean"
    assert "required" in schema
    assert "name" in schema["required"]
    assert "description" not in schema["required"]


def test_schema_compiler_enum_types(destination_template):
    _, version = destination_template
    compiler = EntrySchemaCompiler()
    schema = compiler.compile(version)

    assert schema["properties"]["category"]["type"] == "string"
    assert "wildlife" in schema["properties"]["category"]["enum"]
    assert "heritage" in schema["properties"]["category"]["enum"]
    assert "waterfalls" in schema["properties"]["category"]["enum"]
