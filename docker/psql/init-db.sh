#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  create extension plv8;
  create role "darin" with superuser login password 'darin';
  alter database comp486 owner to "darin";
EOSQL