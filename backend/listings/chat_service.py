import json
import os
import re
import urllib.error
import urllib.request
from typing import Any

from django.conf import settings
from django.db.models import Q, QuerySet

from .models import Listing

MAX_CATALOG = 120
MAX_RECOMMEND = 10


def _catalog_dict(listing: Listing) -> dict[str, Any]:
    desc = (listing.description or "").replace("\n", " ").strip()
    if len(desc) > 280:
        desc = desc[:277] + "..."
    return {
        "id": listing.id,
        "title": listing.title,
        "city": listing.city,
        "district": listing.address_or_district,
        "price_uah": float(listing.price),
        "rooms": listing.rooms,
        "area_sqm": float(listing.area_sqm),
        "floor": listing.floor,
        "housing_type": listing.housing_type,
        "furnished": listing.has_furniture,
        "appliances": listing.has_appliances,
        "description": desc,
    }


def _heuristic_ids(message: str, published: QuerySet[Listing]) -> list[int]:
    text = (message or "").lower().strip()
    if not text:
        return list(published.values_list("id", flat=True)[:5])
    words = [w for w in re.split(r"\W+", text) if len(w) > 2]
    words = words[:20]
    if not words:
        return list(published.values_list("id", flat=True)[:5])
    q = Q()
    for w in words:
        q |= (
            Q(title__icontains=w)
            | Q(description__icontains=w)
            | Q(city__icontains=w)
            | Q(address_or_district__icontains=w)
        )
    qs = published.filter(q).distinct().order_by("-created_at")
    ids = list(qs.values_list("id", flat=True)[:MAX_RECOMMEND])
    if not ids:
        return list(published.values_list("id", flat=True)[:5])
    return ids


def _openai_recommend(message: str, catalog: list[dict[str, Any]]) -> dict[str, Any] | None:
    key = getattr(settings, "OPENAI_API_KEY", "") or os.environ.get("OPENAI_API_KEY", "")
    if not key.strip():
        return None
    model = getattr(settings, "OPENAI_MODEL", None) or os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    allowed_ids = {row["id"] for row in catalog}
    system = (
        "Ти помічник на сайті оренди квартир в Україні. "
        "Ти НЕ створюєш нові оголошення і НЕ шукаєш житло поза каталогом. "
        "Ти лише підбираєш id з переданого JSON-масиву listings. "
        "Відповідь користувачу українською, коротко і по суті. "
        'Поверни СТРОГО один JSON-об\'єкт виду {"reply":"...","recommended_ids":[числа впорядковані за релевантністю]}. '
        "recommended_ids — лише id з listings, без вигаданих чисел, максимум 10 позицій."
    )
    user_payload = json.dumps({"user_message": message, "listings": catalog}, ensure_ascii=False)
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user_payload},
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.4,
    }
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {key.strip()}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.load(resp)
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return None
    try:
        content = data["choices"][0]["message"]["content"]
        parsed = json.loads(content)
    except (KeyError, IndexError, TypeError, json.JSONDecodeError):
        return None
    reply = str(parsed.get("reply", "")).strip()
    raw_ids = parsed.get("recommended_ids") or parsed.get("ids") or []
    if not isinstance(raw_ids, list):
        return None
    clean: list[int] = []
    for x in raw_ids:
        try:
            n = int(x)
        except (TypeError, ValueError):
            continue
        if n in allowed_ids and n not in clean:
            clean.append(n)
        if len(clean) >= MAX_RECOMMEND:
            break
    if not clean:
        return None
    return {"reply": reply or "Ось варіанти з каталогу.", "listing_ids": clean}


def recommend(message: str, published: QuerySet[Listing]) -> dict[str, Any]:
    message = (message or "").strip()
    listings = list(published.order_by("-created_at")[:MAX_CATALOG])
    if not listings:
        return {
            "reply": "Наразі на платформі немає опублікованих оголошень — підбір неможливий.",
            "listing_ids": [],
        }
    catalog = [_catalog_dict(x) for x in listings]
    allowed = {x.id for x in listings}

    ai = _openai_recommend(message, catalog)
    if ai:
        ids = [i for i in ai["listing_ids"] if i in allowed][:MAX_RECOMMEND]
        if ids:
            return {"reply": ai["reply"], "listing_ids": ids}

    ids = _heuristic_ids(message, published.order_by("-created_at"))
    ids = [i for i in ids if i in allowed][:MAX_RECOMMEND]
    return {
        "reply": (
            "Я підібрав кілька оголошень із нашого каталогу за ключовими словами з вашого запиту. "
            "Нижче — картки; можете уточнити місто, бюджет, кількість кімнат — тоді список стане точнішим."
        ),
        "listing_ids": ids,
    }
