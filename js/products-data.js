/**
 * 3D FormX - India Official Product Catalog
 * Inspired by ReiseMoto design structure: High-performance ready inventory in Indian Rupees (₹)
 */

const PRODUCTS_DATA = [
  {
    id: "fx-apex-7",
    name: "FormX Apex-7 CoreXY Industrial 3D Printer",
    category: "printers",
    categoryLabel: "3D Printers",
    brand: "3D FormX",
    price: 149999,
    mrp: 179999,
    discountPct: 17,
    rating: 4.9,
    reviewsCount: 142,
    badge: "Bestseller",
    badgeType: "trending",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Ultra-high speed 600mm/s CoreXY additive system with 350°C hardened hotend and 230V active heated chamber.",
    variants: [
      { id: "v1", label: "Standard 0.4mm Nozzle", inStock: true },
      { id: "v2", label: "Hardened CF 0.6mm Nozzle", inStock: true },
      { id: "v3", label: "High-Flow 0.8mm Nozzle", inStock: true }
    ],
    specs: {
      "Build Volume": "350 x 350 x 380 mm",
      "Max Speed": "600 mm/s (Acceleration: 20,000 mm/s²)",
      "Hotend Temp": "Up to 350°C (All-Metal Titanium)",
      "Bed Temp": "Up to 120°C (AC Heated 230V)",
      "Chamber Temp": "Active Heating up to 65°C",
      "Voltage": "230V 50Hz (India Standard Plug)"
    },
    features: [
      "Aerospace linear rails with 0.005mm repeatability",
      "Dual-gear direct drive extruder for abrasive carbon filaments",
      "Integrated 1080p AI camera with real-time spaghetti detection",
      "Pan-India on-site warranty & installation support"
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: "fx-phantasm-8k",
    name: "FormX Phantasm 8K SLA Photopolymer Station",
    category: "printers",
    categoryLabel: "3D Printers",
    brand: "3D FormX",
    price: 98500,
    mrp: 119000,
    discountPct: 17,
    rating: 4.8,
    reviewsCount: 98,
    badge: "8K Ultra-Res",
    badgeType: "onsale",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Micro-precision dental, jewelry & engineering SLA resin printer with monochromatic 10.3-inch 8K screen.",
    variants: [
      { id: "v1", label: "Printer Unit Only", inStock: true },
      { id: "v2", label: "Bundle with Wash & Cure Station", inStock: true }
    ],
    specs: {
      "Build Volume": "228 x 128 x 250 mm",
      "XY Resolution": "24 microns (7680 x 4320)",
      "Light Engine": "COB Matrix UV Light 405nm",
      "Print Speed": "Max 70 mm/hr",
      "Vat Type": "Non-stick ACF Film with Preheating"
    },
    features: [
      "24-micron voxel detail for dental dies and investment wax casting",
      "Automated resin level sensor and temperature stabilizer",
      "Ultra-rigid dual Z-axis linear guide rails with CNC milled base",
      "Free 1L Tough Engineering Resin included in box"
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: "fx-matrix-idex",
    name: "FormX Matrix Dual-IDEX High-Temp Printer",
    category: "printers",
    categoryLabel: "3D Printers",
    brand: "3D FormX",
    price: 224999,
    mrp: 259999,
    discountPct: 13,
    rating: 5.0,
    reviewsCount: 64,
    badge: "Industrial",
    badgeType: "trending",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Independent Dual Extruders (IDEX) for multi-material, soluble supports, and dual batch manufacturing.",
    variants: [
      { id: "v1", label: "Standard IDEX 400x400", inStock: true },
      { id: "v2", label: "High-Temp 420°C PEEK Pack", inStock: true }
    ],
    specs: {
      "Build Volume": "400 x 400 x 450 mm",
      "Extruder": "Independent Dual Extruders (IDEX)",
      "Max Hotend": "420°C (PEEK / PEKK Ready)",
      "Water Cooling": "Integrated Liquid Hotend Loop",
      "Chamber": "Fully enclosed thermo-insulated"
    },
    features: [
      "Duplicate and mirror printing modes for double productivity",
      "Direct printing with water-soluble BVOH / PVA supports",
      "Heavy duty aluminum unibody frame dampens vibration",
      "18% GST Input Tax Credit invoice for Indian enterprises"
    ],
    inStock: true,
    isFeatured: false
  },
  {
    id: "fx-aerocarbon-peek",
    name: "FormX AeroCarbon™ Carbon-Fiber PEEK Filament (1kg)",
    category: "filaments",
    categoryLabel: "Filaments",
    brand: "3D FormX",
    price: 14999,
    mrp: 17500,
    discountPct: 14,
    rating: 5.0,
    reviewsCount: 88,
    badge: "Aerospace Grade",
    badgeType: "trending",
    image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    shortDesc: "20% chopped high-modulus carbon fiber reinforced PEEK for aerospace, defense, and high-temp autoclave tooling.",
    variants: [
      { id: "v1", label: "1.75mm / 1.0 kg Spool", inStock: true },
      { id: "v2", label: "1.75mm / 500g Spool", inStock: true }
    ],
    specs: {
      "Diameter": "1.75 mm ± 0.02 mm",
      "Print Temp": "380°C - 420°C",
      "Bed Temp": "130°C - 150°C",
      "Tensile Strength": "135 MPa",
      "Heat Deflection": "260°C @ 1.8 MPa"
    },
    features: [
      "Replaces machined billet aluminum in aerospace brackets",
      "Zero warping with RFID chip for FormX Apex automatic parameter tuning",
      "Vacuum-sealed in heavy metallic moisture barrier pouch",
      "Ships same-day from Mumbai / Bengaluru warehouse"
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: "fx-titanpoly-pa12",
    name: "FormX TitanPoly™ Carbon Fiber PA12 Nylon (1kg)",
    category: "filaments",
    categoryLabel: "Filaments",
    brand: "3D FormX",
    price: 7499,
    mrp: 8999,
    discountPct: 17,
    rating: 4.8,
    reviewsCount: 165,
    badge: "Bestseller",
    badgeType: "trending",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Engineering grade PA12 Polyamide with 15% carbon fiber. Outstanding layer adhesion, stiffness, and impact resistance.",
    variants: [
      { id: "v1", label: "1.75mm / 1 kg (Stealth Black)", inStock: true },
      { id: "v2", label: "1.75mm / 2.5 kg Industrial Spool", inStock: true }
    ],
    specs: {
      "Diameter": "1.75 mm ± 0.02 mm",
      "Print Temp": "260°C - 290°C",
      "Bed Temp": "80°C - 100°C",
      "Tensile Modulus": "6000 MPa",
      "Heat Deflection": "155°C @ 0.45 MPa"
    },
    features: [
      "Matte textured luxury surface finish completely hides layer lines",
      "Chemical resistance to automotive fuel, oil, and grease",
      "Formulated for low moisture absorption in Indian climates",
      "Top choice for automotive intake manifolds and drone frames"
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: "fx-toughflex-resin",
    name: "FormX ToughFlex 405nm Precision Engineering Resin (1L)",
    category: "resins",
    categoryLabel: "Resins",
    brand: "3D FormX",
    price: 5999,
    mrp: 7200,
    discountPct: 17,
    rating: 4.9,
    reviewsCount: 84,
    badge: "High Impact",
    badgeType: "onsale",
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
    shortDesc: "ABS-like mechanical resin with 80 Shore D hardness and high elongation at break for functional snap-fit assemblies.",
    variants: [
      { id: "v1", label: "1 Liter Bottle (Obsidian Black)", inStock: true },
      { id: "v2", label: "1 Liter Bottle (Industrial Grey)", inStock: true },
      { id: "v3", label: "5 Liter Can (Studio Pack)", inStock: true }
    ],
    specs: {
      "Wavelength": "385 - 405 nm",
      "Elongation at Break": "28%",
      "Tensile Strength": "52 MPa",
      "Viscosity": "280 mPa.s at 25°C",
      "Volume": "1000 ml"
    },
    features: [
      "High shock and shatter resistance for functional engineering parts",
      "Low odor, bio-derived formulation with minimal skin irritation",
      "Ultra-low shrinkage (< 0.7%) for high precision tolerance fit",
      "Fast curing speed: 1.8s per layer on monochrome LCD screens"
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: "fx-hyperpla-silk",
    name: "FormX HyperPLA™ High-Speed Silk Series (1kg)",
    category: "filaments",
    categoryLabel: "Filaments",
    brand: "3D FormX",
    price: 2499,
    mrp: 3199,
    discountPct: 22,
    rating: 4.7,
    reviewsCount: 284,
    badge: "Special Deal",
    badgeType: "onsale",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
    shortDesc: "High-fluidity biodegradable PLA tuned for 500+ mm/s rapid printers. Shimmering metallic finish with no stringing.",
    variants: [
      { id: "v1", label: "Chrome Silver (1kg)", inStock: true },
      { id: "v2", label: "Cyber Orange (1kg)", inStock: true },
      { id: "v3", label: "Stealth Black (1kg)", inStock: true }
    ],
    specs: {
      "Diameter": "1.75 mm ± 0.02 mm",
      "Print Temp": "205°C - 235°C",
      "Bed Temp": "50°C - 60°C",
      "Print Speed": "100 - 600 mm/s",
      "Spool": "Recyclable Eco-Cardboard"
    },
    features: [
      "Quick solidification formula prevents overhang sagging at 600mm/s",
      "Deep metallic satin luster gives injection-molded appearance",
      "Tangle-free precision winding guaranteed across every spool",
      "Biodegradable virgin resin from renewable sources"
    ],
    inStock: true,
    isFeatured: false
  },
  {
    id: "fx-metrology-x",
    name: "FormX Metrology-X Blue Laser 3D Handheld Scanner",
    category: "scanners",
    categoryLabel: "3D Scanners",
    brand: "3D FormX",
    price: 275000,
    mrp: 310000,
    discountPct: 11,
    rating: 4.9,
    reviewsCount: 46,
    badge: "0.02mm Laser",
    badgeType: "trending",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=800&q=80",
    shortDesc: "High-precision metrology scanner with 22 crossed blue laser lines and anti-reflective scanning on black surfaces.",
    variants: [
      { id: "v1", label: "Complete Metrology Kit + Case", inStock: true },
      { id: "v2", label: "Kit + Photogrammetry Scale Bars", inStock: true }
    ],
    specs: {
      "Accuracy": "Up to 0.02 mm (20 microns)",
      "Scanning Rate": "1,600,000 points/sec",
      "Laser Type": "Class II (Eye Safe) 22 Blue Cross Lines",
      "Working Distance": "300 - 600 mm",
      "Export": "STL, OBJ, PLY, STEP, IGES"
    },
    features: [
      "No scanning spray needed for glossy, black, or metallic automotive parts",
      "Built-in photogrammetry system for large automotive envelopes",
      "Real-time mesh generation and inspection deviation color mapping",
      "Ergonomic aerospace carbon-fiber body weighing only 850 grams"
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: "fx-orbit-360",
    name: "FormX Orbit-360 Precision Desktop 3D Scanner",
    category: "scanners",
    categoryLabel: "3D Scanners",
    brand: "3D FormX",
    price: 72500,
    mrp: 84999,
    discountPct: 15,
    rating: 4.8,
    reviewsCount: 62,
    badge: "Automated",
    badgeType: "trending",
    image: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Two-axis motorized turntable structured light scanner for rapid reverse engineering and miniature archiving.",
    variants: [
      { id: "v1", label: "Standard Scanner + Turntable", inStock: true }
    ],
    specs: {
      "Accuracy": "0.035 mm",
      "Scan Volume": "150 x 150 x 150 mm",
      "Scan Duration": "Single turn scan in 45 seconds",
      "Camera Sensor": "Dual 5.0 Megapixel Monochrome"
    },
    features: [
      "Fully automated one-click alignment & watertight mesh reconstruction",
      "Color texture capture module with HDR illumination",
      "Direct CAD export compatible with SolidWorks, Fusion 360, and Blender"
    ],
    inStock: true,
    isFeatured: false
  },
  {
    id: "fx-diamond-nozzle",
    name: "FormX Diamond-Ti Hardened Obsidian Nozzle (0.4mm / 0.6mm)",
    category: "hardware",
    categoryLabel: "Hardware & Spares",
    brand: "3D FormX",
    price: 3999,
    mrp: 4999,
    discountPct: 20,
    rating: 4.9,
    reviewsCount: 328,
    badge: "Lifetime Warranty",
    badgeType: "trending",
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Polycrystalline diamond tip bonded to copper-titanium alloy body. Endless abrasion resistance for carbon & glow filaments.",
    variants: [
      { id: "v1", label: "0.4mm M6 Standard Flow", inStock: true },
      { id: "v2", label: "0.6mm M6 High Flow", inStock: true },
      { id: "v3", label: "0.8mm M6 Volcanic Flow", inStock: true }
    ],
    specs: {
      "Tip Material": "Polycrystalline Synthetic Diamond (PCD)",
      "Body Material": "DLC Coated Copper-Zirconium + Titanium",
      "Thermal Conductivity": "290 W/m·K",
      "Max Operating Temp": "500°C continuous"
    },
    features: [
      "Zero nozzle wear even after 1000+ hours of continuous carbon fiber printing",
      "Ultra-slick DLC internal bore eliminates clogging and heat creep",
      "Compatible with FormX Apex, Bambu, and standard E3D hotends"
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: "fx-magneplate-pei",
    name: "FormX MagnePlate™ Dual-Sided PEI Spring Bed (350x350mm)",
    category: "hardware",
    categoryLabel: "Hardware & Spares",
    brand: "3D FormX",
    price: 5299,
    mrp: 6499,
    discountPct: 18,
    rating: 4.8,
    reviewsCount: 195,
    badge: "Must-Have",
    badgeType: "onsale",
    image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    shortDesc: "High-flex magnetic spring steel sheet with textured rough PEI on Side A and sleek carbon holographic pattern on Side B.",
    variants: [
      { id: "v1", label: "350 x 350 mm (Apex-7 Fit)", inStock: true },
      { id: "v2", label: "400 x 400 mm (Matrix Fit)", inStock: true }
    ],
    specs: {
      "Dimensions": "350 x 350 mm",
      "Thickness": "0.5 mm Spring Steel + 0.15 mm PEI",
      "Max Heat": "140°C continuous",
      "Magnet Base": "High Curie point NdFeB Rare Earth Base"
    },
    features: [
      "Effortless part removal with a single flex of the steel plate",
      "Eliminates gluesticks and sprays for PLA, PETG, ABS, and Nylon",
      "Extreme thermal flatness within ±0.03mm across the build plane"
    ],
    inStock: true,
    isFeatured: false
  },
  {
    id: "fx-drybox-multi",
    name: "FormX Rapid Dry Box & Active Heated Spool Chamber",
    category: "hardware",
    categoryLabel: "Hardware & Spares",
    brand: "3D FormX",
    price: 11999,
    mrp: 14500,
    discountPct: 17,
    rating: 4.9,
    reviewsCount: 118,
    badge: "Engineered for India",
    badgeType: "trending",
    image: "https://images.unsplash.com/photo-1633493763531-152e3cf8d9ff?auto=format&fit=crop&w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    shortDesc: "Dual-spool active dehydrator running up to 70°C. Protects moisture-sensitive Nylon, PEEK, and TPU filaments from Indian monsoons.",
    variants: [
      { id: "v1", label: "Dual Spool 230V Edition", inStock: true }
    ],
    specs: {
      "Max Heating Temp": "70°C Active Convection",
      "Capacity": "2x 1kg Spools or 1x 3kg Spool",
      "Humidity Range": "Maintains < 15% RH",
      "Display": "Digital Touch Screen with Timer"
    },
    features: [
      "360-degree PTC heating fan circulates hot air uniformly",
      "Direct feed grommets allow printing straight out of the drybox",
      "Essential for humid coastal and monsoon conditions in India"
    ],
    inStock: true,
    isFeatured: true
  }
];

// Curated Categories for quick circle navigation (Reise Moto style)
const CATEGORIES_DATA = [
  { id: "all", label: "All Gear", count: 12, icon: "fa-solid fa-layer-group" },
  { id: "printers", label: "3D Printers", count: 3, icon: "fa-solid fa-cube" },
  { id: "filaments", label: "Filaments", count: 3, icon: "fa-solid fa-circle-notch" },
  { id: "resins", label: "8K Resins", count: 2, icon: "fa-solid fa-flask" },
  { id: "scanners", label: "3D Scanners", count: 2, icon: "fa-solid fa-barcode" },
  { id: "hardware", label: "Hardware & Spares", count: 3, icon: "fa-solid fa-gears" }
];
