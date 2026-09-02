#!/usr/bin/env python3
"""Generate the independent 150-case Swiss Ephemeris Kundali corpus.

This script is intentionally outside the app/runtime dependency graph. It must
be run with pyswisseph 2.10.3.2 and the official Swiss Ephemeris 1800-2399 data
files so that the committed fixture never depends on the TypeScript engine it
validates.

Reference setup:

    python3 -m venv /tmp/aadhyatma-swiss
    /tmp/aadhyatma-swiss/bin/pip install pyswisseph==2.10.3.2
    curl -fL https://raw.githubusercontent.com/aloistr/swisseph/59ac051b5a5812c684973ca0fcedb1c8c3e9c5dc/ephe/sepl_18.se1 \
      -o /tmp/aadhyatma-swiss/sepl_18.se1
    curl -fL https://raw.githubusercontent.com/aloistr/swisseph/59ac051b5a5812c684973ca0fcedb1c8c3e9c5dc/ephe/semo_18.se1 \
      -o /tmp/aadhyatma-swiss/semo_18.se1
    /tmp/aadhyatma-swiss/bin/python scripts/generate-kundali-swiss-corpus.py \
      --ephemeris-path /tmp/aadhyatma-swiss

The 15 cities cover India's north/south/east/west/central spread. The ten
instants cover 1950-2026, leap-day and year-boundary cases, and birth times
from just after midnight through just before midnight. Their Cartesian product
is exactly 150 reference charts.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timedelta, timezone
import hashlib
import json
import math
from pathlib import Path
from typing import Any

import swisseph as swe


EXPECTED_SWISSEPH_VERSION = "2.10.03"
SWISSEPH_SOURCE_COMMIT = "59ac051b5a5812c684973ca0fcedb1c8c3e9c5dc"
IST = timezone(timedelta(hours=5, minutes=30))
NAKSHATRA_SPAN = 360.0 / 27.0
DAY_SECONDS = 86_400.0
MEAN_TROPICAL_YEAR_DAYS = 365.2425

GRAHAS = {
    "sun": swe.SUN,
    "moon": swe.MOON,
    "mars": swe.MARS,
    "mercury": swe.MERCURY,
    "jupiter": swe.JUPITER,
    "venus": swe.VENUS,
    "saturn": swe.SATURN,
    "rahu": swe.MEAN_NODE,
}

DASHA_ORDER = [
    "ketu",
    "venus",
    "sun",
    "moon",
    "mars",
    "rahu",
    "jupiter",
    "saturn",
    "mercury",
]

DASHA_YEARS = {
    "ketu": 7,
    "venus": 20,
    "sun": 6,
    "moon": 10,
    "mars": 7,
    "rahu": 18,
    "jupiter": 16,
    "saturn": 19,
    "mercury": 17,
}

CITIES = [
    {"id": "ujjain", "latitude": 23.1765, "longitude": 75.7885, "elevation": 494},
    {"id": "srinagar", "latitude": 34.0837, "longitude": 74.7973, "elevation": 1585},
    {"id": "delhi", "latitude": 28.6139, "longitude": 77.2090, "elevation": 216},
    {"id": "jaipur", "latitude": 26.9124, "longitude": 75.7873, "elevation": 431},
    {"id": "dwarka", "latitude": 22.2442, "longitude": 68.9685, "elevation": 9},
    {"id": "ahmedabad", "latitude": 23.0225, "longitude": 72.5714, "elevation": 53},
    {"id": "mumbai", "latitude": 19.0760, "longitude": 72.8777, "elevation": 14},
    {"id": "hyderabad", "latitude": 17.3850, "longitude": 78.4867, "elevation": 542},
    {"id": "bengaluru", "latitude": 12.9716, "longitude": 77.5946, "elevation": 920},
    {"id": "chennai", "latitude": 13.0827, "longitude": 80.2707, "elevation": 6},
    {"id": "thiruvananthapuram", "latitude": 8.5241, "longitude": 76.9366, "elevation": 10},
    {"id": "varanasi", "latitude": 25.3176, "longitude": 82.9739, "elevation": 81},
    {"id": "kolkata", "latitude": 22.5726, "longitude": 88.3639, "elevation": 9},
    {"id": "puri", "latitude": 19.8135, "longitude": 85.8312, "elevation": 0},
    {"id": "guwahati", "latitude": 26.1445, "longitude": 91.7362, "elevation": 55},
]

LOCAL_INSTANTS = [
    "1950-01-15T00:01:00+05:30",
    "1961-06-22T05:47:00+05:30",
    "1972-12-31T23:59:00+05:30",
    "1984-04-13T12:00:00+05:30",
    "1992-08-14T05:42:00+05:30",
    "2000-01-01T12:00:00+05:30",
    "2007-07-07T07:07:00+05:30",
    "2016-02-29T18:31:00+05:30",
    "2024-04-08T18:30:00+05:30",
    "2026-10-20T21:15:00+05:30",
]


def utc_iso(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def julian_day(value: datetime) -> float:
    utc = value.astimezone(timezone.utc)
    hour = utc.hour + utc.minute / 60.0 + utc.second / 3600.0 + utc.microsecond / 3_600_000_000.0
    return swe.julday(utc.year, utc.month, utc.day, hour, swe.GREG_CAL)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def years_to_seconds(years: float) -> float:
    return years * MEAN_TROPICAL_YEAR_DAYS * DAY_SECONDS


def vimshottari_reference(moon_longitude: float, birth: datetime) -> dict[str, Any]:
    nakshatra_index = math.floor(moon_longitude / NAKSHATRA_SPAN) % 27
    first_lord = DASHA_ORDER[nakshatra_index % len(DASHA_ORDER)]
    fraction_elapsed = (moon_longitude % NAKSHATRA_SPAN) / NAKSHATRA_SPAN
    first_start = birth - timedelta(
        seconds=years_to_seconds(DASHA_YEARS[first_lord] * fraction_elapsed)
    )
    first_end = first_start + timedelta(seconds=years_to_seconds(DASHA_YEARS[first_lord]))

    antar_cursor = first_start
    birth_antardasha_lord = None
    first_lord_index = DASHA_ORDER.index(first_lord)
    for offset in range(len(DASHA_ORDER)):
        antar_lord = DASHA_ORDER[(first_lord_index + offset) % len(DASHA_ORDER)]
        antar_end = antar_cursor + timedelta(
            seconds=years_to_seconds(
                DASHA_YEARS[first_lord] * DASHA_YEARS[antar_lord] / 120.0
            )
        )
        if antar_cursor <= birth < antar_end:
            birth_antardasha_lord = antar_lord
        antar_cursor = antar_end

    if birth_antardasha_lord is None:
        raise RuntimeError("Birth instant did not resolve to a first-period Antardasha")

    return {
        "firstLord": first_lord,
        "firstStartUtc": utc_iso(first_start),
        "firstEndUtc": utc_iso(first_end),
        "birthAntardashaLord": birth_antardasha_lord,
    }


def generate_instant(
    local_birth_iso: str,
    requested_flags: int,
) -> dict[str, Any]:
    local_birth = datetime.fromisoformat(local_birth_iso)
    if local_birth.utcoffset() != IST.utcoffset(None):
        raise ValueError(f"{local_birth_iso} is not an IST instant")
    utc_birth = local_birth.astimezone(timezone.utc)
    jd_ut = julian_day(utc_birth)

    grahas: dict[str, Any] = {}
    for graha, body in GRAHAS.items():
        result, returned_flags = swe.calc_ut(jd_ut, body, requested_flags)
        if not returned_flags & swe.FLG_SWIEPH:
            raise RuntimeError(
                f"{graha} for {local_birth_iso} did not use Swiss Ephemeris files "
                f"(returned flags {returned_flags})"
            )
        grahas[graha] = {
            "longitude": result[0] % 360.0,
            "speedLongitudePerDay": result[3],
        }

    rahu = grahas["rahu"]
    grahas["ketu"] = {
        "longitude": (rahu["longitude"] + 180.0) % 360.0,
        "speedLongitudePerDay": rahu["speedLongitudePerDay"],
    }

    lagna_by_city: dict[str, float] = {}
    for city in CITIES:
        _, ascmc = swe.houses_ex(
            jd_ut,
            city["latitude"],
            city["longitude"],
            b"W",
            swe.FLG_SIDEREAL,
        )
        lagna_by_city[city["id"]] = ascmc[0] % 360.0

    return {
        "id": f"{local_birth_iso[:10]}-{local_birth_iso[11:16].replace(':', '')}",
        "localBirthIst": local_birth_iso,
        "dateUtc": utc_iso(utc_birth),
        "expected": {
            "ayanamsa": swe.get_ayanamsa_ut(jd_ut),
            "lagnaByCity": lagna_by_city,
            "grahas": grahas,
            "vimshottari": vimshottari_reference(grahas["moon"]["longitude"], utc_birth),
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--ephemeris-path",
        required=True,
        type=Path,
        help="Directory containing official sepl_18.se1 and semo_18.se1 files",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[1]
        / "src/panchang/__tests__/fixtures/kundali-swiss-ephemeris-150.json",
    )
    args = parser.parse_args()

    if swe.version != EXPECTED_SWISSEPH_VERSION:
        raise RuntimeError(
            f"Expected Swiss Ephemeris {EXPECTED_SWISSEPH_VERSION}, found {swe.version}"
        )

    ephemeris_files = [args.ephemeris_path / "sepl_18.se1", args.ephemeris_path / "semo_18.se1"]
    for path in ephemeris_files:
        if not path.is_file():
            raise FileNotFoundError(path)

    swe.set_ephe_path(str(args.ephemeris_path))
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    requested_flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED

    instants = [
        generate_instant(local_birth, requested_flags)
        for local_birth in LOCAL_INSTANTS
    ]
    case_count = len(CITIES) * len(instants)
    if case_count != 150:
        raise RuntimeError(f"Expected 150 cases, generated {case_count}")

    payload = {
        "schemaVersion": 1,
        "source": {
            "library": "Swiss Ephemeris",
            "libraryVersion": swe.version,
            "sourceCommit": SWISSEPH_SOURCE_COMMIT,
            "pythonBinding": "pyswisseph 2.10.3.2",
            "siderealMode": "SIDM_LAHIRI",
            "calculation": "calc_ut",
            "requestedFlags": ["FLG_SWIEPH", "FLG_SIDEREAL", "FLG_SPEED"],
            "houseCalculation": "houses_ex, whole-sign chart derived from sidereal Ascendant",
            "ephemerisFiles": [
                {
                    "name": path.name,
                    "sha256": sha256(path),
                    "url": (
                        "https://raw.githubusercontent.com/aloistr/swisseph/"
                        f"{SWISSEPH_SOURCE_COMMIT}/ephe/{path.name}"
                    ),
                }
                for path in ephemeris_files
            ],
        },
        "coverage": {
            "caseCount": case_count,
            "cityCount": len(CITIES),
            "instantCount": len(LOCAL_INSTANTS),
            "cityIds": [city["id"] for city in CITIES],
            "localInstantsIst": LOCAL_INSTANTS,
            "yearRange": [1950, 2026],
        },
        "locations": CITIES,
        "instants": instants,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {case_count} Swiss Ephemeris cases to {args.output}")


if __name__ == "__main__":
    main()
