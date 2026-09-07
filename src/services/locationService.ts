const BASE_URL =
  "https://countriesnow.space/api/v0.1";

interface CountriesResponse {
  error?: boolean;
  msg?: string;
  data?: Array<{
    country?: string;
    cities?: string[];
  }>;
}

let cachedCountries:
  string[] | null =
  null;

const cityCache =
  new Map<
    string,
    string[]
  >();

async function fetchCountryData() {
  const response =
    await fetch(
      `${BASE_URL}/countries`,
    );

  if (!response.ok) {
    throw new Error(
      "Unable to load location data.",
    );
  }

  const result =
    (await response.json()) as
      CountriesResponse;

  if (
    result.error ||
    !Array.isArray(
      result.data,
    )
  ) {
    throw new Error(
      result.msg ||
        "Invalid location response.",
    );
  }

  return result.data;
}

export async function getCountries():
  Promise<string[]> {
  if (
    cachedCountries
  ) {
    return cachedCountries;
  }

  const data =
    await fetchCountryData();

  const countries =
    data
      .map(
        (item) =>
          item.country?.trim() ??
          "",
      )
      .filter(Boolean)
      .sort(
        (a, b) =>
          a.localeCompare(
            b,
          ),
      );

  cachedCountries =
    countries;

  for (
    const item of data
  ) {
    const country =
      item.country?.trim();

    if (!country) {
      continue;
    }

    const cities =
      Array.isArray(
        item.cities,
      )
        ? [
            ...new Set(
              item.cities
                .map(
                  (city) =>
                    city.trim(),
                )
                .filter(
                  Boolean,
                ),
            ),
          ].sort(
            (a, b) =>
              a.localeCompare(
                b,
              ),
          )
        : [];

    cityCache.set(
      country,
      cities,
    );
  }

  return countries;
}

export async function getCitiesByCountry(
  country: string,
): Promise<string[]> {
  if (!country.trim()) {
    return [];
  }

  const cached =
    cityCache.get(
      country,
    );

  if (cached) {
    return cached;
  }

  await getCountries();

  return (
    cityCache.get(
      country,
    ) ?? []
  );
}
