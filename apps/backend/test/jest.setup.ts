process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/cgtourism_test?schema=public";
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test_super_secret_jwt_key_at_least_32_characters";
process.env.PORT = "4001";
process.env.S3_ENDPOINT = "";
process.env.S3_ACCESS_KEY = "";
process.env.S3_SECRET_KEY = "";
