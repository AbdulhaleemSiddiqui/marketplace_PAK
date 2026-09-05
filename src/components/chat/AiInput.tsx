import { useMemo, useRef, useState } from "react";
import {
  Image,
  MapPin,
  Mic,
  Paperclip,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

interface AiInputProps {
  role: "buyer" | "seller";
  onSend: (text: string) => void;
}

interface MockSeller {
  id: number;
  name: string;
  businessName: string;
  category: string;
  location: string;
  rating: number;
  verified: boolean;
  products: string[];
  keywords: string[];
}

const mockSellers: MockSeller[] = [
  {
    id: 1,
    name: "Ahmed Khan",
    businessName: "Tech Zone Karachi",
    category: "Electronics",
    location: "Karachi",
    rating: 4.9,
    verified: true,

    products: [
      "Dell Latitude Laptops",
      "Core i7 Laptops",
      "Used Business Laptops",
    ],

    keywords: [
      "dell",
      "laptop",
      "i7",
      "core i7",
      "16gb",
      "512",
      "ssd",
      "used",
      "karachi",
      "electronics",
    ],
  },

  {
    id: 2,
    name: "Usman Ali",
    businessName: "Pak Laptop House",
    category: "Electronics",
    location: "Karachi",
    rating: 4.7,
    verified: true,

    products: [
      "Dell Laptops",
      "HP Laptops",
      "Used Laptops",
    ],

    keywords: [
      "dell",
      "hp",
      "laptop",
      "used",
      "16gb",
      "8gb",
      "karachi",
    ],
  },

  {
    id: 3,
    name: "Bilal Ahmed",
    businessName: "Computer Point",
    category: "Electronics",
    location: "Lahore",
    rating: 4.5,
    verified: true,

    products: [
      "Gaming Laptops",
      "Dell & Lenovo",
      "SSD Upgrades",
    ],

    keywords: [
      "dell",
      "lenovo",
      "laptop",
      "ssd",
      "512",
      "gaming",
      "lahore",
    ],
  },

  {
    id: 4,
    name: "Saad Traders",
    businessName: "Saad Computers",
    category: "Electronics",
    location: "Karachi",
    rating: 4.4,
    verified: false,

    products: [
      "Used Dell Laptops",
      "Office Laptops",
    ],

    keywords: [
      "dell",
      "laptop",
      "used",
      "office",
      "karachi",
    ],
  },

  {
    id: 5,
    name: "Hassan Electronics",
    businessName: "Digital Market",
    category: "Electronics",
    location: "Islamabad",
    rating: 4.8,
    verified: true,

    products: [
      "New Laptops",
      "MacBook",
      "HP EliteBook",
    ],

    keywords: [
      "laptop",
      "new",
      "macbook",
      "hp",
      "islamabad",
    ],
  },
];

export default function AiInput({
  role,
  onSend,
}: AiInputProps) {
  const [text, setText] = useState("");

  const [listening, setListening] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  // =====================================================
  // LIVE SELLER MATCHING
  // =====================================================

  const matchingSellers = useMemo(() => {
    if (
      role !== "buyer" ||
      text.trim().length < 3
    ) {
      return [];
    }

    const words = text
      .toLowerCase()
      .replace(/[,.]/g, " ")
      .split(" ")
      .filter((word) => word.length > 1);

    const sellerScores = mockSellers.map(
      (seller) => {
        let score = 0;

        seller.keywords.forEach(
          (keyword) => {
            const keywordLower =
              keyword.toLowerCase();

            if (
              text
                .toLowerCase()
                .includes(keywordLower)
            ) {
              score += 4;
            }

            words.forEach((word) => {
              if (
                keywordLower.includes(word)
              ) {
                score += 1;
              }
            });
          }
        );

        return {
          seller,
          score,
        };
      }
    );

    return sellerScores
      .filter((item) => item.score > 0)
      .sort(
        (a, b) => b.score - a.score
      )
      .slice(0, 3);
  }, [text, role]);

  // =====================================================
  // GENERATE REQUIREMENT
  // =====================================================

  const handleGenerateRequirement = () => {
    const message = text.trim();

    if (!message) {
      return;
    }

    onSend(message);
  };

  // =====================================================
  // MOCK MIC
  // =====================================================

  const handleVoiceClick = () => {
    if (listening) {
      return;
    }

    setListening(true);

    setTimeout(() => {
      const buyerText =
        "Mujhe Dell laptop chahiye Core i7, 16GB RAM, 512GB SSD, used condition mein, budget 150k tak aur Karachi mein.";

      const sellerText =
        "Mere paas Dell Core i7 laptop hai, 16GB RAM, 512GB SSD, used condition mein, price 140k hai aur Karachi mein available hai.";

      setText(
        role === "buyer"
          ? buyerText
          : sellerText
      );

      setListening(false);
    }, 1500);
  };

  return (
    <div className="w-full">
      {/* MAIN CHAT BOX */}

      <div
        className="
          rounded-[28px]
          border
          border-slate-200
          bg-white
          p-3
          shadow-xl
          shadow-slate-200/60
        "
      >
        <div className="relative">
          <textarea
            value={text}
            onChange={(event) =>
              setText(event.target.value)
            }
            rows={6}
            placeholder={
              role === "buyer"
                ? "Mujhe kya chahiye? Example: Karachi mein Dell laptop chahiye..."
                : "Aap kya sell karna chahte hain? Product details bataein..."
            }
            className="
              min-h-[180px]
              w-full
              resize-none
              rounded-[22px]
              bg-slate-50
              px-5
              py-5
              text-base
              leading-7
              text-slate-900
              outline-none
              placeholder:text-slate-400
              focus:bg-white
            "
          />

          {listening && (
            <div
              className="
                absolute
                bottom-4
                left-5
                flex
                items-center
                gap-2
                rounded-full
                bg-red-50
                px-3
                py-1.5
                text-xs
                font-semibold
                text-red-600
              "
            >
              <span
                className="
                  h-2
                  w-2
                  animate-pulse
                  rounded-full
                  bg-red-500
                "
              />

              Listening...
            </div>
          )}
        </div>

        {/* BOTTOM TOOLBAR */}

        <div
          className="
            mt-2
            flex
            flex-wrap
            items-center
            justify-between
            gap-3
            px-2
            pb-1
          "
        >
          {/* LEFT */}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                text-slate-500
                transition
                hover:bg-slate-100
                hover:text-blue-600
              "
              title="Attach File"
            >
              <Paperclip size={19} />
            </button>

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                text-slate-500
                transition
                hover:bg-slate-100
                hover:text-blue-600
              "
              title="Upload Image"
            >
              <Image size={19} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              multiple
              className="hidden"
            />
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-2">
            <div
              className="
                mr-1
                hidden
                items-center
                gap-1.5
                text-xs
                text-slate-400
                md:flex
              "
            >
              <Sparkles
                size={14}
                className="text-blue-500"
              />

              AI will understand your requirement
            </div>

            {/* MIC */}

            <button
              type="button"
              onClick={handleVoiceClick}
              className={`
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border
                transition

                ${
                  listening
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
                }
              `}
              title="Speak"
            >
              <Mic size={19} />
            </button>

            {/* GENERATE REQUIREMENT */}

            <button
              type="button"
              onClick={
                handleGenerateRequirement
              }
              disabled={!text.trim()}
              className="
                flex
                h-11
                items-center
                gap-2
                rounded-xl
                bg-slate-950
                px-5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-blue-600
                disabled:cursor-not-allowed
                disabled:bg-slate-200
                disabled:text-slate-400
              "
            >
              <Sparkles size={16} />

              {role === "buyer"
                ? "Generate Req"
                : "Generate Listing"}
            </button>
          </div>
        </div>
      </div>

      {/* LIVE MATCHED SELLERS */}

      {role === "buyer" &&
        matchingSellers.length > 0 && (
          <div className="mt-5">
            <div
              className="
                mb-3
                flex
                items-center
                justify-between
              "
            >
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Matching Sellers
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Aapki typing ke according
                  possible sellers
                </p>
              </div>

              <span
                className="
                  rounded-full
                  bg-blue-50
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  text-blue-600
                "
              >
                {
                  matchingSellers.length
                }{" "}
                matches
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {matchingSellers.map(
                ({ seller }) => (
                  <div
                    key={seller.id}
                    className="
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      p-4
                      shadow-sm
                      transition
                      hover:-translate-y-0.5
                      hover:border-blue-200
                      hover:shadow-md
                    "
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">
                            {
                              seller.businessName
                            }
                          </p>

                          {seller.verified && (
                            <ShieldCheck
                              size={16}
                              className="text-blue-500"
                            />
                          )}
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                          {seller.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                        <Star
                          size={14}
                          className="fill-current"
                        />

                        {seller.rating}
                      </div>
                    </div>

                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        gap-1.5
                        text-xs
                        text-slate-500
                      "
                    >
                      <MapPin size={14} />

                      {seller.location}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {seller.products
                        .slice(0, 2)
                        .map((product) => (
                          <span
                            key={product}
                            className="
                              rounded-full
                              bg-slate-100
                              px-2.5
                              py-1
                              text-[11px]
                              text-slate-600
                            "
                          >
                            {product}
                          </span>
                        ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
    </div>
  );
}