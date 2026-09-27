import { MapPin, X } from "lucide-react";
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getCitiesByCountry,
  getCountries,
} from "../../services/locationService";

type RequirementTypeFilter =
  | "all"
  | "product"
  | "service";

type ActivityFilter =
  | "all"
  | "active"
  | "inactive";

type PostedDateFilter =
  | "any"
  | "today"
  | "7days"
  | "30days";

const MAX_RANGE = 500_000_000;

export default function FindFilters({
  country,
  setCountry,
  province,
  setProvince,
  city,
  setCity,
  area,
  setArea,
  postalCode,
  setPostalCode,
  category,
  setCategory,
  categories,
  type,
  setType,
  activity,
  setActivity,
  postedDate,
  setPostedDate,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  verifiedOnly,
  setVerifiedOnly,
}: {
  country: string;
  setCountry: (value: string) => void;

  province: string;
  setProvince: (value: string) => void;

  city: string;
  setCity: (value: string) => void;

  area: string;
  setArea: (value: string) => void;

  postalCode: string;
  setPostalCode: (value: string) => void;

  category: string;
  setCategory: (value: string) => void;

  categories: string[];

  type: RequirementTypeFilter;
  setType: (value: RequirementTypeFilter) => void;

  activity: ActivityFilter;
  setActivity: (value: ActivityFilter) => void;

  postedDate: PostedDateFilter;
  setPostedDate: (value: PostedDateFilter) => void;

  minPrice: number;
  setMinPrice: (value: number) => void;

  maxPrice: number;
  setMaxPrice: (value: number) => void;

  verifiedOnly: boolean;
  setVerifiedOnly: (value: boolean) => void;
}) {
  const [
    countryOptions,
    setCountryOptions,
  ] =
    useState<string[]>(
      [],
    );

  const [
    cityOptions,
    setCityOptions,
  ] =
    useState<string[]>(
      [],
    );

  const [
    locationLoading,
    setLocationLoading,
  ] =
    useState(false);


  const [
    showMapPicker,
    setShowMapPicker,
  ] =
    useState(false);

  useEffect(() => {
    let cancelled =
      false;

    getCountries()
      .then(
        (items) => {
          if (
            !cancelled
          ) {
            setCountryOptions(
              items,
            );
          }
        },
      )
      .catch(
        () => {
          if (
            !cancelled
          ) {
            setCountryOptions(
              [],
            );
          }
        },
      );

    return () => {
      cancelled =
        true;
    };
  }, []);

  useEffect(() => {
    let cancelled =
      false;

    if (!country) {
      setCityOptions(
        [],
      );

      return () => {
        cancelled =
          true;
      };
    }

    setLocationLoading(
      true,
    );

    getCitiesByCountry(
      country,
    )
      .then(
        (items) => {
          if (
            !cancelled
          ) {
            setCityOptions(
              items,
            );
          }
        },
      )
      .catch(
        () => {
          if (
            !cancelled
          ) {
            setCityOptions(
              [],
            );
          }
        },
      )
      .finally(
        () => {
          if (
            !cancelled
          ) {
            setLocationLoading(
              false,
            );
          }
        },
      );

    return () => {
      cancelled =
        true;
    };
  }, [country]);

  return (
    <div className="mt-6 space-y-6">

      <FilterGroup
        title="Location"
      >
        <div className="grid gap-2">
          <select
            value={country}
            onChange={(event) => {
              const nextCountry =
                event.target.value;

              setCountry(
                nextCountry,
              );

              setCity("");
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">
              All Countries
            </option>

            {countryOptions.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ),
            )}
          </select>

          <select
            value={city}
            onChange={(event) =>
              setCity(
                event.target.value,
              )
            }
            disabled={!country}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {locationLoading
                ? "Loading Cities..."
                : country
                  ? "All Cities"
                  : "Select Country First"}
            </option>

            {cityOptions.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ),
            )}
          </select>

          <input
            value={province}
            onChange={(event) =>
              setProvince(
                event.target.value,
              )
            }
            placeholder="Province / State"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />

          <input
            value={area}
            onChange={(event) =>
              setArea(
                event.target.value,
              )
            }
            placeholder="Area / Locality"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />

          <div className="relative">
            <MapPin
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={postalCode}
              onChange={(event) =>
                setPostalCode(
                  event.target.value,
                )
              }
              placeholder="Postal Code"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </div>


          <button
            type="button"
            onClick={() =>
              setShowMapPicker(
                true,
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-100"
          >
            <MapPin
              size={16}
            />
            Select Location on Map
          </button>
        </div>
      </FilterGroup>

      <FilterGroup
        title="Category"
      >
        <select
          value={
            category
          }
          onChange={(
            event,
          ) =>
            setCategory(
              event.target.value,
            )
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
        >
          <option value="all">
            All Categories
          </option>

          {categories.map(
            (
              item,
            ) => (
              <option
                key={
                  item
                }
                value={
                  item
                }
              >
                {item}
              </option>
            ),
          )}
        </select>
      </FilterGroup>

      <FilterGroup
        title="Range"
      >
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="mb-3 grid grid-cols-2 gap-2">
            <label>
              <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
                Min Price
              </span>
              <input
                type="number"
                min={0}
                max={maxPrice}
                step={1000}
                value={minPrice}
                onChange={(event) => {
                  const value = Math.max(
                    0,
                    Math.min(
                      Number(event.target.value) || 0,
                      maxPrice,
                    ),
                  );
                  setMinPrice(value);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold outline-none focus:border-blue-500"
              />
            </label>

            <label>
              <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
                Max Price
              </span>
              <input
                type="number"
                min={minPrice}
                max={MAX_RANGE}
                step={1000}
                value={maxPrice}
                onChange={(event) => {
                  const value = Math.min(
                    MAX_RANGE,
                    Math.max(
                      Number(event.target.value) || 0,
                      minPrice,
                    ),
                  );
                  setMaxPrice(value);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold outline-none focus:border-blue-500"
              />
            </label>
          </div>

          <div className="mb-4 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>
              {formatRangeValue(
                minPrice,
              )}
            </span>

            <span>
              {formatRangeValue(
                maxPrice,
              )}
            </span>
          </div>

          <div className="relative h-7">
            <div className="absolute left-0 right-0 top-3 h-1.5 rounded-full bg-slate-200" />

            <div
              className="absolute top-3 h-1.5 rounded-full bg-blue-600"
              style={{
                left: `${(
                  minPrice /
                  MAX_RANGE
                ) * 100}%`,
                right: `${100 - (
                  maxPrice /
                  MAX_RANGE
                ) * 100}%`,
              }}
            />

            <input
              type="range"
              min={0}
              max={MAX_RANGE}
              step={100_000}
              value={minPrice}
              onChange={(event) => {
                const next = Math.min(
                  Number(
                    event.target.value,
                  ),
                  maxPrice,
                );

                setMinPrice(
                  next,
                );
              }}
              className="pointer-events-none absolute inset-0 h-7 w-full appearance-none bg-transparent
                [&::-webkit-slider-runnable-track]:h-1.5
                [&::-webkit-slider-runnable-track]:bg-transparent
                [&::-webkit-slider-thumb]:pointer-events-auto
                [&::-webkit-slider-thumb]:mt-[-5px]
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-blue-600
                [&::-webkit-slider-thumb]:bg-white
                [&::-moz-range-track]:bg-transparent
                [&::-moz-range-thumb]:pointer-events-auto
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-blue-600
                [&::-moz-range-thumb]:bg-white"
            />

            <input
              type="range"
              min={0}
              max={MAX_RANGE}
              step={100_000}
              value={maxPrice}
              onChange={(event) => {
                const next = Math.max(
                  Number(
                    event.target.value,
                  ),
                  minPrice,
                );

                setMaxPrice(
                  next,
                );
              }}
              className="pointer-events-none absolute inset-0 h-7 w-full appearance-none bg-transparent
                [&::-webkit-slider-runnable-track]:h-1.5
                [&::-webkit-slider-runnable-track]:bg-transparent
                [&::-webkit-slider-thumb]:pointer-events-auto
                [&::-webkit-slider-thumb]:mt-[-5px]
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-blue-600
                [&::-webkit-slider-thumb]:bg-white
                [&::-moz-range-track]:bg-transparent
                [&::-moz-range-thumb]:pointer-events-auto
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-blue-600
                [&::-moz-range-thumb]:bg-white"
            />
          </div>

          <div className="mt-1 flex justify-between text-[10px] font-semibold text-slate-400">
            <span>PKR 0</span>
            <span>PKR 50 Cr</span>
          </div>
        </div>
      </FilterGroup>

      <FilterGroup
        title="Requirement Type"
      >
        <div className="flex flex-wrap items-center gap-4">
          <Radio
            label="All"
            checked={
              type ===
              "all"
            }
            onChange={() =>
              setType(
                "all",
              )
            }
          />

          <Radio
            label="Product"
            checked={
              type ===
              "product"
            }
            onChange={() =>
              setType(
                "product",
              )
            }
          />

          <Radio
            label="Service"
            checked={
              type ===
              "service"
            }
            onChange={() =>
              setType(
                "service",
              )
            }
          />
        </div>
      </FilterGroup>

      <FilterGroup
        title="Posted Date"
      >
        <Radio
          label="Any Time"
          checked={
            postedDate ===
            "any"
          }
          onChange={() =>
            setPostedDate(
              "any",
            )
          }
        />

        <Radio
          label="Today"
          checked={
            postedDate ===
            "today"
          }
          onChange={() =>
            setPostedDate(
              "today",
            )
          }
        />

        <Radio
          label="Last 7 Days"
          checked={
            postedDate ===
            "7days"
          }
          onChange={() =>
            setPostedDate(
              "7days",
            )
          }
        />

        <Radio
          label="Last 30 Days"
          checked={
            postedDate ===
            "30days"
          }
          onChange={() =>
            setPostedDate(
              "30days",
            )
          }
        />
      </FilterGroup>

      <FilterGroup
        title="Post Status"
      >
        <div className="flex flex-wrap items-center gap-4">
          <Radio
            label="All"
            checked={
              activity ===
              "all"
            }
            onChange={() =>
              setActivity(
                "all",
              )
            }
          />

          <Radio
            label="Active"
            checked={
              activity ===
              "active"
            }
            onChange={() =>
              setActivity(
                "active",
              )
            }
          />

          <Radio
            label="Inactive"
            checked={
              activity ===
              "inactive"
            }
            onChange={() =>
              setActivity(
                "inactive",
              )
            }
          />
        </div>
      </FilterGroup>

      <FilterGroup
        title="Trust"
      >
        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={
              verifiedOnly
            }
            onChange={(
              event,
            ) =>
              setVerifiedOnly(
                event.target.checked,
              )
            }
          />

          Verified Requirements
        </label>
      </FilterGroup>

      {showMapPicker && (
        <MapLocationModal
          onClose={() =>
            setShowMapPicker(
              false,
            )
          }
          onUseLocation={(
            latitude,
            longitude,
          ) => {
            setArea(
              `${latitude.toFixed(
                5,
              )}, ${longitude.toFixed(
                5,
              )}`,
            );

            setShowMapPicker(
              false,
            );
          }}
        />
      )}
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function Radio({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-600">
      <input
        type="radio"
        checked={
          checked
        }
        onChange={
          onChange
        }
      />

      {label}
    </label>
  );
}

function MapLocationModal({
  onClose,
  onUseLocation,
}: {
  onClose: () => void;
  onUseLocation: (
    latitude: number,
    longitude: number,
  ) => void;
}) {
  const [
    latitude,
    setLatitude,
  ] =
    useState(31.5204);

  const [
    longitude,
    setLongitude,
  ] =
    useState(74.3587);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const useCurrentLocation =
    () => {
      if (
        !navigator.geolocation
      ) {
        alert(
          "Browser location support available nahi hai.",
        );

        return;
      }

      setLoading(
        true,
      );

      navigator.geolocation.getCurrentPosition(
        (
          position,
        ) => {
          setLatitude(
            position.coords.latitude,
          );

          setLongitude(
            position.coords.longitude,
          );

          setLoading(
            false,
          );
        },
        () => {
          setLoading(
            false,
          );

          alert(
            "Location access allow karein.",
          );
        },
      );
    };

  const delta =
    0.03;

  const mapUrl =
    `https://www.openstreetmap.org/export/embed.html?bbox=${
      longitude - delta
    }%2C${
      latitude - delta
    }%2C${
      longitude + delta
    }%2C${
      latitude + delta
    }&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-black">
              Select Location on Map
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current location use karein ya latitude / longitude adjust karein.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <X />
          </button>
        </div>

        <div className="p-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <iframe
              title="Location map"
              src={mapUrl}
              className="h-80 w-full"
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs font-bold text-slate-500">
                Latitude
              </span>

              <input
                type="number"
                step="0.00001"
                value={latitude}
                onChange={(event) =>
                  setLatitude(
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500"
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-bold text-slate-500">
                Longitude
              </span>

              <input
                type="number"
                step="0.00001"
                value={longitude}
                onChange={(event) =>
                  setLongitude(
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-blue-500"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={useCurrentLocation}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold hover:bg-slate-50"
            >
              {loading
                ? "Getting Location..."
                : "Use My Current Location"}
            </button>

            <button
              type="button"
              onClick={() =>
                onUseLocation(
                  latitude,
                  longitude,
                )
              }
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Use This Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRangeValue(
  value: number,
) {
  if (value >= 10_000_000) {
    const crore =
      value / 10_000_000;

    return `PKR ${Number.isInteger(crore) ? crore : crore.toFixed(1)} Cr`;
  }

  if (value >= 100_000) {
    const lakh =
      value / 100_000;

    return `PKR ${Number.isInteger(lakh) ? lakh : lakh.toFixed(1)} Lac`;
  }

  return `PKR ${value.toLocaleString()}`;
}
