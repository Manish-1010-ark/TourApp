"""
scripts/build_cities_data.py
=============================

One-time (and re-runnable) build script that generates data/cities_data.json
from the `countrystatecity-countries` package.

WHY A BUILD SCRIPT INSTEAD OF LIVE API CALLS AT REQUEST TIME?
- `countrystatecity-countries` bundles the dataset locally (no network at
  runtime, no rate limits, no API key).
- Even so, walking every state and flattening ~9,000+ Indian cities takes a
  moment, so we do it once here and cache the result as flat JSON that
  data/cities.py can load instantly at import time.
- Re-run this script whenever you want to refresh the data (e.g. after the
  package publishes an update).

USAGE:
    pip install countrystatecity-countries
    python scripts/build_cities_data.py

    # Optional: build for more than one country
    python scripts/build_cities_data.py --countries IN,US,GB

OUTPUT:
    data/cities_data.json
    [
      {"name": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777, "country": "India"},
      ...
    ]
"""

import argparse
import json
import sys
from pathlib import Path

try:
    from countrystatecity_countries import (
        get_country_by_code,
        get_states_of_country,
        get_cities_of_state,
    )
except ImportError:
    print(
        "ERROR: countrystatecity-countries is not installed.\n"
        "Run: pip install countrystatecity-countries",
        file=sys.stderr,
    )
    sys.exit(1)


def _first_attr(obj, *names, default=None):
    """
    Pydantic model field names can vary slightly between package versions
    (e.g. `lat` vs `latitude`). Try a list of candidate attribute names and
    return the first one that exists and is not None.
    """
    for name in names:
        if hasattr(obj, name):
            value = getattr(obj, name)
            if value is not None:
                return value
    return default


def build_country(country_code: str) -> list:
    """Fetch every city (with coordinates) for a single country."""
    country = get_country_by_code(country_code)
    if country is None:
        print(f"  WARNING: country code '{country_code}' not found, skipping.")
        return []

    country_name = _first_attr(country, "name", default=country_code)

    states = get_states_of_country(country_code)
    print(f"  {country_name}: {len(states)} states/regions found")

    cities_out = []
    seen = set()  # (name.lower(), state.lower()) to drop exact duplicates

    for state in states:
        state_code = _first_attr(state, "iso_code", "iso2", "state_code")
        state_name = _first_attr(state, "name", default=state_code)

        if not state_code:
            continue

        try:
            cities = get_cities_of_state(country_code, state_code)
        except Exception as exc:
            print(f"    WARNING: failed to fetch cities for {state_name}: {exc}")
            continue

        for city in cities:
            name = _first_attr(city, "name")
            lat = _first_attr(city, "lat", "latitude")
            lon = _first_attr(city, "lon", "lng", "longitude")

            if not name or lat is None or lon is None:
                # Skip anything missing coordinates rather than writing bad data
                continue

            try:
                lat = float(lat)
                lon = float(lon)
            except (TypeError, ValueError):
                continue

            key = (name.lower(), state_name.lower() if state_name else "")
            if key in seen:
                continue
            seen.add(key)

            cities_out.append(
                {
                    "name": name,
                    "state": state_name,
                    "lat": round(lat, 4),
                    "lon": round(lon, 4),
                    "country": country_name,
                }
            )

        print(f"    {state_name}: {len(cities)} cities")

    return cities_out


def main():
    parser = argparse.ArgumentParser(description="Build local city dataset with coordinates")
    parser.add_argument(
        "--countries",
        default="IN",
        help="Comma-separated ISO2 country codes (default: IN)",
    )
    parser.add_argument(
        "--out",
        default=str(Path(__file__).resolve().parent.parent / "data" / "cities_data.json"),
        help="Output JSON path (default: data/cities_data.json)",
    )
    args = parser.parse_args()

    country_codes = [c.strip().upper() for c in args.countries.split(",") if c.strip()]

    all_cities = []
    for code in country_codes:
        print(f"Fetching cities for {code}...")
        all_cities.extend(build_country(code))

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(all_cities, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\nDone. Wrote {len(all_cities)} cities to {out_path}")
    if all_cities:
        print("Sample record:", json.dumps(all_cities[0], ensure_ascii=False))


if __name__ == "__main__":
    main()