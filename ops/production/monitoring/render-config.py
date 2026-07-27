#!/usr/bin/env python3
import os
from pathlib import Path
from string import Template

root = Path(__file__).resolve().parent
required = ["METRICS_TOKEN", "ALERT_EMAIL", "SMTP_SMARTHOST", "SMTP_FROM", "SMTP_USERNAME", "SMTP_PASSWORD"]
missing = [name for name in required if not os.environ.get(name)]
if missing:
    raise SystemExit("Missing required variables: " + ", ".join(missing))
output = root / "rendered"
output.mkdir(mode=0o700, exist_ok=True)
for source, target in [
    (root / "prometheus/prometheus.yml.template", output / "prometheus.yml"),
    (root / "alertmanager/alertmanager.yml.template", output / "alertmanager.yml"),
]:
    target.write_text(Template(source.read_text()).substitute(os.environ))
    target.chmod(0o600)
