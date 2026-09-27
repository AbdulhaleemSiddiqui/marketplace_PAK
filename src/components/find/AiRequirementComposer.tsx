import {
  Mic,
  Paperclip,
  Sparkles,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import type {
  RequirementField,
  StructuredRequirement,
} from "../../types/marketplace";
import {
  getCitiesByCountry,
  getCountries,
} from "../../services/locationService";

const MAX_RANGE = 500_000_000;


function normalize(
  value: string,
) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}


interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: {
    [index: number]:
      SpeechRecognitionResultLike;
    length: number;
  };
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((
        event:
          SpeechRecognitionEventLike,
      ) => void)
    | null;
  onerror:
    | (() => void)
    | null;
  onend:
    | (() => void)
    | null;
}

type SpeechRecognitionConstructor =
  new () => SpeechRecognitionLike;

export default function AiRequirementComposer({
  input,
  requirement,
  setInput,
  images,
  setImages,
  imageFiles,
  setImageFiles,
  onGenerate,
  onFieldChange,
  onSubmit,
  submitting,
  onClose,
}: {
  input: string;
  requirement: StructuredRequirement | null;
  setInput: (value: string) => void;
  images: string[];
  setImages: (value: string[]) => void;
  imageFiles: File[];
  setImageFiles: (
    value: File[]
  ) => void;

  onGenerate: () => void;
  onFieldChange: (
    fieldId: string,
    value: string,
  ) => void;
  onSubmit: () => void;
  submitting: boolean;
  onClose: () => void;
}) {
  const fileRef =
    useRef<HTMLInputElement | null>(
      null,
    );


  const [
    isListening,
    setIsListening,
  ] =
    useState(false);


  const [
    showValidation,
    setShowValidation,
  ] =
    useState(false);

  const imageMissing =
    showValidation &&
    images.length === 0;

  const isFieldMissing = (
    field:
      RequirementField,
  ) =>
    showValidation &&
    field.required &&
    !field.value.trim();

  const startVoiceInput =
    () => {
      const browserWindow =
        window as typeof window & {
          SpeechRecognition?:
            SpeechRecognitionConstructor;
          webkitSpeechRecognition?:
            SpeechRecognitionConstructor;
        };

      const Recognition =
        browserWindow.SpeechRecognition ??
        browserWindow.webkitSpeechRecognition;

      if (!Recognition) {
        alert(
          "Voice input is not supported in this browser. Chrome or Edge use karein.",
        );
        return;
      }

      const recognition =
        new Recognition();

      recognition.lang =
        "en-PK";
      recognition.interimResults =
        false;
      recognition.continuous =
        false;

      recognition.onresult =
        (
          event,
        ) => {
          const transcript =
            event.results[
              event.results.length -
                1
            ]?.[0]?.transcript?.trim();

          if (
            transcript
          ) {
            setInput(
              input.trim()
                ? `${input.trim()} ${transcript}`
                : transcript,
            );
          }
        };

      recognition.onerror =
        () => {
          setIsListening(
            false,
          );
        };

      recognition.onend =
        () => {
          setIsListening(
            false,
          );
        };

      try {
        setIsListening(
          true,
        );

        recognition.start();
      } catch {
        setIsListening(
          false,
        );
      }
    };

  const [
    countryOptions,
    setCountryOptions,
  ] =
    useState<string[]>(
      [],
    );

  const countryValue =
    requirement?.fields.find(
      (field) =>
        normalize(
          field.id,
        ) ===
        "country",
    )?.value ?? "";

  const [
    cityOptions,
    setCityOptions,
  ] =
    useState<string[]>(
      [],
    );

  useEffect(() => {
    getCountries()
      .then(
        setCountryOptions,
      )
      .catch(
        () =>
          setCountryOptions(
            [],
          ),
      );
  }, []);

  useEffect(() => {
    if (!countryValue) {
      setCityOptions(
        [],
      );

      return;
    }

    getCitiesByCountry(
      countryValue,
    )
      .then(
        setCityOptions,
      )
      .catch(
        () =>
          setCityOptions(
            [],
          ),
      );
  }, [
    countryValue,
  ]);

  const attach = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const availableSlots =
      Math.max(
        0,
        20 - imageFiles.length,
      );
  
    const files =
      Array.from(
        event.target.files ?? [],
      ).slice(
        0,
        availableSlots,
      );
  
    if (files.length === 0) {
      event.target.value = "";
      return;
    }
  
    // Actual File objects backend upload ke liye.
    setImageFiles([
      ...imageFiles,
      ...files,
    ]);
  
    // Base64 sirf UI preview ke liye.
    Promise.all(
      files.map(
        (file) =>
          new Promise<string>(
            (resolve, reject) => {
              const reader =
                new FileReader();
  
              reader.onload = () => {
                if (
                  typeof reader.result ===
                  "string"
                ) {
                  resolve(
                    reader.result,
                  );
                } else {
                  reject();
                }
              };
  
              reader.onerror = () =>
                reject();
  
              reader.readAsDataURL(
                file,
              );
            },
          ),
      ),
    )
      .then((newImages) => {
        setImages(
          [
            ...images,
            ...newImages,
          ].slice(0, 20),
        );
      })
      .catch(() => {
        // Preview failure should not crash UI.
      });
  
    event.target.value = "";
  };

  const removeImage = (
    index: number,
  ) => {
    setImages(
      images.filter(
        (_, imageIndex) =>
          imageIndex !== index,
      ),
    );
  
    setImageFiles(
      imageFiles.filter(
        (_, imageIndex) =>
          imageIndex !== index,
      ),
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white p-6">

        <div className="flex justify-between">
          <div>
            <h2 className="text-xl font-black">
              Add Requirement
            </h2>

          </div>

          <button
            onClick={
              onClose
            }
          >
            <X />
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">

          <textarea
            rows={5}
            value={
              input
            }
            onChange={(
              event,
            ) =>
              setInput(
                event.target.value,
              )
            }
            placeholder="Mujhe Lahore mein laptop chahiye..."
            className="w-full resize-none bg-transparent p-2 outline-none"
          />

          {isListening && (
            <div className="mt-2 text-xs font-semibold text-red-600">
              Listening... bolain
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">

            <div className="flex gap-2">

              <input
                ref={
                  fileRef
                }
                type="file"
                accept="image/*"
                multiple
                onChange={
                  attach
                }
                className="hidden"
              />

              <button
                type="button"
                onClick={() =>
                  fileRef.current?.click()
                }
                className="rounded-xl p-2 text-slate-500 hover:bg-white"
              >
                <Paperclip />
              </button>

              <button
                type="button"
                onClick={
                  startVoiceInput
                }
                className={`rounded-xl p-2 transition ${
                  isListening
                    ? "bg-red-50 text-red-600"
                    : "text-slate-500 hover:bg-white"
                }`}
                title={
                  isListening
                    ? "Listening..."
                    : "Voice input"
                }
              >
                <Mic
                  className={
                    isListening
                      ? "animate-pulse"
                      : ""
                  }
                />
              </button>
            </div>

            <button
              type="button"
              onClick={
                onGenerate
              }
              disabled={
                !input.trim()
              }
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white ${
                input.trim()
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "cursor-not-allowed bg-slate-300"
              }`}
            >
              <Sparkles
                size={15}
              />

              Generate
            </button>
          </div>
        </div>

        {requirement && (
          <div className="mt-6 rounded-2xl border border-slate-200 p-5">

            <h3 className="text-lg font-black">
              {
                requirement.title
              }
            </h3>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {requirement.fields
                .filter(
                  (field) =>
                    !normalize(
                      field.id,
                    ).startsWith(
                      "image",
                    ),
                )
                .map(
                (
                  field,
                ) => (
                  <div
                    key={
                      field.id
                    }
                  >
                    <span className="mb-1 block text-xs font-bold text-slate-500">
                      {
                        field.label
                      }

                      {field.required && (
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      )}
                    </span>

                    {normalize(
                      field.id,
                    ) ===
                    "country" ? (
                      <select
                        value={
                          field.value
                        }
                        onChange={(
                          event,
                        ) => {
                          onFieldChange(
                            field.id,
                            event.target.value,
                          );

                          const cityField =
                            requirement.fields.find(
                              (
                                item,
                              ) =>
                                normalize(
                                  item.id,
                                ) ===
                                "city",
                            );

                          if (
                            cityField
                          ) {
                            onFieldChange(
                              cityField.id,
                              "",
                            );
                          }
                        }}
                        className={`w-full rounded-xl border bg-white px-3 py-3 outline-none ${
                          isFieldMissing(
                            field,
                          )
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-slate-200 focus:border-blue-500"
                        }`}
                      >
                        <option value="">
                          Select Country
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
                    ) : normalize(
                        field.id,
                      ) ===
                      "city" ? (
                      <select
                        value={
                          field.value
                        }
                        onChange={(
                          event,
                        ) =>
                          onFieldChange(
                            field.id,
                            event.target.value,
                          )
                        }
                        disabled={
                          !countryValue
                        }
                        className={`w-full rounded-xl border bg-white px-3 py-3 outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                          isFieldMissing(
                            field,
                          )
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-slate-200 focus:border-blue-500"
                        }`}
                      >
                        <option value="">
                          {countryValue
                            ? "Select City"
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
                    ) : normalize(
                        field.id,
                      ) ===
                      "budget" ? (
                      <BudgetRangeInput
                        value={field.value}
                        onChange={(value) =>
                          onFieldChange(
                            field.id,
                            value,
                          )
                        }
                      />
                    ) : (
                      <input
                        value={
                          field.value
                        }
                        onChange={(
                          event,
                        ) =>
                          onFieldChange(
                            field.id,
                            event.target.value,
                          )
                        }
                        className={`w-full rounded-xl border px-3 py-3 outline-none ${
                          isFieldMissing(
                            field,
                          )
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-slate-200 focus:border-blue-500"
                        }`}
                      />
                    )}

                    {isFieldMissing(
                      field,
                    ) && (
                      <p className="mt-1.5 text-xs font-semibold text-red-500">
                        {field.label} is required.
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600">
                  Requirement Images
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <span className="text-xs text-slate-400">
                  {images.length}/5
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  fileRef.current?.click()
                }
                className={`flex min-h-28 w-full items-center justify-center rounded-2xl border-2 border-dashed p-4 transition ${
                  imageMissing
                    ? "border-red-400 bg-red-50"
                    : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"
                }`}
              >
                <div className="text-center">
                  <Paperclip
                    size={25}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-2 text-sm font-bold text-slate-700">
                    Images upload karein
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Maximum 5 images — JPG, PNG, WEBP
                  </p>
                </div>
              </button>

              {imageMissing && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">
                  Kam az kam 1 requirement image required hai.
                </p>
              )}

              {images.length >
                0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map(
                    (
                      image,
                      index,
                    ) => (
                      <div
                        key={index}
                        className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <img
                          src={image}
                          alt={`Requirement ${index + 1}`}
                          className="h-28 w-full object-cover"
                        />

                        {index ===
                          0 && (
                          <span className="absolute bottom-2 left-2 rounded-full bg-slate-950/75 px-2 py-1 text-[10px] font-bold text-white">
                            Cover
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(
                              index,
                            )
                          }
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/75 text-white"
                          title="Remove image"
                        >
                          <X
                            size={14}
                          />
                        </button>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setShowValidation(
                  true,
                );

                onSubmit();
              }}
              className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3 font-bold text-white"
            >
              {submitting ? "Submitting..." : "Submit Requirement"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatRangeValue(
  value: number,
) {
  if (value >= 10_000_000) {
    return `PKR ${(value / 10_000_000).toFixed(value % 10_000_000 === 0 ? 0 : 1)} Cr`;
  }

  if (value >= 100_000) {
    return `PKR ${(value / 100_000).toFixed(value % 100_000 === 0 ? 0 : 1)} Lac`;
  }

  if (value >= 1_000) {
    return `PKR ${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  }

  return `PKR ${value.toLocaleString()}`;
}

function BudgetRangeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const parseRange = (
    raw: string,
  ) => {
    const parts =
      raw
        .split(/\s+-\s+/)
        .map((part) =>
          parseBudgetAmount(part),
        )
        .filter(
          (amount): amount is number =>
            amount != null,
        );

    return {
      min:
        parts.length >= 2
          ? Math.min(parts[0], parts[1])
          : 0,
      max:
        parts.length >= 2
          ? Math.max(parts[0], parts[1])
          : parts.length === 1
            ? parts[0]
            : MAX_RANGE,
    };
  };

  const initial =
    parseRange(value);

  const [minBudget, setMinBudget] =
    useState(initial.min);

  const [maxBudget, setMaxBudget] =
    useState(initial.max);

  useEffect(() => {
    const next =
      parseRange(value);

    setMinBudget(next.min);
    setMaxBudget(next.max);
  }, [value]);

  const update = (
    nextMin: number,
    nextMax: number,
  ) => {
    const safeMin =
      Math.max(
        0,
        Math.min(
          nextMin,
          nextMax,
          MAX_RANGE,
        ),
      );

    const safeMax =
      Math.min(
        MAX_RANGE,
        Math.max(
          nextMax,
          safeMin,
        ),
      );

    setMinBudget(safeMin);
    setMaxBudget(safeMax);

    onChange(
      `${formatRangeValue(safeMin)} - ${formatRangeValue(safeMax)}`,
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 grid grid-cols-2 gap-2">
        <label>
          <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
            Min Price
          </span>
          <input
            type="number"
            min={0}
            max={maxBudget}
            step={1000}
            value={minBudget}
            onChange={(event) =>
              update(
                Number(event.target.value) || 0,
                maxBudget,
              )
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold outline-none focus:border-blue-500"
          />
        </label>

        <label>
          <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
            Max Price
          </span>
          <input
            type="number"
            min={minBudget}
            max={MAX_RANGE}
            step={1000}
            value={maxBudget}
            onChange={(event) =>
              update(
                minBudget,
                Number(event.target.value) || 0,
              )
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold outline-none focus:border-blue-500"
          />
        </label>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3 text-xs font-bold text-slate-700">
        <span>{formatRangeValue(minBudget)}</span>
        <span>{formatRangeValue(maxBudget)}</span>
      </div>

      <div className="relative h-7">
        <div className="absolute left-0 right-0 top-3 h-1.5 rounded-full bg-slate-200" />

        <div
          className="absolute top-3 h-1.5 rounded-full bg-blue-600"
          style={{
            left: `${(minBudget / MAX_RANGE) * 100}%`,
            right: `${100 - (maxBudget / MAX_RANGE) * 100}%`,
          }}
        />

        <input
          type="range"
          min={0}
          max={MAX_RANGE}
          step={100_000}
          value={minBudget}
          onChange={(event) =>
            update(
              Number(event.target.value),
              maxBudget,
            )
          }
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
            [&::-webkit-slider-thumb]:bg-white"
        />

        <input
          type="range"
          min={0}
          max={MAX_RANGE}
          step={100_000}
          value={maxBudget}
          onChange={(event) =>
            update(
              minBudget,
              Number(event.target.value),
            )
          }
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
            [&::-webkit-slider-thumb]:bg-white"
        />
      </div>
    </div>
  );
}

function parseBudgetAmount(
  value: string,
): number | null {
  const normalized =
    value
      .toLowerCase()
      .replace(/,/g, "")
      .replace(/pkr/g, "")
      .trim();

  const match =
    normalized.match(
      /(\d+(?:\.\d+)?)\s*(cr|crore|lac|lakh|k)?/,
    );

  if (!match) {
    return null;
  }

  const amount =
    Number(match[1]);

  const unit =
    match[2] ?? "";

  if (unit === "cr" || unit === "crore") {
    return Math.round(amount * 10_000_000);
  }

  if (unit === "lac" || unit === "lakh") {
    return Math.round(amount * 100_000);
  }

  if (unit === "k") {
    return Math.round(amount * 1_000);
  }

  return Math.round(amount);
}
