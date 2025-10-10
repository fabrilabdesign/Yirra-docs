---
sidebar_position: 3.5
---

# 🖨️ Printer & Filament Settings

This section outlines the recommended hardware and print settings for manufacturing the **Replicant GEN 1 FPV Drone** components.  
All configurations below have been tested for dimensional accuracy, strength, and print reliability with carbon-fiber-reinforced nylon and flexible TPU materials.

---

## 🧠 Recommended Printer

### Bambu Lab P1S

:::info Official Recommendation
The **Bambu Lab P1S** is the officially recommended printer for all Replicant GEN 1 components.  

Its enclosed chamber, active carbon filter, and rigid Core-XY motion system deliver consistent layer adhesion with **Fiberon PA6-CF** and excellent surface finish on **SpiderMaker TPE 75A** parts.  

The P1S also supports multi-material upgrades (AMS) for color differentiation between flexible and rigid parts.
:::

### Minimum Printer Requirements

If not using the P1S, your printer must meet these specifications:

- **Build Volume**: 220 x 220 x 250mm minimum
- **Heated Bed**: Up to 100°C
- **Hotend**: All-metal, capable of 300°C
- **Enclosure**: Fully enclosed chamber for temperature stability
- **Motion System**: Rigid frame with minimal vibration
- **Nozzle**: Hardened steel (0.6mm recommended for CF materials)
- **Build Surface**: Textured PEI or Garolite for nylon adhesion

---

## ⚙️ Filament Overview

| **Material** | **Brand** | **Use Case** |
|---------------|------------|---------------|
| **PA6-CF Nylon** | Fiberon / Polymaker | Primary structural frame, motor mounts, and arm bosses |
| **TPE 75A (Black Matte)** | SpiderMaker | Nose cone, vibration isolation, and landing pads |
| **PETG** | Any quality brand | **Test fits only** — not for flight parts |

:::danger Material Requirements
- **PA6-CF**: Must be kept in sealed dry box with desiccant at all times
- **PETG**: Test fits ONLY — insufficient heat resistance for flight
- **TPE 75A**: Store in cool, dry place away from sunlight
:::

---

## 🧩 PA6-CF Printing Parameters

| **Parameter** | **Fiberon PA6-CF** | **Polymaker PA6-CF** |
|----------------|----------------------|----------------------|
| **Nozzle Temp (°C)** | 280 – 300 | 280 – 300 |
| **Bed Temp (°C)** | ≤ 50 | ≤ 50 |
| **Chamber Temp (°C)** | 25 – 50 | 25 – 50 |
| **Print Speed (mm/s)** | 60 | 60 |
| **Cooling Fan** | **OFF** | **OFF** |
| **Layer Height** | 0.2 – 0.28mm | 0.2 – 0.28mm |
| **Nozzle Size** | 0.6mm hardened steel | 0.6mm hardened steel |
| **Walls** | 4 – 6 perimeters | 4 – 6 perimeters |
| **Infill** | 40 – 60% (Gyroid) | 40 – 60% (Gyroid) |
| **Filament Storage** | Dry box or sealed desiccant container | Dry box or sealed desiccant container |

:::tip Critical Settings
- **NO part cooling fan** — PA6-CF needs heat for layer bonding
- **Dry filament** for 6-8 hours at 80°C before printing
- **Enclosed chamber** prevents warping and delamination
- **Hardened nozzle** required — carbon fiber is abrasive
:::

---

## 🧽 SpiderMaker TPE 75A Printing Parameters

| **Parameter** | **Recommended Setting** |
|----------------|-------------------------|
| **Nozzle Temp (°C)** | 210 – 230 |
| **Bed Temp (°C)** | ~ 40 |
| **Print Speed (mm/s)** | 10 – 30 |
| **Cooling Fan** | Low / Off |
| **Extruder Type** | Direct drive recommended |
| **Nozzle Size** | ≥ 0.6 mm |
| **Retraction** | 0.5 – 0.8mm (minimal) |
| **Layer Height** | 0.24 – 0.28mm |
| **Material Details** | SpiderMaker TPE 75A – Coal Black Matte Finish (1.75 mm / 500 g) |

:::warning TPE Printing Tips
- **Avoid all-metal hotends** — PTFE-lined nozzles reduce clogging
- **Slow and steady** — reduce speed for reliable extrusion
- **Minimal retraction** — 0.8mm or less to prevent jams
- **Direct drive extruder** strongly recommended over Bowden
:::

---

## 🧰 Printing Tips

### Before You Start

- **Dry your filament** at 80°C for 6–8 hours before use
- **Verify nozzle** is hardened steel for PA6-CF
- **Clean build plate** with isopropyl alcohol
- **Check enclosure** seals — no drafts or air leaks

### During Printing

- **Turn off part cooling** for PA6-CF to maximize inter-layer bonding
- Use a **textured PEI sheet** or glue-stick adhesion aid to prevent warping
- **Monitor first layer** — should be smooth and well-adhered
- Keep **chamber closed** during entire print (don't open to check)

### After Printing

- **Let parts cool** in closed chamber for 30+ minutes (PA6-CF)
- **Remove carefully** — PA6-CF can be brittle when cold
- **Inspect dimensions** with calipers before proceeding to assembly
- **Store unused filament** immediately in dry box

---

## 📦 Component Material Assignments

| **Component** | **Material** | **Notes** |
|----------------|--------------|-----------|
| Frame shells (front/rear) | PA6-CF Nylon | 4-6 walls, 50% infill |
| Arm bosses / Motor mounts | PA6-CF Nylon | 6 walls, 80% infill (high stress) |
| Exospine / Rail blocks | PA6-CF Nylon | 5 walls, 60% infill |
| Nose cone | SpiderMaker TPE 75A | Black matte finish |
| Landing pads | SpiderMaker TPE 75A | 2 walls, 20% infill |
| Camera isolation mounts | SpiderMaker TPE 75A | Flexible, vibration dampening |
| Battery latch | PA6-CF Nylon | 5 walls, 70% infill |
| GPS mast | PA6-CF Nylon | 4 walls, 40% infill |
| Test fits / Jigs | PETG | Not for flight — dimensional verification only |

---

## 🎯 Print Quality Standards

Your printed parts should meet these criteria:

- [ ] **No layer separation** — solid inter-layer bonding
- [ ] **No warping** — flat surfaces, no curling at corners
- [ ] **Smooth top layers** — no gaps or under-extrusion
- [ ] **Accurate dimensions** — ±0.1mm tolerance on critical features
- [ ] **No stringing** on TPE parts
- [ ] **Clean holes** — no elephant foot or first-layer squish
- [ ] **Consistent color** — no discoloration or burnt areas

:::tip Quality Control
Use digital calipers to verify critical dimensions:
- Arm tube holes: 11mm ±0.1mm
- Motor mount bolt pattern: 16mm or 19mm spacing
- Battery rail width: Per STL specifications
:::

---

## 📊 Estimated Print Times

| **Part** | **Material** | **Print Time** | **Filament Used** |
|----------|--------------|----------------|-------------------|
| Front shell | PA6-CF | 8-12 hours | 150-200g |
| Rear shell | PA6-CF | 8-12 hours | 150-200g |
| Arm boss (x4) | PA6-CF | 2-3 hours each | 40-60g each |
| Nose cone | TPE 75A | 3-5 hours | 50-80g |
| Landing pads (x4) | TPE 75A | 1-2 hours total | 20-30g total |
| **Complete Frame Set** | Mixed | **40-60 hours** | **600-800g total** |

---

## ✅ Summary

The combination of **Bambu Lab P1S + Fiberon PA6-CF + SpiderMaker TPE 75A** provides a professional-grade foundation for printing durable, functional Replicant GEN 1 frames with minimal tuning.

**Key Takeaways:**
- PA6-CF must stay dry and be printed in enclosed chamber with NO cooling
- TPE 75A requires slow speeds and minimal retraction
- PETG is for test fits only — never use for flight parts
- Verify dimensions with calipers before assembly

---

## Next Steps

Once your parts are printed and verified:
1. [Post-process and finish](/docs/build-guides/printing#post-processing) your prints
2. Proceed to [Assembly Guide](/docs/build-guides/assembly)
3. Verify fit with [Tools & Materials](/docs/build-guides/tools) checklist

---

*Last Updated: 2025-10-08*  
*Maintained by Yirra Systems / Engineering Documentation Team*


