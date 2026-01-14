---
sidebar_position: 4
title: Arm Bonding
---

# Arm Bonding

The most critical step in your build. Each arm is a carbon tube bonded between a motor mount and arm boss using 3M Scotch-Weld DP-490 structural epoxy.

![Properly assembled arm](/img/arm_bonding/Properly%20assembled%20arm.jpg)

:::info Engineered interfaces provide positional accuracy, control joint flow and keying for torsional strength
![Resin channel annotation](/img/arm_bonding/Resin%20channel%20annotation.png)
:::

---

## What You Need

| Item | Notes |
|------|-------|
| 3M Scotch-Weld DP-490 Epoxy | Structural adhesive with applicator gun |
| Carbon tubes | 11mm OD, cut to length |
| Cutting jig | Precision cutting tool for carbon tubes |
| Motor mounts | 4x printed in CF-Nylon |
| Arm bosses | 4x printed in CF-Nylon |
| Acetone | Surface prep (preferred) — isopropyl also works |
| Mixing nozzles | Included with DP-490 |
| Spacer block | For alignment (printed or scrap) |

![Carbon tube cutting jig](/img/tools/Cutting_jig.PNG)

**Cutting Jig:** This precision jig ensures accurate carbon tube lengths for perfect arm assembly. While the jig improves cutting accuracy and consistency, measuring and cutting by hand is sufficient if you prefer not to print it.

### The Epoxy System

We use 3M Scotch-Weld DP-490 structural epoxy applied with a manual applicator gun. This two-part adhesive provides exceptional bond strength for carbon-to-nylon joints.

![Scotch-Weld DP-490 epoxy cartridge](/img/arm_bonding/Scotchweld%20DP-490.jpg)

![Manual applicator gun for DP-490](/img/arm_bonding/Scotch%20weld%20applicator%20gun.jpg)

---

## Process

### 1. Small Batches

Work on **1-2 arms at a time**.

Alignment is more important than speed. DP-490 gives you approximately 90 minutes of working time, but don't rush—get each arm right before moving on.

---

### 2. Surface Prep

- Scuff bond areas with 120-grit sandpaper
- Clean all surfaces with acetone (preferred) or isopropyl alcohol
- Let dry completely

---

### 3. Epoxy Injection System

The CF-Nylon motor mounts feature **internal injection ports** that perfectly distribute epoxy around the carbon tube. This design ensures complete, void-free coverage of the bond surface.

![Internal injection port in the motor mount](/img/arm_bonding/Epoxy%20injection%20port.png)

#### Injection Process

1. Insert the carbon tube into the motor mount socket until seated
2. Attach the mixing nozzle to your DP-490 cartridge
3. Insert the nozzle tip into the injection port
4. Slowly inject epoxy until you see it appear at the opposite end

![Epoxy being injected through the internal port](/img/arm_bonding/Epoxy_injection.jpg)

![Epoxy distribution through the internal channels](/img/arm_bonding/Epoxy_injection_2.jpg)

The internal channels ensure epoxy flows completely around the tube, creating a stronger bond than traditional surface application.

:::tip
Inject slowly and steadily. You'll see epoxy appear at the gap between the tube and socket when the cavity is full. Stop injecting at this point.
:::

![Adhesive placement reference](/img/arm_bonding/Explode_resin_interface.png)

---

### 4. Assemble In Order

1. Insert tube into **motor mount** first
2. Then insert other end into **arm boss**

Push until seated. Small amount of squeeze-out is normal.

![Carbon tube insertion](/img/arm_bonding/Screw_insertion.png)

![Carbon tube fully seated in the motor mount](/img/arm_bonding/Tube%20seated%20annotation.png)

---

### 5. Alignment Check

**Critical step.**

1. Place spacer under the arm boss end
2. Whole arm should sit **flat and planar**
3. Sight down the arm axis
4. Rotate until motor mount and arm boss are **in the same plane**

![Arm alignment reference](/img/arm_bonding/ISO_view%20not%20annotated.png)

---

### 6. Cure

- Lay flat, undisturbed
- **24 hours** minimum for full cure
- Recommended: do **two arms at a time**, not all four

---

## High Performance Motor Mounts

:::warning High performance motor mounts for critical applications

We offer the option of printing motor mounts with the high performance **Continuous Carbon Fiber** printing process provided by Markforged printers. This part can be up to **335% stronger** depending on the exact load case.

**Not all applications will require this level of safety factor.** Though if your drone is used in professional applications requiring elevated safety factors, this is a go-to upgrade.

![High performance motor mounts for critical applications](/img/arm_bonding/Critical_applications.png)
:::

---

## Acceptance Criteria

✅ No visible gaps at bond joints  
✅ Motor mount and arm boss are coplanar  
✅ Arm sits flat on surface (no twist)  
✅ Squeeze-out cleaned before cure

---

## Common Mistakes

| Mistake | Result |
|---------|--------|
| Arms not aligned | Motors not in plane, vibration issues |
| Too much epoxy | Messy, adds weight |
| Not enough epoxy | Weak bond, may fail |
| Moving before cure | Bond failure |
| Wet nylon parts | Weak adhesion |

---

## Next Steps

1. Allow 24 hours cure time
2. Proceed to [Assembly](/docs/assembly)
3. See [Firmware](/docs/inav) for iNav configuration
