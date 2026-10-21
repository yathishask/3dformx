import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: "fx-apex-7",
    name: "FormX Apex-7 CoreXY Industrial 3D Printer",
    tagline: "Ultra-high speed 600mm/s CoreXY system with 350°C hardened hotend and active chamber heating.",
    category: "printers",
    categoryLabel: "3D Printers",
    brand: "3D FormX",
    price: 149999,
    originalPrice: 179999,
    rating: 4.9,
    reviewsCount: 142,
    badge: "Flagship",
    badgeType: "bestseller",
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "The FormX Apex-7 is an industrial powerhouse engineered for demanding engineering labs and manufacturing plants in India. Featuring a rigid unibody aluminum enclosure, aerospace linear guide rails, and active 65°C chamber heating, it reliably extrudes engineering composites like Carbon Fiber PEEK, PA12, and PC at speeds up to 600 mm/s.",
    specs: {
      "Build Volume": "350 x 350 x 380 mm",
      "Max Print Speed": "600 mm/s",
      "Max Acceleration": "20,000 mm/s²",
      "Hotend Temperature": "Up to 350°C (Titanium All-Metal)",
      "Bed Temperature": "Up to 120°C (AC 230V High Power)",
      "Chamber Temperature": "Active Heating up to 65°C",
      "Nozzle Diameter": "0.4 mm Hardened Steel included",
      "Auto Leveling": "Dual LiDAR + 36-Point Strain Gauge",
      "Connectivity": "Wi-Fi 6, Gigabit Ethernet, USB 3.0",
      "Power Rating": "230V 50Hz (India Standard Plug)"
    },
    features: [
      "Aerospace-grade linear rails delivering 0.005mm positioning repeatability",
      "High-torque dual-gear direct extruder designed for abrasive carbon filaments",
      "1080p AI vision camera for real-time spaghetti detection and timelapse creation",
      "Activated carbon + H13 HEPA dual-stage air filtration system",
      "1-Year on-site India warranty with doorstep technician support"
    ],
    variants: [
      { id: "v-04", name: "0.4mm Hardened Nozzle", inStock: true },
      { id: "v-06", name: "0.6mm High-Flow Nozzle", inStock: true, priceModifier: 1500 },
      { id: "v-08", name: "0.8mm Rapid Production Nozzle", inStock: true, priceModifier: 2000 }
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: "fx-phantasm-8k",
    name: "FormX Phantasm 8K SLA Photopolymer Station",
    tagline: "Micro-precision dental, jewelry & engineering SLA resin printer with monochromatic 8K mask.",
    category: "printers",
    categoryLabel: "3D Printers",
    brand: "3D FormX",
    price: 98500,
    originalPrice: 119000,
    rating: 4.8,
    reviewsCount: 98,
    badge: "8K Ultra-Res",
    badgeType: "featured",
    images: [
      "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "FormX Phantasm 8K brings micrometer-level precision to high-fidelity additive prototyping. Its 10.3-inch monochromatic 8K LCD screen delivers an astonishing 24-micron XY resolution, rendering surgical dental guides, intricate filigree jewelry molds, and snap-fit engineering assemblies with virtually zero visible layer lines.",
    specs: {
      "Build Volume": "228 x 128 x 250 mm",
      "XY Resolution": "24 microns (7680 x 4320)",
      "Light Engine": "COB Matrix UV Light (405nm)",
      "Layer Thickness": "0.01 - 0.2 mm adjustable",
      "Max Print Speed": "70 mm/hr",
      "Resin Tank": "Non-stick ACF Film with Preheating Pad",
      "Z-Axis": "Dual Linear Guides + Ball Screw"
    },
    features: [
      "24-micron voxel resolution for flawless investment wax casting & dental models",
      "Automated resin level monitoring and automated refilling module",
      "Integrated odor neutralization system with honeycomb carbon blocks",
      "Bundled with 1L free FormX ToughFlex engineering resin"
    ],
    variants: [
      { id: "v-printer", name: "Printer Unit Only", inStock: true },
      { id: "v-bundle", name: "Bundle (+ Wash & Cure Station)", inStock: true, priceModifier: 24999 }
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: "fx-matrix-idex",
    name: "FormX Matrix Dual-IDEX High-Temp Printer",
    tagline: "Independent Dual Extruders (IDEX) for multi-material, soluble supports, and dual batch manufacturing.",
    category: "printers",
    categoryLabel: "3D Printers",
    brand: "3D FormX",
    price: 224999,
    originalPrice: 259999,
    rating: 5.0,
    reviewsCount: 64,
    badge: "Enterprise",
    badgeType: "new",
    images: [
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "The FormX Matrix Dual-IDEX represents the pinnacle of multi-material additive manufacturing. Its dual independent toolheads eliminate cross-contamination when pairing tough carbon-fiber matrices with water-soluble BVOH/PVA supports, or double throughput with mirrored simultaneous production.",
    specs: {
      "Build Volume": "400 x 400 x 450 mm",
      "Extruder System": "Independent Dual Extruders (IDEX)",
      "Max Hotend Temp": "420°C (PEEK / PEKK Certified)",
      "Cooling": "Integrated Liquid Hotend Loop",
      "Heated Bed": "Dual-Zone Silicone 140°C",
      "Chamber": "Active Thermo-Insulated 80°C"
    },
    features: [
      "Simultaneous duplicate and mirror production modes for double factory throughput",
      "Direct water-soluble support printing for complex internal lattices",
      "Heavy duty aluminum unibody frame dampens vibration during rapid travels",
      "18% GST Input Tax Credit invoice for Indian enterprise buyers"
    ],
    variants: [
      { id: "v-standard", name: "Standard IDEX 400x400", inStock: true },
      { id: "v-peek", name: "High-Temp 420°C PEEK Pack", inStock: true, priceModifier: 28000 }
    ],
    inStock: true,
    isFeatured: false
  },
  {
    id: "fx-forge-mini",
    name: "FormX Forge Mini High-Precision Desktop 3D Printer",
    tagline: "Compact CoreXY high-speed desktop printer for rapid concept prototyping and education.",
    category: "printers",
    categoryLabel: "3D Printers",
    brand: "3D FormX",
    price: 44999,
    originalPrice: 52999,
    rating: 4.7,
    reviewsCount: 89,
    badge: "Compact",
    badgeType: "sale",
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Compact yet uncompromising, the FormX Forge Mini brings industrial CoreXY speed and auto-calibration to your desktop or design studio. It achieves up to 450 mm/s speeds with PLA, PETG, and TPU.",
    specs: {
      "Build Volume": "220 x 220 x 240 mm",
      "Max Speed": "450 mm/s",
      "Max Hotend": "300°C",
      "Bed Temp": "Up to 100°C",
      "Display": "4.3-inch Full Color Touchscreen"
    },
    features: [
      "Pre-assembled out of the box with 15-minute first print setup",
      "Full automatic mesh bed leveling with inductive sensor",
      "Whisper-quiet TMC2209 stepper drivers (< 45 dB operation)"
    ],
    variants: [
      { id: "v-stealth", name: "Stealth Black Edition", inStock: true },
      { id: "v-combo", name: "Combo with 3x Spools", inStock: true, priceModifier: 6000 }
    ],
    inStock: true,
    isFeatured: false
  },
  {
    id: "fx-aerocarbon-peek",
    name: "FormX AeroCarbon™ Carbon-Fiber PEEK Filament (1kg)",
    tagline: "20% chopped high-modulus carbon fiber reinforced PEEK for aerospace and defense autoclave tooling.",
    category: "filaments",
    categoryLabel: "Filaments",
    brand: "3D FormX",
    price: 14999,
    originalPrice: 17500,
    rating: 5.0,
    reviewsCount: 88,
    badge: "Aerospace Grade",
    badgeType: "featured",
    images: [
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "FormX AeroCarbon PEEK is reinforced with 20% high-modulus chopped carbon fibers, yielding a continuous service temperature up to 260°C and heat deflection up to 300°C. Engineered to directly replace machined aluminum in aerospace ducting, satellite brackets, and autoclave composite tooling.",
    specs: {
      "Diameter": "1.75 mm ± 0.02 mm",
      "Spool Weight": "1.0 kg Net (2.2 lbs)",
      "Extruder Temp": "380°C - 420°C",
      "Bed Temp": "130°C - 150°C",
      "Tensile Strength": "135 MPa",
      "Heat Deflection Temp": "260°C @ 1.8 MPa"
    },
    features: [
      "Outstanding strength-to-weight ratio to replace machined aluminum parts",
      "Exceptional chemical resistance against jet fuel, hydraulic fluids, and acids",
      "Hermetically sealed in multi-layer aluminum vacuum foil with silica packs",
      "RFID chip for automatic FormX printer parameter recognition"
    ],
    variants: [
      { id: "v-1kg", name: "1.0 kg Spool (1.75mm)", inStock: true },
      { id: "v-500g", name: "500g Sample Spool", inStock: true, priceModifier: -6500 }
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: "fx-titanpoly-pa12",
    name: "FormX TitanPoly™ Carbon Fiber PA12 Nylon (1kg)",
    tagline: "Engineering grade PA12 Polyamide with 15% carbon fiber. Outstanding layer adhesion and impact resistance.",
    category: "filaments",
    categoryLabel: "Filaments",
    brand: "3D FormX",
    price: 7499,
    originalPrice: 8999,
    rating: 4.8,
    reviewsCount: 165,
    badge: "Bestseller",
    badgeType: "bestseller",
    images: [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "TitanPoly PA12-CF combines the durability and chemical resistance of Polyamide 12 with the dimensional stability and stiffness of carbon fibers. Its luxurious matte micro-textured surface finish hides all layer lines.",
    specs: {
      "Diameter": "1.75 mm ± 0.02 mm",
      "Spool Weight": "1.0 kg Net",
      "Extruder Temp": "260°C - 290°C",
      "Bed Temp": "80°C - 100°C",
      "Tensile Modulus": "6000 MPa",
      "Heat Deflection": "155°C @ 0.45 MPa"
    },
    features: [
      "Ultra-low warping formulation enables printing without high-temp chambers",
      "Matte textured luxury surface finish masks layer lines completely",
      "High impact resistance and resistance to grease, oils, and automotive fluids",
      "Top choice for functional automotive ducts, robot arms, and drone frames"
    ],
    variants: [
      { id: "v-1kg-black", name: "1.0 kg (Stealth Black)", inStock: true, colorHex: "#1a1a1a" },
      { id: "v-25kg", name: "2.5 kg Industrial Spool", inStock: true, priceModifier: 9500 }
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: "fx-hyperpla-silk",
    name: "FormX HyperPLA™ High-Speed Silk Series (1kg)",
    tagline: "High-fluidity biodegradable PLA tuned for 500+ mm/s rapid printers with shimmering satin finish.",
    category: "filaments",
    categoryLabel: "Filaments",
    brand: "3D FormX",
    price: 2499,
    originalPrice: 3199,
    rating: 4.7,
    reviewsCount: 284,
    badge: "Popular Deal",
    badgeType: "sale",
    images: [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Tuned for ultra-fast printing without stringing or loss of luster, FormX HyperPLA Silk provides an injection-molded metallic appearance right off the print bed.",
    specs: {
      "Diameter": "1.75 mm ± 0.02 mm",
      "Spool Weight": "1.0 kg Net",
      "Extruder Temp": "205°C - 235°C",
      "Bed Temp": "50°C - 60°C",
      "Speed Range": "100 - 600 mm/s",
      "Spool Material": "Recyclable Heavy Cardboard"
    },
    features: [
      "Quick solidification formula prevents overhang sagging at 600 mm/s",
      "Deep metallic satin luster gives injection-molded appearance",
      "Tangle-free precision winding guaranteed on every spool"
    ],
    variants: [
      { id: "v-silver", name: "Chrome Silver", inStock: true, colorHex: "#cbd5e1" },
      { id: "v-orange", name: "Cyber Orange", inStock: true, colorHex: "#ff6a00" },
      { id: "v-black", name: "Obsidian Black", inStock: true, colorHex: "#11141b" },
      { id: "v-gold", name: "Tungsten Gold", inStock: true, colorHex: "#eab308" }
    ],
    inStock: true,
    isFeatured: false
  },
  {
    id: "fx-ultraflex-tpu",
    name: "FormX UltraFlex™ TPU 95A Industrial Elastomer (1kg)",
    tagline: "High-rebound flexible filament for functional shock dampeners, gaskets, and wearable seals.",
    category: "filaments",
    categoryLabel: "Filaments",
    brand: "3D FormX",
    price: 3899,
    originalPrice: 4499,
    rating: 4.8,
    reviewsCount: 76,
    badge: "Flexible",
    badgeType: "new",
    images: [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "FormX UltraFlex 95A offers consistent feeding through direct drive extruders with high abrasion resistance, 500% elongation at break, and chemical resistance to oils.",
    specs: {
      "Shore Hardness": "95A",
      "Diameter": "1.75 mm ± 0.02 mm",
      "Extruder Temp": "220°C - 245°C",
      "Bed Temp": "40°C - 60°C",
      "Elongation at Break": "520%"
    },
    features: [
      "Engineered shore hardness prevents buckling in direct drive extruders",
      "Outstanding layer adhesion creates watertight and airtight elastic gaskets"
    ],
    variants: [
      { id: "v-tpu-black", name: "Stealth Black", inStock: true, colorHex: "#171717" },
      { id: "v-tpu-amber", name: "FormX Amber", inStock: true, colorHex: "#ff8c00" }
    ],
    inStock: true,
    isFeatured: false
  },
  {
    id: "fx-toughflex-resin",
    name: "FormX ToughFlex 405nm Precision Engineering Resin (1L)",
    tagline: "ABS-like mechanical resin with 80 Shore D hardness and high elongation for snap-fit assemblies.",
    category: "resins",
    categoryLabel: "8K Resins",
    brand: "3D FormX",
    price: 5999,
    originalPrice: 7200,
    rating: 4.9,
    reviewsCount: 84,
    badge: "High Impact",
    badgeType: "bestseller",
    images: [
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "ToughFlex 405nm resin is formulated to resist high cyclic mechanical shock and vibration. It matches injection-molded ABS properties, making it the industry standard for functional snaps, electronic enclosures, and jig fixtures.",
    specs: {
      "Wavelength": "385 - 405 nm",
      "Volume": "1000 ml (1 Liter)",
      "Tensile Strength": "52 MPa",
      "Elongation at Break": "28%",
      "Viscosity": "280 mPa.s at 25°C",
      "Hardness": "80 Shore D"
    },
    features: [
      "Shatter-resistant even under drop testing onto concrete floors",
      "Bio-based acrylates provide ultra-low odor and minimal vapor emission",
      "Sub-1% volumetric shrinkage ensures precision tolerance alignment",
      "Fast curing speed: 1.8s per layer on monochrome 8K screens"
    ],
    variants: [
      { id: "v-resin-black", name: "Obsidian Black (1L)", inStock: true, colorHex: "#0a0a0a" },
      { id: "v-resin-grey", name: "Industrial Grey (1L)", inStock: true, colorHex: "#64748b" },
      { id: "v-resin-5l", name: "5 Liter Studio Pack", inStock: true, priceModifier: 18000 }
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: "fx-castmaster-resin",
    name: "FormX CastMaster™ Dental & Jewelry Castable Resin (1L)",
    tagline: "Zero-ash clean burnout resin for investment casting in platinum, gold, and dental alloys.",
    category: "resins",
    categoryLabel: "8K Resins",
    brand: "3D FormX",
    price: 8499,
    originalPrice: 9999,
    rating: 4.9,
    reviewsCount: 52,
    badge: "Zero-Ash",
    badgeType: "new",
    images: [
      "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "FormX CastMaster is formulated with 30% synthetic wax to guarantee 100% ash-free burnout in standard gypsum and phosphate investment flasks, capturing micro-prong details in jewelry.",
    specs: {
      "Wavelength": "405 nm",
      "Burnout Ash Content": "< 0.01% (Zero Ash Residue)",
      "Volume": "1000 ml",
      "Detail Resolution": "Down to 20 microns"
    },
    features: [
      "Clean thermal degradation without cracking delicate investment molds",
      "Captures micro-pavé prongs and filigree geometries seamlessly"
    ],
    variants: [
      { id: "v-cast-1l", name: "1 Liter Bottle", inStock: true }
    ],
    inStock: true,
    isFeatured: false
  },
  {
    id: "fx-metrology-x",
    name: "FormX Metrology-X Blue Laser 3D Handheld Scanner",
    tagline: "High-precision metrology scanner with 22 crossed blue laser lines and anti-reflective scanning.",
    category: "scanners",
    categoryLabel: "3D Scanners",
    brand: "3D FormX",
    price: 275000,
    originalPrice: 310000,
    rating: 4.9,
    reviewsCount: 46,
    badge: "0.02mm Laser",
    badgeType: "featured",
    images: [
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Metrology-X is a metrology-grade handheld 3D laser scanner designed for automotive inspection and aerospace reverse engineering. Its 22 crossed blue laser lines scan black, polished, and chrome surfaces without messy anti-reflective sprays.",
    specs: {
      "Accuracy": "Up to 0.02 mm (20 microns)",
      "Scanning Speed": "1,600,000 measurements/sec",
      "Laser Lines": "22 Blue Cross Lines + 1 Deep Hole Line",
      "Laser Safety": "Class II (Eye Safe)",
      "Weight": "850 grams (Carbon Fiber unibody)",
      "Output Formats": "STL, OBJ, PLY, STEP, IGES"
    },
    features: [
      "Zero scanning spray required for shiny, reflective, or deep black parts",
      "Built-in photogrammetry system for inspecting large automotive components",
      "Real-time deviation colormap inspection against original CAD files",
      "Hardened waterproof flight case and optical calibration plate included"
    ],
    variants: [
      { id: "v-scan-std", name: "Standard Metrology Kit", inStock: true },
      { id: "v-scan-pro", name: "Pro Kit (+ Scale Bars & Magnetic Targets)", inStock: true, priceModifier: 35000 }
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: "fx-orbit-360",
    name: "FormX Orbit-360 Precision Desktop 3D Scanner",
    tagline: "Two-axis motorized turntable structured light scanner for rapid reverse engineering.",
    category: "scanners",
    categoryLabel: "3D Scanners",
    brand: "3D FormX",
    price: 72500,
    originalPrice: 84999,
    rating: 4.8,
    reviewsCount: 62,
    badge: "Automated",
    badgeType: "bestseller",
    images: [
      "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "The Orbit-360 automated turntable scanner captures objects up to 150x150x150mm in under 45 seconds with 0.035mm watertight mesh generation, ready for 3D printing.",
    specs: {
      "Accuracy": "0.035 mm",
      "Scan Volume": "150 x 150 x 150 mm",
      "Sensors": "Dual 5.0 Megapixel Monochrome Cameras",
      "Scan Duration": "45 seconds per full 360° turn"
    },
    features: [
      "One-click auto-alignment and automated watertight manifold mesh generation",
      "Full color texture capture camera module included"
    ],
    variants: [
      { id: "v-orbit-std", name: "Standard Scanner + Turntable", inStock: true }
    ],
    inStock: true,
    isFeatured: false
  },
  {
    id: "fx-diamond-nozzle",
    name: "FormX Diamond-Ti Hardened Obsidian Nozzle",
    tagline: "Polycrystalline diamond tip bonded to copper-titanium alloy body. Endless abrasion resistance.",
    category: "accessories",
    categoryLabel: "Accessories & Spares",
    brand: "3D FormX",
    price: 3999,
    originalPrice: 4999,
    rating: 4.9,
    reviewsCount: 328,
    badge: "Lifetime Warranty",
    badgeType: "bestseller",
    images: [
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "FormX Diamond-Ti pairs a lab-grown polycrystalline diamond (PCD) orifice with a copper-zirconium body for 290 W/m·K thermal conductivity and extreme resistance against abrasive carbon and glass filaments.",
    specs: {
      "Tip Material": "Polycrystalline Diamond (PCD)",
      "Body Material": "DLC Coated Copper-Zirconium + Titanium",
      "Thermal Conductivity": "290 W/m·K",
      "Max Operating Temp": "500°C continuous",
      "Thread": "Standard M6 High-Flow Volcanic"
    },
    features: [
      "Zero nozzle bore wear even after 1,000+ hours of continuous carbon fiber printing",
      "Mirror-polished DLC internal bore eliminates clogs and heat creep",
      "Fits FormX Apex, Bambu, and standard E3D V6/Volcano hotends"
    ],
    variants: [
      { id: "v-noz-04", name: "0.4 mm Orifice (Standard)", inStock: true },
      { id: "v-noz-06", name: "0.6 mm Orifice (High Flow)", inStock: true },
      { id: "v-noz-08", name: "0.8 mm Orifice (Volcano)", inStock: true }
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: "fx-magneplate-pei",
    name: "FormX MagnePlate™ Dual-Sided PEI Spring Bed (350x350mm)",
    tagline: "High-flex magnetic spring steel sheet with textured PEI on Side A and smooth carbon pattern on Side B.",
    category: "accessories",
    categoryLabel: "Accessories & Spares",
    brand: "3D FormX",
    price: 5299,
    originalPrice: 6499,
    rating: 4.8,
    reviewsCount: 195,
    badge: "Must-Have",
    badgeType: "sale",
    images: [
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Pop prints off effortlessly with a single gentle flex. Eliminates the need for glue sticks and hairsprays on 99% of polymers.",
    specs: {
      "Dimensions": "350 x 350 mm",
      "Thickness": "0.5 mm Spring Steel + 0.15 mm PEI",
      "Max Temperature": "140°C continuous",
      "Magnet Base": "High Curie Point NdFeB Rare Earth Base"
    },
    features: [
      "Side A: Heavy textured rough powder-coated PEI",
      "Side B: Ultra-smooth carbon holographic texture",
      "Extreme thermal flatness within ±0.03mm across build plane"
    ],
    variants: [
      { id: "v-plate-350", name: "350 x 350 mm (Apex-7 Fit)", inStock: true },
      { id: "v-plate-400", name: "400 x 400 mm (Matrix Fit)", inStock: true, priceModifier: 1200 }
    ],
    inStock: true,
    isFeatured: false
  },
  {
    id: "fx-drybox-multi",
    name: "FormX Rapid Dry Box & Active Heated Spool Chamber",
    tagline: "Dual-spool active dehydrator running up to 70°C for moisture-sensitive Nylon, PEEK, and TPU filaments.",
    category: "accessories",
    categoryLabel: "Accessories & Spares",
    brand: "3D FormX",
    price: 11999,
    originalPrice: 14500,
    rating: 4.9,
    reviewsCount: 118,
    badge: "Essential",
    badgeType: "featured",
    images: [
      "https://images.unsplash.com/photo-1633493763531-152e3cf8d9ff?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Engineered specifically for Indian monsoon and high-humidity climates, the FormX Dry Box active heating fan maintains filament moisture below 15% RH while feeding filament directly into your printer.",
    specs: {
      "Max Chamber Temp": "70°C Active PTC Convection",
      "Capacity": "2x 1kg Spools or 1x 3kg Spool",
      "Humidity Control": "Maintains < 15% RH",
      "Display": "Digital Touch Screen with Timer",
      "Power": "230V 50Hz (India Standard)"
    },
    features: [
      "360-degree PTC heating fan circulates hot air uniformly",
      "Direct feed PTFE tube grommets allow printing straight out of the drybox",
      "Indispensable for moisture-prone Nylon and PEEK filaments in India"
    ],
    variants: [
      { id: "v-dry-std", name: "Dual Spool 230V Edition", inStock: true }
    ],
    inStock: true,
    isFeatured: true
  }
];

export const CATEGORIES = [
  { id: 'all', label: 'All Products', count: PRODUCTS.length },
  { id: 'printers', label: '3D Printers', count: PRODUCTS.filter(p => p.category === 'printers').length },
  { id: 'filaments', label: 'Engineering Filaments', count: PRODUCTS.filter(p => p.category === 'filaments').length },
  { id: 'resins', label: '8K Resins', count: PRODUCTS.filter(p => p.category === 'resins').length },
  { id: 'scanners', label: '3D Scanners', count: PRODUCTS.filter(p => p.category === 'scanners').length },
  { id: 'accessories', label: 'Accessories & Spares', count: PRODUCTS.filter(p => p.category === 'accessories').length },
];
