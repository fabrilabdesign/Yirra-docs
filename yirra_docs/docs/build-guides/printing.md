---
sidebar_position: 4
---

# 3D Printing Guide

Complete printing specifications for all Replicant GEN 1 components.

![STL Exploded View](/img/drone/STL_explode.png)

## Material Requirements

### Primary Structural Parts

**PA-CF (Polyamide Carbon Fiber) or Nylon** - REQUIRED for flight-critical parts:
- Front/rear shells
- Arm bosses and motor mounts
- Rail blocks and exospine components
- GPS mast

**Properties needed:**
- High heat deflection temperature
- Excellent layer adhesion
- Vibration damping
- Impact resistance

### Flexible/Isolation Parts

**TPU/TPE (Thermoplastic Polyurethane/Elastomer)**:
- Landing pads
- Camera isolation mounts
- Nose bumpers
- Wire grommets

**Shore Hardness:** 85A-95A for structural support, 60A-75A for maximum damping

### Aerodynamic Surfaces

**SLA Resin** (optional, for top cover):
- Smooth surface finish
- Precise dimensions
- Aesthetic appeal

![Nose Cone Detail](/img/drone/nose_cone.png)

![TPE Nose Cone](/img/drone/TPE_nose_cone.gif)

### Test Fits Only

**PETG** - Acceptable for:
- Prototype parts
- Jigs and fixtures
- Non-flight components

![Cutting Jig Reference](/img/drone/Cutting_jig.PNG)

:::danger Never Use PLA for Flight Parts
PLA has insufficient heat resistance and will deform in flight or during normal use. Use only for test fits and temporary fixtures.
:::

## Print Settings by Material

### PA-CF / Nylon Settings

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Layer Height** | 0.2-0.28mm | Balance of strength and time |
| **Nozzle Size** | 0.6mm | Hardened steel required for CF |
| **Nozzle Temp** | 260-275°C | Adjust per filament brand |
| **Bed Temp** | 70-90°C | Garolite or PEI sheet recommended |
| **Print Speed** | 40-60mm/s | Slower for better layer adhesion |
| **Walls** | 4-6 | Critical for structural integrity |
| **Top/Bottom Layers** | 6-8 | Fully solid surfaces |
| **Infill** | 30-50% (shells), 60-80% (roots/spine) | Gyroid or grid pattern |
| **Support** | Organic or tree supports | Minimize contact with critical surfaces |

:::tip Drying is Critical
Nylon and PA are **highly hygroscopic**. Dry filament at 60-70°C for 4-6 hours before printing. Store in airtight containers with desiccant.
:::

### TPU/TPE Settings

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Layer Height** | 0.24-0.28mm | Thicker layers reduce print time |
| **Nozzle Size** | 0.4-0.6mm | Standard nozzle OK |
| **Nozzle Temp** | 220-235°C | Per manufacturer specs |
| **Bed Temp** | 40-60°C | Light adhesion needed |
| **Print Speed** | 20-40mm/s | Slow to prevent stringing |
| **Walls** | 2-3 | Flexible parts don't need many |
| **Infill** | 20-40% | Depends on desired stiffness |
| **Retraction** | Minimal (0.5-2mm) | Direct drive works best |

### SLA Resin Settings

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Layer Height** | 0.05-0.1mm | Fine detail |
| **Exposure Time** | Per resin datasheet | Test with calibration prints |
| **Supports** | Light, easily removable | Support critical surfaces |
| **Post-Processing** | Wash in IPA, UV cure | Follow resin manufacturer instructions |

## Print Orientation

:::warning Critical for Strength
Orient parts to align layer lines with load paths. Incorrect orientation can reduce strength by 50% or more.
:::

### General Rules

1. **Shells**: Print with mounting surfaces on build plate
2. **Arm bosses**: Orient so layers run perpendicular to arm tube axis
3. **Rail blocks**: Flat side down, layers parallel to rail direction
4. **Motor mounts**: Base on build plate, layers perpendicular to motor shaft

### Preview Each STL

Each STL file in your download pack includes recommended orientation markers. **Always check the preview** before slicing.

## Critical Tolerances

### Rail Channels

- Must be smooth for battery slides
- Lightly deburr after printing
- Test fit with rail blocks before assembly

### Arm Tube Holes
- 11mm diameter (may need light reaming)
- Circular, not oval
- Check with calipers after printing

### Heat-Set Insert Holes
- Slightly undersized (will expand when heated)
- Keep pilot holes clean and straight

## Quality Control Checklist

Before using any printed part:

- [ ] **Visual inspection**: No layer separation or cracks
- [ ] **Dimensional check**: Critical features within ±0.2mm
- [ ] **Surface finish**: Smooth on mating surfaces
- [ ] **No warping**: Parts sit flat and true
- [ ] **Insert holes**: Clean and properly sized

## Common Printing Issues

### Warping/Lifting

**Causes:**
- Insufficient bed adhesion
- Thermal contraction (especially nylon)
- Poor bed leveling

**Solutions:**
- Use brim or raft
- Enclose printer to reduce drafts
- Increase bed temperature
- Apply adhesive (glue stick for nylon)

### Layer Separation

**Causes:**
- Under-extrusion
- Insufficient nozzle temperature
- Wet filament

**Solutions:**
- Calibrate flow rate
- Increase nozzle temp by 5-10°C
- **Dry filament** thoroughly

### Stringing (TPU)

**Causes:**
- Excessive retraction
- Too hot nozzle temperature
- High humidity

**Solutions:**
- Reduce retraction distance
- Lower temperature
- Reduce travel speed

### Poor Bridging

**Causes:**
- Insufficient cooling
- Too hot
- Wrong orientation

**Solutions:**
- Increase part cooling fan speed
- Reduce temperature slightly
- Reorient part to minimize bridges

## Post-Processing

### Deburing

- Remove support material carefully
- File or sand mating surfaces smooth
- Keep rail channels free of debris

### Heat-Set Inserts

Install while parts are still warm from the printer (or reheat slightly):
1. Set soldering iron to 200-220°C
2. Place insert on pilot hole
3. Apply light, even pressure
4. Let cool completely before handling

:::tip Insert Installation
Install inserts on scrap pieces first to dial in temperature and technique. Over-melting weakens the plastic around the insert.
:::

### Annealing (Optional)

Low-temperature annealing can improve dimensional stability:
1. Place in oven at 80-100°C (nylon/PA)
2. Hold for 30-60 minutes  
3. Slow cool inside oven
4. **Test on scrap first** - annealing can cause warping

## Print Time Estimates

| Part Type | Quantity | Approx. Time (PA-CF) |
|-----------|----------|---------------------|
| Front Shell | 1 | 12-18 hours |
| Rear Shell | 1 | 10-16 hours |
| Arm Bosses (set of 4) | 4 | 8-12 hours |
| Motor Mounts (set of 4) | 4 | 6-10 hours |
| Rail Blocks | 2 | 4-6 hours |
| Miscellaneous parts | Various | 8-12 hours |
| **Total** | - | **48-74 hours** |

:::info Printing Services
Don't have a suitable printer? Many local makerspaces and online services (Craftcloud, 3D Hubs) can print PA-CF parts. Upload your STLs and specify material requirements.
:::

## Printer Requirements

Minimum specifications for printing Replicant GEN 1 parts:

- **Build Volume**: 220 x 220 x 250mm (minimum)
- **Heated Bed**: Up to 100°C
- **All-Metal Hotend**: Required for PA-CF temperatures
- **Hardened Nozzle**: Steel or ruby for carbon-filled materials
- **Enclosure**: Strongly recommended for nylon/PA
- **Direct Drive**: Helpful for TPU (not required)

## 3D Printing Files

Download the pre-configured Bambu Studio project files (.3MF) and STL files for all Replicant GEN 1 components. The .3MF files contain optimized print settings, supports, and orientations for your specific printer.

### Core Chassis Components

![Chassis Core Bambu Studio Screenshot](/img/3d-printing/Chassis_core.png)  
*Bambu Studio project file with optimized settings for core structural components*

- **Download**: [.3MF File](/files/3d-printing/3mf/Chassis_core.3mf) | [STL Files](/files/3d-printing/stl/replicant_gen1_complete.zip)
- **Material**: PA-CF or Nylon
- **Print Time**: ~24-32 hours
- **Includes**: Exospine, rail blocks, GPS mast mounting

### Battery Rail System

![Battery Rail Bambu Studio Screenshot](/img/3d-printing/Battery%20rail.png)  
*Bambu Studio project with precise rail channel tolerances*

- **Download**: [.3MF File](/files/3d-printing/3mf/Battery_mounting_rail.3mf) | [STL Files](/files/3d-printing/stl/replicant_gen1_complete.zip)
- **Material**: PA-CF or Nylon
- **Print Time**: ~8-12 hours
- **Includes**: Rail blocks, latch mechanisms, mounting hardware

### Motor Mounts & Arm Bosses

![Motor Mounts & Arm Bosses Bambu Studio Screenshot](/img/3d-printing/Motor_mounts_arm_bosses.png)
*Optimized orientation for maximum strength-to-weight ratio*

- **Download**: [.3MF File](/files/3d-printing/3mf/Motor_mounts_arm_bosses.3mf) | [STL Files](/files/3d-printing/stl/replicant_gen1_complete.zip)
- **Material**: PA-CF or Nylon
- **Print Time**: ~16-24 hours
- **Includes**: 4x motor mounts, 4x arm bosses, mounting hardware

### Nose Cone & Aerodynamics

![Nose Cone Bambu Studio Screenshot](/img/3d-printing/nose_cone.png)
*Precision aerodynamic surface with camera isolation features*

- **Download**: [.3MF File](/files/3d-printing/3mf/Nose%20cone%2004%20mount.3mf) | [STL Files](/files/3d-printing/stl/replicant_gen1_complete.zip)
- **Material**: TPU/TPE (recommended) or PA-CF
- **Print Time**: ~4-8 hours
- **Includes**: Nose cone, camera mount, vibration isolation

## Complete File Archive

### All 3MF Project Files
Pre-configured Bambu Studio projects with optimal print settings:

- [Chassis Core Components](/files/3d-printing/3mf/Chassis_core.3mf)
- [Battery Rail System](/files/3d-printing/3mf/Battery_mounting_rail.3mf)
- [Motor Mounts & Arm Bosses](/files/3d-printing/3mf/Motor_mounts_arm_bosses.3mf)
- [Nose Cone & Aerodynamics](/files/3d-printing/3mf/Nose%20cone%2004%20mount.3mf)

### All STL Files (Universal)
Standard STL files compatible with any slicer:

- [Download Complete STL Package](/files/3d-printing/stl/replicant_gen1_complete.zip)

:::info File Organization
- **3MF files**: Use with Bambu Studio for optimal results
- **STL files**: Universal format for other slicers (PrusaSlicer, Cura, etc.)
- All files include proper orientation markers and support structures
:::

## Next Steps

Once your parts are printed and post-processed, move on to [Assembly](/docs/build-guides/assembly).


