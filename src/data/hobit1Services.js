// Hobit1 — Service catalogue for Nashik, Maharashtra.
// Structure: Category → Sub-category → Service items.
//
// ─────────────────────────────────────────────────────────────────────────────
// PRICES — ALL PLACEHOLDERS. NOT FINAL.
// Every price on the website comes from this one block.
// `null` = not decided yet → the site shows "Price TBA".
// Fill in the real Nashik price in rupees (number only, e.g. 1499).
// For "inspection" services the price is the inspection visit charge;
// the final job price is quoted after the visit.
// ─────────────────────────────────────────────────────────────────────────────
export const PLACEHOLDER_PRICES = {
  // Deep Cleaning
  "dc-home-1bhk-furnished": null,
  "dc-home-1bhk-unfurnished": null,
  "dc-home-2bhk-furnished": null,
  "dc-home-2bhk-unfurnished": null,
  "dc-home-3bhk-furnished": null,
  "dc-home-3bhk-unfurnished": null,
  "dc-home-4bhk-furnished": null,
  "dc-home-4bhk-unfurnished": null,
  "dc-bath-1": null,
  "dc-bath-2": null,
  "dc-bath-3": null,
  "dc-kitchen-full": null,
  "dc-kitchen-chimney": null,
  "dc-kitchen-cabinet": null,
  "dc-sofa-seat": null, // per seat
  "dc-carpet-sqft": null, // per sq.ft
  "dc-mattress": null, // per mattress
  "dc-move-in-out": null,
  "dc-post-construction": null, // per sq.ft
  "dc-water-tank": null, // per tank

  // Pest Control
  "pc-general-1bhk": null,
  "pc-general-2bhk": null,
  "pc-general-3bhk": null,
  "pc-general-4bhk": null,
  "pc-termite-dfs": null, // inspection charge
  "pc-termite-inspection": null, // inspection charge
  "pc-bedbug-1bhk": null,
  "pc-bedbug-2bhk": null,
  "pc-bedbug-3bhk": null,
  "pc-mosquito-fogging": null,
  "pc-rodent-baiting": null,
  "pc-amc-home-3": null, // per year
  "pc-amc-home-4": null, // per year
  "pc-amc-shop": null, // inspection charge
  "pc-amc-society": null, // inspection charge

  // Painter
  "pt-full-1bhk": null, // inspection charge
  "pt-full-2bhk": null, // inspection charge
  "pt-full-3bhk": null, // inspection charge
  "pt-full-4bhk": null, // inspection charge
  "pt-room-single": null,
  "pt-room-wall": null,
  "pt-room-ceiling": null,
  "pt-ext-building": null, // inspection charge
  "pt-ext-bungalow": null, // inspection charge
  "pt-wp-terrace": null, // inspection charge
  "pt-wp-bathroom": null, // inspection charge
  "pt-wp-seepage": null, // inspection charge
  "pt-tx-texture": null, // per sq.ft
  "pt-tx-wallpaper": null, // per sq.ft
  "pt-tx-door-polish": null, // per door
  "pt-tx-furniture-polish": null, // per piece

  // Electrician
  "el-switch": null, // per switch
  "el-socket": null, // per socket
  "el-switchboard": null, // per board
  "el-fan-install": null,
  "el-fan-uninstall": null,
  "el-fan-repair": null,
  "el-fan-regulator": null,
  "el-light-tube": null, // per light
  "el-light-led": null, // per light
  "el-light-decorative": null, // per light
  "el-wiring-new": null, // inspection charge
  "el-wiring-faulty": null, // inspection charge
  "el-wiring-mcb": null,
  "el-wiring-inverter": null,
  "el-app-geyser": null,
  "el-app-tv": null,
  "el-app-doorbell": null,
  "el-app-exhaust": null,

  // Plumber
  "pl-tap-repair": null, // per tap
  "pl-tap-replace": null, // per tap
  "pl-tap-mixer": null,
  "pl-tap-leak": null,
  "pl-bath-basin": null,
  "pl-bath-shower": null,
  "pl-bath-flush": null,
  "pl-bath-wc": null,
  "pl-block-drain": null,
  "pl-block-sink": null,
  "pl-block-toilet": null,
  "pl-tank-install": null,
  "pl-tank-motor": null,
  "pl-tank-pipeline": null, // per running ft
  "pl-pipe-leak": null, // inspection charge
  "pl-pipe-new": null, // inspection charge
  "pl-pipe-concealed": null, // inspection charge

  // Carpenter
  "cp-door-lock": null, // per lock
  "cp-door-hinges": null, // per door
  "cp-door-repair": null,
  "cp-door-window": null, // per window
  "cp-fr-bed": null,
  "cp-fr-wardrobe": null,
  "cp-fr-channel": null, // per drawer
  "cp-fr-chair-table": null, // per piece
  "cp-as-furniture": null, // per item
  "cp-as-tv-unit": null,
  "cp-as-bed": null,
  "cp-in-curtain": null, // per rod
  "cp-in-shelf": null, // per shelf
  "cp-in-hanging": null, // per item
  "cp-in-cabinet": null, // per cabinet
  "cp-custom-modular": null, // inspection charge
  "cp-custom-wardrobe": null, // inspection charge
  "cp-custom-ceiling": null, // inspection charge
};

// Pricing types shown in the existing price UI.
export const PRICE_TYPES = {
  fixed: "fixed", // Fixed price
  perUnit: "perUnit", // Per unit / per sq.ft
  inspection: "inspection", // Inspection + quote
};

const item = (id, name, description, priceType, unit = null) => ({
  id,
  name,
  description,
  priceType,
  unit,
  price: PLACEHOLDER_PRICES[id] ?? null,
});

const F = PRICE_TYPES.fixed;
const U = PRICE_TYPES.perUnit;
const I = PRICE_TYPES.inspection;

export const hobit1Categories = [
  // ───────────────────────────── 1. DEEP CLEANING ─────────────────────────────
  {
    slug: "deep-cleaning",
    name: "Deep Cleaning",
    image: "/services/Scrubbing.png",
    icon: "/home.png",
    subCategories: [
      {
        name: "Full Home Deep Cleaning",
        icon: "/home.png",
        duration: "4–10 hrs (by home size)",
        included: [
          "Dusting of all rooms, fans, lights and switchboards",
          "Floor scrubbing and mopping",
          "Kitchen and bathroom deep clean",
          "Windows, grills and door cleaning",
          "Cleaning materials and machines",
        ],
        excluded: [
          "Wall washing or paint touch-up",
          "Utensil washing",
          "Inside of electronics",
        ],
        faqs: [
          { q: "What is the difference between furnished and unfurnished?", a: "Furnished homes take longer because the team cleans around and under furniture. Unfurnished is ideal for empty or newly rented homes." },
          { q: "Do I need to provide anything?", a: "Only water and electricity. Our team brings all materials and machines." },
          { q: "How many professionals will come?", a: "2–4 verified professionals, depending on your home size." },
        ],
        items: [
          item("dc-home-1bhk-furnished", "1 BHK – Furnished", "Complete deep clean of a furnished 1 BHK.", F),
          item("dc-home-1bhk-unfurnished", "1 BHK – Unfurnished", "Complete deep clean of an empty 1 BHK.", F),
          item("dc-home-2bhk-furnished", "2 BHK – Furnished", "Complete deep clean of a furnished 2 BHK.", F),
          item("dc-home-2bhk-unfurnished", "2 BHK – Unfurnished", "Complete deep clean of an empty 2 BHK.", F),
          item("dc-home-3bhk-furnished", "3 BHK – Furnished", "Complete deep clean of a furnished 3 BHK.", F),
          item("dc-home-3bhk-unfurnished", "3 BHK – Unfurnished", "Complete deep clean of an empty 3 BHK.", F),
          item("dc-home-4bhk-furnished", "4 BHK / Villa – Furnished", "Complete deep clean of a furnished 4 BHK or villa.", F),
          item("dc-home-4bhk-unfurnished", "4 BHK / Villa – Unfurnished", "Complete deep clean of an empty 4 BHK or villa.", F),
        ],
      },
      {
        name: "Bathroom Cleaning",
        icon: "/shower.png",
        duration: "1–3 hrs",
        included: [
          "Tile and grout scrubbing",
          "Hard-water stain removal on taps and fittings",
          "Toilet, wash basin and mirror cleaning",
          "Floor disinfection",
        ],
        excluded: ["Repair of fittings or leakage", "Acid wash of damaged tiles"],
        faqs: [
          { q: "Do you use acid?", a: "No. We use safe, bathroom-grade cleaners that do not damage tiles or fittings." },
          { q: "How long will it take?", a: "About 1 hour per bathroom." },
          { q: "Can I use the bathroom right after?", a: "Yes, once the floor is dry — usually within 15–20 minutes." },
        ],
        items: [
          item("dc-bath-1", "1 Bathroom", "Deep clean of one bathroom.", F),
          item("dc-bath-2", "2 Bathrooms", "Deep clean of two bathrooms.", F),
          item("dc-bath-3", "3 Bathrooms", "Deep clean of three bathrooms.", F),
        ],
      },
      {
        name: "Kitchen Cleaning",
        icon: "/kitchen.png",
        duration: "1–4 hrs",
        included: [
          "Degreasing of slab, tiles and stove area",
          "Sink and tap cleaning",
          "Outside of appliances",
          "Cabinet cleaning (inside and outside, when emptied)",
        ],
        excluded: ["Utensil washing", "Inside of fridge or oven", "Chimney repair"],
        faqs: [
          { q: "Should I empty the cabinets?", a: "Yes, please empty cabinets before the visit for inside cleaning." },
          { q: "Is chimney cleaning part of full kitchen cleaning?", a: "No. Chimney cleaning is a separate service you can add." },
          { q: "Are the cleaners food-safe?", a: "Yes. We use food-safe degreasers in all kitchen areas." },
        ],
        items: [
          item("dc-kitchen-full", "Full Kitchen Deep Clean", "Complete degreasing and cleaning of the kitchen.", F),
          item("dc-kitchen-chimney", "Chimney Cleaning", "Filter and hood degreasing of your kitchen chimney.", F),
          item("dc-kitchen-cabinet", "Cabinet Cleaning", "Inside and outside cleaning of kitchen cabinets.", F),
        ],
      },
      {
        name: "Sofa & Carpet Cleaning",
        icon: "/sofa-cleaning.png",
        duration: "1–3 hrs",
        included: [
          "Dry vacuuming",
          "Shampoo wash with machine",
          "Stain treatment",
          "Extraction for faster drying",
        ],
        excluded: ["Leather restoration", "Permanent or old stain guarantee"],
        faqs: [
          { q: "How long does it take to dry?", a: "Usually 4–6 hours, depending on fabric and ventilation." },
          { q: "Can all stains be removed?", a: "Most fresh stains come out. Very old or dye stains may only lighten." },
          { q: "How is the price calculated?", a: "Sofa per seat, carpet per sq.ft, mattress per piece." },
        ],
        items: [
          item("dc-sofa-seat", "Sofa Shampoo", "Machine shampoo cleaning of fabric sofa.", U, "per seat"),
          item("dc-carpet-sqft", "Carpet Cleaning", "Shampoo and extraction cleaning of carpets.", U, "per sq.ft"),
          item("dc-mattress", "Mattress Cleaning", "Vacuum and shampoo cleaning of mattress.", U, "per mattress"),
        ],
      },
      {
        name: "Specialised Cleaning",
        icon: "/home.png",
        duration: "3–10 hrs",
        included: [
          "Full home cleaning for empty homes",
          "Paint, cement and dust removal after work",
          "Water tank emptying, scrubbing and disinfection",
        ],
        excluded: ["Debris or waste removal from site", "Tank repair"],
        faqs: [
          { q: "When should I book move-in cleaning?", a: "Book it before your furniture arrives for the best result." },
          { q: "Do you remove construction debris?", a: "No. Please clear heavy debris first. We remove dust, paint and cement marks." },
          { q: "How often should a water tank be cleaned?", a: "Every 6 months is recommended." },
        ],
        items: [
          item("dc-move-in-out", "Move-in / Move-out Cleaning", "Full clean of an empty home before you move in or out.", F),
          item("dc-post-construction", "Post-construction / Post-painting Cleaning", "Removes paint, cement and dust after work.", U, "per sq.ft"),
          item("dc-water-tank", "Water Tank Cleaning", "Emptying, scrubbing and disinfection of water tank.", U, "per tank"),
        ],
      },
    ],
  },

  // ───────────────────────────── 2. PEST CONTROL ──────────────────────────────
  {
    slug: "pest-control",
    name: "Pest Control",
    image: "/services/pest-contro.png",
    icon: "/pest-control.png",
    subCategories: [
      {
        name: "General Pest Control",
        icon: "/pest-control.png",
        duration: "1–2 hrs",
        included: [
          "Gel and spray treatment for cockroaches",
          "Treatment for ants and spiders",
          "Kitchen, bathrooms and all rooms",
          "Odourless, family-safe chemicals",
        ],
        excluded: ["Termite or bed bug treatment", "Furniture shifting"],
        faqs: [
          { q: "Do I need to leave the house?", a: "No. The treatment is odourless. Just keep kids and pets away for 1–2 hours." },
          { q: "When will I see results?", a: "Most activity drops within 3–7 days." },
          { q: "How often should I do it?", a: "Every 3–4 months, or take an AMC plan." },
        ],
        items: [
          item("pc-general-1bhk", "1 BHK", "Cockroach, ant and spider control for 1 BHK.", F),
          item("pc-general-2bhk", "2 BHK", "Cockroach, ant and spider control for 2 BHK.", F),
          item("pc-general-3bhk", "3 BHK", "Cockroach, ant and spider control for 3 BHK.", F),
          item("pc-general-4bhk", "4 BHK / Villa", "Cockroach, ant and spider control for 4 BHK or villa.", F),
        ],
      },
      {
        name: "Termite Control",
        icon: "/pest-control.png",
        duration: "Inspection 30 min; treatment 3–8 hrs",
        included: [
          "Site inspection and written quote",
          "Drill, fill and seal treatment",
          "Treatment of wooden furniture and frames",
        ],
        excluded: ["Repair of damaged wood", "Furniture replacement"],
        faqs: [
          { q: "Why is inspection needed?", a: "Termite spread differs in every home. The expert checks the area and gives an exact quote." },
          { q: "Will there be holes in the wall?", a: "Small holes are drilled and sealed neatly after treatment." },
          { q: "Is it safe for my family?", a: "Yes. We use approved chemicals and follow safety steps." },
        ],
        items: [
          item("pc-termite-dfs", "Drill-Fill-Seal Treatment", "Full anti-termite treatment for walls and wood.", I),
          item("pc-termite-inspection", "Inspection + Treatment", "Expert inspection, quote and termite treatment.", I),
        ],
      },
      {
        name: "Bed Bug Control",
        icon: "/pest-control.png",
        duration: "1–2 hrs per visit",
        included: [
          "2 visits about 15 days apart",
          "Treatment of beds, mattresses and sofas",
          "Crack and crevice treatment",
        ],
        excluded: ["Mattress replacement", "Laundry of bed linen"],
        faqs: [
          { q: "Why two visits?", a: "The second visit kills bugs that hatch from eggs after the first visit." },
          { q: "How should I prepare?", a: "Wash bed linen in hot water and clear items from under the bed." },
          { q: "Can I sleep on the bed the same day?", a: "Yes, after 4–5 hours with good ventilation." },
        ],
        items: [
          item("pc-bedbug-1bhk", "1 BHK", "2-visit bed bug treatment for 1 BHK.", F),
          item("pc-bedbug-2bhk", "2 BHK", "2-visit bed bug treatment for 2 BHK.", F),
          item("pc-bedbug-3bhk", "3 BHK", "2-visit bed bug treatment for 3 BHK.", F),
        ],
      },
      {
        name: "Mosquito & Rodent Control",
        icon: "/pest-control.png",
        duration: "1–2 hrs",
        included: [
          "Fogging of indoor and outdoor areas",
          "Rodent bait stations at entry points",
          "Advice on blocking entry points",
        ],
        excluded: ["Sealing or civil work", "Dead rodent removal after the visit"],
        faqs: [
          { q: "How long does fogging work?", a: "It reduces mosquitoes for about 2–3 weeks, depending on surroundings." },
          { q: "Is rodent bait safe for pets?", a: "Bait is placed in closed stations out of reach of pets." },
          { q: "Can societies book this?", a: "Yes. For large areas, choose an AMC plan for societies." },
        ],
        items: [
          item("pc-mosquito-fogging", "Mosquito Fogging", "Fogging treatment for home and surroundings.", F),
          item("pc-rodent-baiting", "Rodent Baiting", "Bait stations to control rats and mice.", F),
        ],
      },
      {
        name: "AMC Plans",
        icon: "/pest-control.png",
        duration: "3 or 4 visits per year",
        included: [
          "Scheduled visits through the year",
          "General pest control on each visit",
          "Free extra visit if pests return between visits",
        ],
        excluded: ["Termite and bed bug treatment", "Civil or repair work"],
        faqs: [
          { q: "What is an AMC?", a: "An Annual Maintenance Contract — fixed visits through the year at one price." },
          { q: "Who can take an AMC?", a: "Homes, shops, offices and housing societies." },
          { q: "How is a society AMC priced?", a: "After a site inspection, based on area and number of units." },
        ],
        items: [
          item("pc-amc-home-3", "Home AMC – 3 Visits / Year", "3 general pest control visits in a year.", F),
          item("pc-amc-home-4", "Home AMC – 4 Visits / Year", "4 general pest control visits in a year.", F),
          item("pc-amc-shop", "Shop / Office AMC", "3 or 4 yearly visits for shops and offices.", I),
          item("pc-amc-society", "Housing Society AMC", "3 or 4 yearly visits for common areas of societies.", I),
        ],
      },
    ],
  },

  // ──────────────────────────────── 3. PAINTER ────────────────────────────────
  {
    slug: "painter",
    name: "Painter",
    image: "/services/painter.png",
    icon: "/painter.png",
    subCategories: [
      {
        name: "Full Home Painting",
        icon: "/painter.png",
        duration: "Inspection 30–45 min; painting 3–10 days",
        included: [
          "Free colour consultation",
          "Wall putty touch-up and sanding",
          "Primer and 2 coats of paint",
          "Furniture covering and post-work cleaning",
        ],
        excluded: ["Major wall repair or plastering", "Wood and metal polish (book separately)"],
        faqs: [
          { q: "Why do I need an inspection?", a: "Wall condition and area decide the final price. The expert measures and gives an exact quote." },
          { q: "Economy or premium paint — what is the difference?", a: "Premium paint lasts longer, is easier to wash and has a better finish." },
          { q: "Is paint included in the quote?", a: "Yes, the quote includes paint and labour for the chosen paint type." },
        ],
        items: [
          item("pt-full-1bhk", "1 BHK Interior Painting", "Economy or premium paint for a full 1 BHK.", I),
          item("pt-full-2bhk", "2 BHK Interior Painting", "Economy or premium paint for a full 2 BHK.", I),
          item("pt-full-3bhk", "3 BHK Interior Painting", "Economy or premium paint for a full 3 BHK.", I),
          item("pt-full-4bhk", "4 BHK / Villa Interior Painting", "Economy or premium paint for a 4 BHK or villa.", I),
        ],
      },
      {
        name: "Room / Wall Painting",
        icon: "/painter.png",
        duration: "1–2 days",
        included: [
          "Surface preparation and minor putty",
          "2 coats of paint",
          "Furniture covering and cleanup",
        ],
        excluded: ["Texture or wallpaper", "Seepage repair"],
        faqs: [
          { q: "Can I choose any colour?", a: "Yes. Pick from the shade card the painter brings." },
          { q: "Is the paint included?", a: "Yes, standard paint is included in the price." },
          { q: "When can I use the room?", a: "Usually the next day, once the paint has dried." },
        ],
        items: [
          item("pt-room-single", "Single Room", "Walls of one room painted fresh.", F),
          item("pt-room-wall", "Single Wall", "One accent or touch-up wall.", F),
          item("pt-room-ceiling", "Ceiling", "Ceiling painting for one room.", F),
        ],
      },
      {
        name: "Exterior Painting",
        icon: "/painter.png",
        duration: "Inspection 45 min; painting 5–15 days",
        included: [
          "Site inspection and quote",
          "Crack filling and surface prep",
          "Weather-proof exterior paint",
          "Scaffolding where needed",
        ],
        excluded: ["Structural repair", "Waterproofing (book separately)"],
        faqs: [
          { q: "Which season is best?", a: "Dry months, outside the monsoon, give the best finish." },
          { q: "Do you handle tall buildings?", a: "Yes. Scaffolding or rope access is planned during inspection." },
          { q: "How long does exterior paint last?", a: "Usually 5–7 years with good quality exterior paint." },
        ],
        items: [
          item("pt-ext-building", "Building Exterior", "Exterior painting for apartments and buildings.", I),
          item("pt-ext-bungalow", "Bungalow Exterior", "Exterior painting for bungalows and row houses.", I),
        ],
      },
      {
        name: "Waterproofing",
        icon: "/painter.png",
        duration: "Inspection 30–45 min; work 1–5 days",
        included: [
          "Leak and seepage inspection",
          "Surface cleaning and crack filling",
          "Waterproof coating or chemical treatment",
        ],
        excluded: ["Plumbing repair", "Re-tiling"],
        faqs: [
          { q: "Can you find the source of the leak?", a: "Yes. The expert inspects and explains the cause before quoting." },
          { q: "When should I do terrace waterproofing?", a: "Before the monsoon, in dry weather." },
          { q: "Will the wall be repainted?", a: "Touch-up of the treated area can be added to the quote." },
        ],
        items: [
          item("pt-wp-terrace", "Terrace Waterproofing", "Stops leaks from terrace to the ceiling below.", I),
          item("pt-wp-bathroom", "Bathroom Waterproofing", "Stops seepage from bathroom floors and walls.", I),
          item("pt-wp-seepage", "Wall Seepage Treatment", "Treats damp and peeling walls.", I),
        ],
      },
      {
        name: "Texture & Wood Polish",
        icon: "/painter.png",
        duration: "1–3 days",
        included: [
          "Texture or wallpaper application",
          "Sanding and polish for doors and furniture",
          "Cleanup after work",
        ],
        excluded: ["Wood repair or replacement", "Wall plastering"],
        faqs: [
          { q: "How is texture priced?", a: "Texture and wallpaper are priced per sq.ft of wall." },
          { q: "Can old furniture be polished?", a: "Yes. Old polish is sanded off before the new coat." },
          { q: "Can I choose the wallpaper design?", a: "Yes. The expert shows catalogue options." },
        ],
        items: [
          item("pt-tx-texture", "Texture Wall", "Designer texture finish for a feature wall.", U, "per sq.ft"),
          item("pt-tx-wallpaper", "Wallpaper", "Wallpaper fixing on walls.", U, "per sq.ft"),
          item("pt-tx-door-polish", "Door Polish", "Sanding and polish for wooden doors.", U, "per door"),
          item("pt-tx-furniture-polish", "Furniture Polish", "Polish for wooden furniture.", U, "per piece"),
        ],
      },
    ],
  },

  // ────────────────────────────── 4. ELECTRICIAN ──────────────────────────────
  {
    slug: "electrician",
    name: "Electrician",
    image: "/services/electrician.png",
    icon: "/electrician.png",
    subCategories: [
      {
        name: "Switch & Socket",
        icon: "/electrician.png",
        duration: "15–45 min",
        included: ["Removal of old switch or socket", "Installation and testing", "Safety check of the point"],
        excluded: ["Cost of new switch, socket or board", "New wiring to the point"],
        faqs: [
          { q: "Do I need to buy the switch?", a: "You can buy it, or the electrician can bring one at actual cost." },
          { q: "Is the price per switch?", a: "Yes, the price is per switch, socket or board." },
          { q: "Will power be switched off?", a: "Yes, only for the circuit being worked on, for safety." },
        ],
        items: [
          item("el-switch", "Switch Replace / Install", "Replace or install a switch.", U, "per switch"),
          item("el-socket", "Socket Replace / Install", "Replace or install a socket.", U, "per socket"),
          item("el-switchboard", "Switchboard Install / Repair", "Install or repair a switchboard.", U, "per board"),
        ],
      },
      {
        name: "Fan",
        icon: "/electrician.png",
        duration: "30–60 min",
        included: ["Installation or removal", "Basic repair and testing", "Regulator fitting"],
        excluded: ["Cost of new fan, regulator or parts", "Motor rewinding"],
        faqs: [
          { q: "Does repair include parts?", a: "No. Parts like capacitors are charged at actual cost." },
          { q: "Can you install any fan brand?", a: "Yes, any standard ceiling fan." },
          { q: "Is a hook needed?", a: "Yes. If there is no hook, the electrician will advise." },
        ],
        items: [
          item("el-fan-install", "Ceiling Fan Installation", "Fit and test a ceiling fan.", F),
          item("el-fan-uninstall", "Ceiling Fan Uninstallation", "Safe removal of a ceiling fan.", F),
          item("el-fan-repair", "Ceiling Fan Repair", "Fix noise, speed or wobble problems.", F),
          item("el-fan-regulator", "Regulator Replacement", "Replace a fan regulator.", F),
        ],
      },
      {
        name: "Lights",
        icon: "/electrician.png",
        duration: "20 min – 2 hrs",
        included: ["Fixing and wiring of light", "Testing after installation"],
        excluded: ["Cost of lights", "False-ceiling cutting"],
        faqs: [
          { q: "Can you install a heavy chandelier?", a: "Yes. The ceiling is checked for support first." },
          { q: "Is the price per light?", a: "Yes, the price is per light." },
          { q: "Do you remove old lights?", a: "Yes, removal of the old light is included." },
        ],
        items: [
          item("el-light-tube", "Tube Light Installation", "Install or replace a tube light.", U, "per light"),
          item("el-light-led", "LED / Panel Light Installation", "Install LED or panel lights.", U, "per light"),
          item("el-light-decorative", "Decorative Light / Chandelier", "Install decorative lights or a chandelier.", U, "per light"),
        ],
      },
      {
        name: "Wiring",
        icon: "/electrician.png",
        duration: "Inspection 30 min; work by quote",
        included: ["Fault finding and inspection", "Wiring work as per quote", "MCB, fuse and inverter work"],
        excluded: ["Cost of wires, MCB and inverter", "Wall plaster and paint after wiring"],
        faqs: [
          { q: "Why is wiring by inspection?", a: "The length and condition of wiring decide the price. The expert checks first." },
          { q: "My MCB keeps tripping — what should I book?", a: "Book MCB / Fuse Repair. The electrician will find the cause." },
          { q: "Do you install any inverter brand?", a: "Yes, standard home inverters and batteries." },
        ],
        items: [
          item("el-wiring-new", "New Wiring", "New wiring for rooms or full home.", I),
          item("el-wiring-faulty", "Faulty Wiring Repair", "Find and fix wiring faults.", I),
          item("el-wiring-mcb", "MCB / Fuse Repair", "Replace or repair MCB and fuse.", F),
          item("el-wiring-inverter", "Inverter Installation", "Install inverter and battery.", F),
        ],
      },
      {
        name: "Appliance Installation",
        icon: "/electrician.png",
        duration: "30–90 min",
        included: ["Mounting and connection", "Testing after installation"],
        excluded: ["Cost of appliance, brackets or pipes", "Plumbing work for geyser"],
        faqs: [
          { q: "Do you bring the TV wall mount?", a: "Please keep the bracket ready, or it can be bought at actual cost." },
          { q: "Is geyser plumbing included?", a: "Basic connection is included. New pipe work is extra." },
          { q: "Can you install an exhaust fan in glass?", a: "Yes, if the glass cutout is ready." },
        ],
        items: [
          item("el-app-geyser", "Geyser Installation", "Mount and connect a geyser.", F),
          item("el-app-tv", "TV Wall Mount", "Mount a TV on the wall.", F),
          item("el-app-doorbell", "Doorbell Installation", "Install a wired or wireless doorbell.", F),
          item("el-app-exhaust", "Exhaust Fan Installation", "Install an exhaust fan.", F),
        ],
      },
    ],
  },

  // ──────────────────────────────── 5. PLUMBER ────────────────────────────────
  {
    slug: "plumber",
    name: "Plumber",
    image: "/services/plumber.png",
    icon: "/plumber.png",
    subCategories: [
      {
        name: "Tap & Mixer",
        icon: "/plumber.png",
        duration: "20–60 min",
        included: ["Repair or replacement of tap", "Mixer fitting", "Leakage check"],
        excluded: ["Cost of new tap, mixer or parts", "Concealed pipe work"],
        faqs: [
          { q: "Do I need to buy the tap?", a: "You can buy it, or the plumber can bring one at actual cost." },
          { q: "Is the price per tap?", a: "Yes, tap repair and replacement are priced per tap." },
          { q: "What if the leak is inside the wall?", a: "That needs Pipe Work, which is by inspection and quote." },
        ],
        items: [
          item("pl-tap-repair", "Tap Repair", "Fix dripping or loose taps.", U, "per tap"),
          item("pl-tap-replace", "Tap Replacement", "Replace an old tap.", U, "per tap"),
          item("pl-tap-mixer", "Mixer Installation", "Install a hot and cold water mixer.", F),
          item("pl-tap-leak", "Leakage Repair", "Fix visible leaks at taps and joints.", F),
        ],
      },
      {
        name: "Bathroom Fittings",
        icon: "/plumber.png",
        duration: "30 min – 3 hrs",
        included: ["Installation or repair of fitting", "Sealing and testing"],
        excluded: ["Cost of fitting and parts", "Tiling or civil work"],
        faqs: [
          { q: "Can you fix a running flush?", a: "Yes. Book Flush Tank Repair." },
          { q: "Is WC installation one day?", a: "Usually yes, in 2–3 hours." },
          { q: "Are parts included?", a: "No. Parts are charged at actual cost." },
        ],
        items: [
          item("pl-bath-basin", "Wash Basin Install / Repair", "Install or repair a wash basin.", F),
          item("pl-bath-shower", "Shower Install / Repair", "Install or repair a shower.", F),
          item("pl-bath-flush", "Flush Tank Repair", "Fix running or weak flush.", F),
          item("pl-bath-wc", "WC Install / Repair", "Install or repair a western or Indian WC.", F),
        ],
      },
      {
        name: "Blockage",
        icon: "/plumber.png",
        duration: "30–90 min",
        included: ["Blockage removal with tools", "Flow check after work"],
        excluded: ["Pipe replacement", "Main sewer line blockage"],
        faqs: [
          { q: "Do you use chemicals?", a: "Mostly tools. Safe chemicals only when needed." },
          { q: "What if the pipe is damaged?", a: "The plumber will explain and quote for repair." },
          { q: "How fast can someone come?", a: "Choose the earliest slot in the app." },
        ],
        items: [
          item("pl-block-drain", "Drain Blockage", "Clear blocked floor or bathroom drains.", F),
          item("pl-block-sink", "Sink Blockage", "Clear blocked kitchen or basin sinks.", F),
          item("pl-block-toilet", "Toilet Blockage", "Clear blocked toilets.", F),
        ],
      },
      {
        name: "Water Tank & Motor",
        icon: "/plumber.png",
        duration: "1–4 hrs",
        included: ["Tank placement and connection", "Motor fitting and testing", "Pipeline connection"],
        excluded: ["Cost of tank, motor and pipes", "Civil platform work"],
        faqs: [
          { q: "Can you fit any motor?", a: "Yes, standard domestic water motors." },
          { q: "How is pipeline priced?", a: "Per running foot of pipe laid." },
          { q: "Is electrical connection included?", a: "Basic connection is included. New wiring is extra." },
        ],
        items: [
          item("pl-tank-install", "Water Tank Installation", "Install an overhead or loft tank.", F),
          item("pl-tank-motor", "Motor Fitting", "Fit and test a water motor.", F),
          item("pl-tank-pipeline", "Tank Pipeline", "Pipeline from tank or motor.", U, "per running ft"),
        ],
      },
      {
        name: "Pipe Work",
        icon: "/plumber.png",
        duration: "Inspection 30 min; work by quote",
        included: ["Leak finding and inspection", "Pipe repair or new pipeline as quoted"],
        excluded: ["Cost of pipes", "Tile and plaster restoration"],
        faqs: [
          { q: "Why is pipe work by inspection?", a: "The leak point and pipe length decide the price." },
          { q: "Do you break tiles for concealed pipes?", a: "Only where needed, after explaining it to you." },
          { q: "Which pipes do you use?", a: "CPVC, UPVC or PPR, as discussed in the quote." },
        ],
        items: [
          item("pl-pipe-leak", "Pipe Leakage", "Find and fix pipe leaks.", I),
          item("pl-pipe-new", "New Pipeline", "Lay a new water pipeline.", I),
          item("pl-pipe-concealed", "Concealed Pipe Work", "In-wall pipe repair or new lines.", I),
        ],
      },
    ],
  },

  // ─────────────────────────────── 6. CARPENTER ───────────────────────────────
  {
    slug: "carpenter",
    name: "Carpenter",
    image: "/services/carpenter.png",
    icon: "/carpenter.png",
    subCategories: [
      {
        name: "Door & Window",
        icon: "/carpenter.png",
        duration: "30–90 min",
        included: ["Repair, alignment or fitting", "Testing of lock and movement"],
        excluded: ["Cost of lock, hinges or parts", "New door or window"],
        faqs: [
          { q: "My door does not close properly — what should I book?", a: "Book Door Repair. The carpenter will fix alignment." },
          { q: "Do I need to buy the lock?", a: "You can buy it, or the carpenter can bring one at actual cost." },
          { q: "Do you repair aluminium sliders?", a: "Yes. Book Window / Slider Repair." },
        ],
        items: [
          item("cp-door-lock", "Door Lock Install / Repair", "Fix or install a door lock.", U, "per lock"),
          item("cp-door-hinges", "Hinges Replacement", "Replace door hinges.", U, "per door"),
          item("cp-door-repair", "Door Repair", "Fix jammed or misaligned doors.", F),
          item("cp-door-window", "Window / Slider Repair", "Repair windows and sliding channels.", U, "per window"),
        ],
      },
      {
        name: "Furniture Repair",
        icon: "/carpenter.png",
        duration: "30 min – 3 hrs",
        included: ["Repair of joints, panels and fittings", "Drawer channel replacement"],
        excluded: ["Cost of parts and boards", "Polish (book separately)"],
        faqs: [
          { q: "Can you fix a broken bed?", a: "Yes, most joint and plank problems." },
          { q: "Is the channel price per drawer?", a: "Yes, channel replacement is priced per drawer." },
          { q: "Do you repair office chairs?", a: "Wooden parts, yes. Hydraulic parts need replacement." },
        ],
        items: [
          item("cp-fr-bed", "Bed Repair", "Fix bed frame, joints and planks.", F),
          item("cp-fr-wardrobe", "Wardrobe Repair", "Fix doors, shelves and handles.", F),
          item("cp-fr-channel", "Drawer Channel Replacement", "Replace drawer channels.", U, "per drawer"),
          item("cp-fr-chair-table", "Chair / Table Repair", "Fix wobbly chairs and tables.", U, "per piece"),
        ],
      },
      {
        name: "Furniture Assembly",
        icon: "/carpenter.png",
        duration: "1–3 hrs",
        included: ["Unboxing and assembly", "Fixing to wall where needed", "Packaging waste collected in one place"],
        excluded: ["Missing parts", "Modification of furniture"],
        faqs: [
          { q: "Can you assemble online-bought furniture?", a: "Yes, from any brand." },
          { q: "Is wall fixing included?", a: "Yes, basic wall fixing for safety." },
          { q: "What if parts are missing?", a: "Please contact the seller. We can complete it once parts arrive." },
        ],
        items: [
          item("cp-as-furniture", "New Furniture Assembly", "Assembly of new furniture.", U, "per item"),
          item("cp-as-tv-unit", "TV Unit Assembly", "Assemble and fix a TV unit.", F),
          item("cp-as-bed", "Bed Assembly", "Assemble a new bed.", F),
        ],
      },
      {
        name: "Installation",
        icon: "/carpenter.png",
        duration: "20 min – 2 hrs",
        included: ["Drilling and fixing", "Level check"],
        excluded: ["Cost of rods, shelves or cabinets"],
        faqs: [
          { q: "Do you drill in tiles?", a: "Yes, with tile-safe drill bits." },
          { q: "Is the price per item?", a: "Yes, priced per rod, shelf, hanging or cabinet." },
          { q: "Can you fit kitchen cabinets I bought?", a: "Yes. Book Kitchen Cabinet Fitting." },
        ],
        items: [
          item("cp-in-curtain", "Curtain Rod Installation", "Fix curtain rods.", U, "per rod"),
          item("cp-in-shelf", "Shelf Installation", "Fix wall shelves.", U, "per shelf"),
          item("cp-in-hanging", "Wall Hanging", "Hang frames, mirrors or clocks.", U, "per item"),
          item("cp-in-cabinet", "Kitchen Cabinet Fitting", "Fit kitchen cabinets.", U, "per cabinet"),
        ],
      },
      {
        name: "Custom Work",
        icon: "/carpenter.png",
        duration: "Inspection 45 min; work by quote",
        included: ["Site visit and measurement", "Design discussion and quote", "Making and installation"],
        excluded: ["Electrical and painting work"],
        faqs: [
          { q: "Why is custom work by inspection?", a: "Size, material and design decide the price." },
          { q: "Which materials do you use?", a: "Plywood, MDF or laminate, as agreed in the quote." },
          { q: "How long does a wardrobe take?", a: "Usually 5–10 days after the quote is approved." },
        ],
        items: [
          item("cp-custom-modular", "Modular Furniture", "Made-to-measure modular furniture.", I),
          item("cp-custom-wardrobe", "New Wardrobe", "Custom wardrobe for your room.", I),
          item("cp-custom-ceiling", "Wooden False Ceiling", "Wooden false ceiling work.", I),
        ],
      },
    ],
  },
];
