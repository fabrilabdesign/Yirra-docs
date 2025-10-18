---
sidebar_position: 1
title: Comprehensive Build Guide
---

# Building the Replicant GEN 1 (IC‑01)

Complete start-to-finish reference for the GEN 1 platform.

![IC-01 Rear View](/img/drone/Rear_iso_2.png)

## Platform Overview

**Replicant GEN 1 (IC‑01)** is a 3D‑printable long‑range FPV platform designed around:
- **Modular battery rails** for hot-swap capability
- **Tubular carbon arms** with higher strength-to-weight ratio
- **Refined aerodynamic shell** reducing camera jello
- **DJI O4 Pro compatibility** for professional video
- **Versatile payload support** for various mission profiles

![IC-01 Full View](/img/drone/Above_iso_hero.png)

This guide aligns with the [Drone Features](https://yirrasystems.com/drone-features) and [Products](https://yirrasystems.com/products) pages on our main site.

## Build Variants & Configuration Matrix

Choose your configuration based on intended use:

### Endurance (LR‑E)
**Goal:** Maximum flight time and range

- **Props:** 7–8″ 2‑blade
- **Motors:** 1500–1600 KV, 2328 stator (6S)
- **ESC:** iFlight Blitz E55 (55-65A)
- **Battery:** 6S 3000–4000 mAh Li‑ion (rail-mounted)
- **Flying Style:** Cruise efficiency, gentle throttle response
- **Expected Flight Time:** 25-40 minutes (depends on conditions)

### All‑Rounder (AR)
**Goal:** Balance of performance and endurance

- **Props:** 7″ 3‑blade
- **Motors:** 1700 KV, 2225 stator (6S)
- **ESC:** iFlight Blitz E55 (45-55A)
- **Battery:** 6S 2200–3000 mAh LiPo (rail-mounted)
- **Flying Style:** Balanced punch and range
- **Expected Flight Time:** 15-25 minutes

### Payload/Cine (PC)
**Goal:** Smooth footage with payload capacity

- **Props:** 7–8″ 2‑blade
- **Motors:** 1300–1500 KV, 2528 stator (6S)
- **ESC:** iFlight Blitz E55 (55-65A)
- **Battery:** 6S 3000–5000 mAh Li‑ion (rail-mounted)
- **Flying Style:** Smooth control for cinema work
- **Payload Capacity:** +200-400g over base config

:::info Choosing Your Variant
First-time builders should start with **All-Rounder (AR)** configuration. It provides the most versatile performance while you learn the platform.
:::

## Complete Build Process

The build is organized into these major phases:

### Phase 1: Preparation
1. Review [Bill of Materials](/docs/build-guides/bom)
2. Gather [Tools & Materials](/docs/build-guides/tools)
3. Order or download STL files

### Phase 2: Fabrication
1. [3D Print](/docs/build-guides/printing) all frame parts (48-74 hours)
2. Cut carbon fiber tubes and plates
3. Install heat-set inserts
4. Post-process printed parts

### Phase 3: Electronics
1. Solder ESC and add capacitor
2. Prepare flight controller
3. Wire video system
4. Install receiver and GPS

### Phase 4: Assembly
1. [Assemble airframe](/docs/build-guides/assembly)
2. Install electronics stack
3. Route and manage cables
4. Install battery rails

### Phase 5: Configuration
1. Flash and configure firmware using Betaflight or INAV Configurator
2. Set up failsafe and modes
3. Calibrate sensors
4. Configure OSD

### Phase 6: Testing & Tuning
1. Bench testing with smoke stopper
2. [Pre-flight checks](/docs/build-guides/assembly#pre-power-checklist)
3. [Maiden flight and tuning](/docs/build-guides/tuning)
4. Iterative optimization

## Key Design Features

### No-Strap Battery System

The modular rail system eliminates battery straps:

1. **Rails** machined into exospine
2. **Latch mechanism** secures battery
3. **Hot-swap** in seconds
4. **Repeatable CG** every battery change

![Stackable Battery System](/img/drone/Stackable_batteries.png)

![Battery Options](/img/drone/Molicel_p50b.PNG)

### Tubular vs Flat Arms

Why we use round carbon tubes:

- **Higher bending stiffness** at equal mass
- **Reduced torsional resonance** vs flat plates
- **Cleaner aerodynamics** for efficiency
- **Standard sizes** available worldwide

### Camera Isolation System

Multi-stage vibration isolation:

1. **Exospine damping** - frame absorption
2. **TPU bobbins** - camera-specific isolation
3. **Tuned mass** - balanced for 7-8" props
4. **Shell design** - nose geometry reduces airflow turbulence

## Detailed Dimensional Callouts

:::info From STL Pack Release Notes
Always refer to your specific STL pack release notes for exact dimensions. These are starting references:
:::

- **Arm tube length:** Per variant (typically 180-220mm)
- **Arm tube OD/ID:** 11mm OD (verify ID matches motors)
- **Rail center-to-center:** Per exospine design
- **Rail slot width:** Designed for standard battery shells
- **FC stack height window:** 30mm maximum

## Assembly Sequence Summary

The full process is detailed in [Assembly](/docs/build-guides/assembly), but the overview is:

```
1. Dry-fit → Test all parts fit together
2. Exospine → Build central structure
3. Arms → Install carbon tubes and bosses
4. Electronics → Wire and test on bench
5. Integration → Combine frame and electronics
6. Shells → Close up airframe
7. Rails → Install battery system
8. Props → Final step before flight
```

## Firmware Quick Reference

### Betaflight Basic Setup

```
1. Flash target and reset
2. Ports: UART for RX (Serial), UART for GPS (115200/UBX)
3. Motor protocol: DShot600, bidir DShot ON
4. Mixer: Quad X (verify motor order props-off)
5. Filters: RPM filtering ON, dynamic notch default
6. PID: Start with 7-8" LR preset
7. Failsafe: Stage 2 Drop or GPS Rescue
8. OSD: Voltage, Current, RSSI, GPS sats, home arrow
```

:::tip Flight Controller Configuration
Configure your flight controller using Betaflight Configurator or INAV Configurator depending on your chosen firmware. Follow standard setup procedures for your specific FC model.
:::

### INAV Setup

For navigation-focused builds:

1. Flash stable INAV
2. Load **7–8″ LR preset**
3. Calibrate accelerometer and compass
4. Set **GPS Rescue/RTH** parameters
5. Enable **Autotune** for maiden flight
6. Test RTH in safe area before long-range

## Serviceability & Upgrade Path

The Replicant GEN 1 is designed for easy maintenance:

### Quick-Swap Components
- **Arms:** Replace tubes in minutes with basic tools
- **Nose cone:** Keep spare for hard landings
- **Battery:** Swap rail packs instantly
- **Camera:** Quick-release from isolation cradle

### Upgrade Options
- Different arm lengths for size variants
- Alternative camera cages (various lens sizes)
- Antenna masts for different frequencies
- Landing gear configurations
- Payload carriers and mounts

### Spare Parts to Keep

Recommended spare inventory:
- 1 set propellers
- 1 nose cone (TPU/TPE)
- 2 arm tubes
- Landing pads (TPU)
- Assorted fasteners

## Maintenance Schedule

### After Every Flight
- [ ] Visual inspection for damage
- [ ] Check prop security
- [ ] Wipe down airframe

### Weekly (or every 10 flights)
- [ ] Torque check on arm roots
- [ ] Inspect battery rail latch
- [ ] Clean camera lens
- [ ] Check for loose screws

### Monthly (or every 50 flights)
- [ ] Full disassembly inspection
- [ ] Check carbon fiber for cracks
- [ ] Test GPS cold fix time
- [ ] Verify FC sensors

## Success Criteria

Your build is ready for maiden flight when:

- [ ] All systems tested on bench
- [ ] Smoke stopper test passed
- [ ] Motors spin correctly (props off)
- [ ] GPS achieves fix (≥8 satellites)
- [ ] Video feed clean
- [ ] Receiver shows good LQ/RSSI
- [ ] CG balanced correctly
- [ ] All screws torqued
- [ ] Failsafe tested and working

## Timeline Expectations

### DIY Build (Printing Your Own)
- **Week 1-2:** Order parts, print frames
- **Week 3:** Assembly and wiring
- **Week 4:** Firmware, testing, tuning

### Kit Build (Physical Frame Kit)
- **Day 1-2:** Assembly and wiring
- **Day 3:** Firmware and bench testing
- **Day 4-5:** Maiden flight and tuning

## Attribution & Licensing

This platform is built on open-source principles. Refer to the [Yirra Systems website](https://yirrasystems.com) for the latest license terms that apply to your STL pack and any commercial use.

## Community Contributions

- Share your build on social media
- Submit improvements via pull requests
- Document your tune for your variant
- Help other builders in forums

---

## Detailed Sections

For in-depth information on each build phase:

- **[Bill of Materials](/docs/build-guides/bom)** - Complete parts list with rationale
- **[Tools & Materials](/docs/build-guides/tools)** - Workshop requirements
- **[Printing Guide](/docs/build-guides/printing)** - Material specs and profiles
- **[Assembly](/docs/build-guides/assembly)** - Step-by-step construction
- **[Tuning](/docs/build-guides/tuning)** - Optimization procedures
- **[Troubleshooting](/docs/build-guides/troubleshooting)** - Problem solving

**Happy building!**


