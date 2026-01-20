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

![Fiberon PA6-CF Filament](/img/3d-printing/Fiberon_reel.avif)

**Why PA6-CF:**
- High tensile strength from carbon fiber reinforcement
- Excellent layer adhesion
- Consistent diameter for reliable printing
- Pre-dried spools reduce prep time

Other CF-Nylon filaments may work, but print settings will need adjustment.

---

## The Golden Rule - DRY YOUR FILAMENT!

> **If you're not sure it's dry, dry it again.**

Wet nylon = weak parts + ugly supports + failed prints.

---

## Fiberon PA6-CF20 Printing Guide

:::info Technical Reference
For complete specifications, see the [Fiberon PA6-CF20 Technical Data Sheet](/files/PDF's/TDS_FIBERON-PA6-CF20_V1.1_EN.pdf)
:::

### Why PA6-CF20 for Drones

For high-stress printed drone parts, carbon-fiber reinforced Nylon 6 (PA6-CF20) delivers exceptional performance:

**Key Benefits:**
- **Stiffness**: X-Y Young's modulus ~8636 MPa keeps arms rigid and flight behavior consistent
- **Strength**: Outstanding layer adhesion resists impact delamination
- **Heat Resistance**: Heat deflection temperature 173°C @ 1.8 MPa
- **Durability**: Better real-world handling than PLA-type materials

**Critical Consideration:** PA6 is moisture-sensitive. Performance drops dramatically when wet—dry-state tensile strength (109 MPa) falls to ~55 MPa when saturated.

### Drying & Storage

**Drying:** 100°C for 10 hours before printing (critical for consistent performance)

**Storage:** Keep dry (RH < 20%). Use vacuum bags with desiccant or a dry box. Re-dry exposed spools.

**Why Strict?** Equilibrium moisture absorption is ~3.3%. Wet material shows 70%+ reduction in mechanical properties.

### Print Settings (PA6-CF20 Optimized)

| Setting | Value | Notes |
|---------|-------|-------|
| Nozzle Temp | 280–300°C | Higher than standard nylon for CF reinforcement |
| Bed Temp | 40–50°C | Low to prevent oozing, use adhesion promoter |
| Chamber | Room temp | No heated chamber required |
| Part Cooling | OFF | Essential for proper layer bonding |
| Print Speed | Up to 300 mm/s | Printer-dependent, use as upper bound |
| Supports | PolyDissolve™ S1 | Recommended for easy removal |

### Equipment Considerations

**Nozzle:** Use hardened steel or ruby. Brass wears out in ~9 hours due to abrasive carbon fiber.

**Adhesion:** Apply thin layer of glue stick to textured PEI surface. Low bed temperature prevents oozing.

### Post-Processing

**Annealing:** 100°C for 16 hours after printing (matches datasheet test conditions for optimal stability)

**Support Removal:** Remove supports promptly to prevent moisture-induced bonding

---

## Bed Adhesion

Nylon requires extra adhesion help:

1. **Glue stick** - Thin, even layer (Elmer's purple works)
2. **Clean bed** - IPA wipe before glue
3. **Textured PEI** - Better than smooth for nylon
4. **Brim** - 5mm brim for large parts

---

## Print Order

Optimized print sequence for efficient workflow:

1. **Arm Bosses** - Start with these small parts
2. **Motor Mounts** - Print next for assembly
3. **Assemble and bond the arms** while Chassis Core is printing (time saver)
4. **Chassis Core** - Largest, most complex (print while assembling arms)
5. **Battery Rails** - Print last (CF-Nylon)

**Nose Cone:** Change to 0.6mm nozzle for TPE flexible filament

---

## 3MF Files & Print Previews

The following 3MF files are pre-configured for Bambu Studio with optimized settings, supports, and orientations for reliable CF-Nylon printing.

### Arm Bosses

The foundation of each arm assembly - these precision-machined nylon bosses provide the mounting interface between carbon fiber tubes and motor mounts.

![Arm Bosses 3MF Preview](/img/3MF%20screen%20shots/Arms_bosses.png)

**Download:** [Arm Bosses 3MF](/files/3d-printing/3mf/Arm_bosses.gcode.3mf) | [Arm Bosses STEP Files](/files/STEP_Files/)

*Print these first - small, fast prints that establish your material and settings before committing to larger parts.*

### Motor Mounts

High-strength motor mounting brackets with integrated epoxy injection ports for superior carbon fiber tube bonding.

![Motor Mounts 3MF Preview](/img/3MF%20screen%20shots/Motor_mounts.png)

**Download:** [Motor Mounts 3MF](/files/3d-printing/3mf/Motor_mounts.gcode.3mf) | [Motor Mount STEP](/files/STEP_Files/Motor_mount.stp)

*Complex internal channels ensure complete epoxy distribution around the carbon tubes for maximum bond strength.*

### Chassis Core

The structural heart of the Replicant - this monolithic chassis core houses all electronics and provides mounting points for arms, battery, and payload.

![Chassis Core 3MF Preview](/img/3MF%20screen%20shots/Chassis_core.png)

**Download STEP:** [Chassis Core CAD](/files/STEP_Files/Chassis_core.stp)

:::warning USB Orientation Options
Choose the appropriate chassis version based on your flight controller USB port orientation:
- **[Left USB Version](/files/3d-printing/3mf/Chassis_core_left_USB.gcode.3mf)** - USB port faces left when viewed from above
- **[Right USB Version](/files/3d-printing/3mf/Chassis_core_right_USB.gcode.3mf)** - USB port faces right when viewed from above

**Both versions are compatible with 20x20mm and 30x30mm flight controller stack sizes.**
:::

*The largest and most complex print - features integrated cable management, vibration isolation, and precise mounting tolerances.*

### Battery Rail Male

Precision battery mounting rail with integrated securing features and vibration isolation mounts.

![Battery Rail Male 3MF Preview](/img/3MF%20screen%20shots/Battery_rail_male.png)

**Download:** [Battery Rail Male 3MF](/files/3d-printing/3mf/Battery_rail_male.gcode.3mf) | [Battery Rail STEP](/files/STEP_Files/battery_rail_male.stp)

*Critical for secure battery mounting and optimal center of gravity positioning.*

## Nose Cone 04 Mount

**Material: Spidermaker TPE (Matte Black)** - Flexible filament requiring specialized printing techniques.

![TPE Filament Setup](/img/3d-printing/Spidermaker%20TPE.jpg)

**Key TPE Printing Requirements:**
- **Direct drive extruder** - TPE's elasticity requires direct filament feeding to reduce friction
- **Direct filament feeding** - Take the top of the printer and place the reel immediately adjacent to the print for optimal TPE feeding
- **0.6mm nozzle** - Essential for proper flow control with flexible filament
- **Thorough drying** - Dry at 50°C for 8-12 hours before printing

**TPE Print Settings:**
- Temperature: 230-250°C
- Bed Temp: 40-50°C
- Print Speed: 30-50 mm/s
- Supports: PVA water-soluble
- Retraction: Minimal

:::info TPE vs Nylon
TPE printing differs significantly from nylon. These settings were developed through extensive testing to ensure reliable results.
:::

![Nose Cone 04 Mount 3MF Preview](/img/3MF%20screen%20shots/Nose_cone_04_mount.png)

**Download:** [Nose Cone 04 Mount 3MF](/files/3d-printing/3mf/Nose%20cone%2004%20mount.gcode.3mf)

*Flexible mounting bracket designed for vibration dampening and precise GPS antenna positioning.*

These 3MF files include:
- ✅ Optimized print orientation for strength
- ✅ Automatic support generation
- ✅ Bambu Studio-specific settings
- ✅ CF-Nylon material profiles
- ✅ Quality assurance checkpoints

## STEP Files

Additional STEP files for CAD design, modification, and analysis:

- **[Complete Replicant Gen1 Assembly](/files/STEP_Files/Replicant_gen1.stp)** - Full assembly model
- **[Bottom Plate](/files/STEP_Files/bottom_plate.stp)** - Base mounting plate
- **[Top Plate](/files/STEP_Files/top_plate.stp)** - Upper mounting plate
- **[Upper Shell](/files/STEP_Files/upper_shell.stp)** - Protective housing
- **[Exo Spine](/files/STEP_Files/Exo_spine.stp)** - Structural backbone
- **[04cm Mount](/files/STEP_Files/04cm.stp)** - Small mounting bracket

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

The top cover is printed using stereolithography (SLA) technology with tough resin. While the original specification calls for an Asiga Pro 4K printer (a powerful professional-grade SLA machine), many modern SLA printers can produce this part faithfully.

**Recommended SLA Alternatives:**
- **Phrozen Sonic Series**: Mini 8K or Sonic Mega 8K - excellent value and performance
- **Formlabs**: Form 3 or Form 4 - professional-grade reliability
- **Other modern SLA printers** with 4K+ resolution and tough resin compatibility

SLA provides exceptional surface finish and dimensional accuracy required for the final enclosure.

![Top cover resin print](/img/3d-printing/resin_print1.jpg)

**Why SLA for the top cover:**
- **Precision**: 4K resolution ensures perfect fitment with the chassis
- **Surface quality**: Smooth finish without layer lines
- **Material properties**: Tough resin provides durability and weather resistance
- **Complex geometries**: Supports fine details and internal features

### Recommended Resin

**Tough/Engineering Resin** suitable for your SLA printer (Asiga Tough, Formlabs Tough, or equivalent):

| Property | Specification | Importance |
|----------|---------------|------------|
| Viscosity | 200-500 cps | Print reliability |
| Tensile strength | >50 MPa | Impact resistance |
| Elongation | >10% | Ductility |
| Heat deflection | >60°C | Thermal stability |

### Print Settings (General SLA)

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

