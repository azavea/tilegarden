# "Breakable toy" warm-up project

Use Windshaft and Leaflet to map some data.

## Instructions

### Setup

Requires `docker` and `docker-compose`.

To build containers and load fixture data: `./scripts/setup`

### Accessing database

To get a `psql` shell: `docker-compose exec -u postgres database psql -d postgres`