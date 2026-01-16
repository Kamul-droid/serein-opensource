DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'serein_auth') THEN
    CREATE DATABASE serein_auth;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'serein_user') THEN
    CREATE DATABASE serein_user;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'serein_conversation') THEN
    CREATE DATABASE serein_conversation;
  END IF;
END
$$;
