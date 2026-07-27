# Kalima production operations

These files reproduce the independently deployed data and monitoring stacks used by production.
They intentionally contain no production secrets.

## Data services

Copy `data/.env.example` to `data/.env`, set a strong PostgreSQL password, and run `docker compose up -d` from `data`.
Back up and restore PostgreSQL and Redis before replacing an existing stack.
The application must join `kalima-data-network` and use hosts `kalima-postgres` and `kalima-redis`.

## Monitoring

Copy `monitoring/.env.example` to `monitoring/.env` and fill every value.
Run `monitoring/deploy.sh` as root because node-exporter and cAdvisor require host access and the generated Alertmanager file needs container-readable ownership.
Prometheus and Grafana listen only on loopback.
Access them through an SSH tunnel or a separately authenticated reverse proxy.

## Verification

Confirm every container is healthy with `docker compose ps`.
Confirm Prometheus reports five active scrape targets and one active Alertmanager.
Run the production K6 regression at 15 journeys per second after any infrastructure change.
Do not place generated files from `monitoring/rendered` or any `.env` file in version control.
