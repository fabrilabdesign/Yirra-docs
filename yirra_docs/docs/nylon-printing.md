---
sidebar_position: 3
title: 3D Printing
---

# 3D Printing

Nylon is hygroscopic—it absorbs moisture from the air. Wet nylon produces weak, ugly parts. This guide covers proper handling.

![Chassis printing](/img/drone/Chassis.gif)

---

## Recommended Filament

The 3MF files are configured for **Fiberon PA6-CF** (carbon fiber reinforced nylon). This filament provides the strength and stiffness required for the Replicant frame.

{/* TODO: Add Fiberon image when saved to /img/3d-printing/Fiberon_PA6CF.png */}

**Why PA6-CF:**
- High tensile strength from carbon fiber reinforcement
- Excellent layer adhesion
- Consistent diameter for reliable printing
- Pre-dried spools reduce prep time

Other CF-Nylon filaments may work, but print settings will need adjustment.

---

## The Golden Rule

> **If you're not sure it's dry, dry it again.**

Wet nylon = weak parts + ugly supports + failed prints.

---

## Drying Requirements

| Material | Temperature | Time | Notes |
|----------|-------------|------|-------|
| CF-Nylon | 80°C (176°F) | 6-8 hours | Before every print session |
| Plain Nylon | 70°C (158°F) | 6-8 hours | More sensitive to moisture |

### Drying Options

- **Filament dryer** - Best option, maintains temp during print
- **Food dehydrator** - Works, may need modification for spools
- **Oven** - Use thermometer, many ovens run hot

---

## Signs of Wet Nylon

| Symptom | Cause |
|---------|-------|
| Popping/crackling during extrusion | Steam escaping |
| Strings and wisps | Moisture boiling off |
| Poor layer adhesion | Weak interlayer bonds |
| Rough surface finish | Bubbling |
| Brittle parts | Degraded polymer chains |

---

## Storage

Keep nylon dry between prints:

1. **Vacuum bags** with desiccant
2. **Sealed containers** with silica gel
3. **Dry box** with active dehumidification

Replace desiccant when color indicator shows saturation.

---

## Print Settings

Use the supplied 3MF files—they're pre-configured for Bambu Studio.

| Setting | Value | Notes |
|---------|-------|-------|
| Nozzle Temp | 260-280°C | Per filament datasheet |
| Bed Temp | 80-100°C | Use glue stick |
| Enclosure | Required | Prevents warping |
| Part Cooling | Minimal | 10-20% max |
| First Layer | Slow | 20mm/s for adhesion |

---

## Bed Adhesion

Nylon requires extra adhesion help:

1. **Glue stick** - Thin, even layer (Elmer's purple works)
2. **Clean bed** - IPA wipe before glue
3. **Textured PEI** - Better than smooth for nylon
4. **Brim** - 5mm brim for large parts

---

## Print Order

Print these parts first—they're structural:

![Parts to print first](/img/3d-printing/Chassis_core.png)

1. **Chassis Core** - Largest, most complex
2. **Motor Mounts** - Critical load path
3. **Arm Bosses** - Bond surface must be perfect

---

## Support Removal

Tree supports work well for nylon. After print:

1. Let part cool completely
2. Start at support root/base
3. Use flush cutters, don't rip
4. Take care around internal channels

---

## Quality Check

Before assembly, verify:

✅ No visible porosity or bubbles  
✅ Layers fully fused  
✅ No warping or lift  
✅ Supports removed cleanly  
✅ Dimensions within tolerance

---

## Top Cover (SLA Resin Printing)

The top cover is printed using stereolithography (SLA) technology on an Asiga Pro 4K printer with tough resin. This method provides exceptional surface finish and dimensional accuracy required for the final enclosure.

![Top cover resin print](/img/3d-printing/resin_print1.jpg)

**Why SLA for the top cover:**
- **Precision**: 4K resolution ensures perfect fitment with the chassis
- **Surface quality**: Smooth finish without layer lines
- **Material properties**: Tough resin provides durability and weather resistance
- **Complex geometries**: Supports fine details and internal features

### Recommended Resin

**Asiga Tough Resin** or equivalent high-toughness SLA resin:

| Property | Specification | Importance |
|----------|---------------|------------|
| Viscosity | 200-500 cps | Print reliability |
| Tensile strength | >50 MPa | Impact resistance |
| Elongation | >10% | Ductility |
| Heat deflection | >60°C | Thermal stability |

### Print Settings (Asiga Pro 4K)

| Parameter | Value | Notes |
|-----------|-------|-------|
| Layer height | 50-100μm | Balance speed vs. quality |
| Exposure time | 8-12s per layer | Material-dependent |
| Lift speed | 6-8 in/s | Minimize distortion |
| Light-off delay | 1-2s | Allow resin flow |

### Post-Processing

Proper post-processing is critical for resin parts:

1. **Washing**: 5-10 minutes in isopropyl alcohol (IPA) bath
2. **Curing**: UV light exposure for 10-20 minutes per side
3. **Support removal**: Use flush cutters, avoid damaging part
4. **Sanding**: 400-1000 grit for smooth mating surfaces

![Top cover curing process](/img/3d-printing/resin3.jpg)

:::warning Curing is Critical
Uncured resin remains soft and will degrade over time. Always cure parts completely before assembly.
:::

### Quality Verification

Before assembly, inspect the top cover:

✅ **Dimensional accuracy** - Verify all mounting points align  
✅ **Surface finish** - No uncured resin or rough spots  
✅ **Internal features** - Cable channels and mounting bosses intact  
✅ **Fit test** - Dry fit with chassis before final assembly

### Common Issues

| Problem | Symptom | Solution |
|---------|---------|----------|
| Incomplete cure | Tacky surface | Extend UV exposure time |
| Distortion | Warped features | Adjust lift speed/settings |
| Poor adhesion | Part separates from build plate | Clean build plate thoroughly |
| Support marks | Scratches on surface | Careful support placement |

---

## Next Steps

1. [CAD Downloads](/docs/downloads) - Get 3MF files
2. [Parts List](/docs/bom) - Order components
3. [Arm Bonding](/docs/arm-bonding) - Start assembly

