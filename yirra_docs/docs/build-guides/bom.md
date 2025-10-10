---
sidebar_position: 2
---

# Bill of Materials (BOM)

Complete parts list for building the Replicant GEN 1 (IC‑01) platform.

![Component Layout](/img/drone/annotated_explode.PNG)

## Frame & Structural Components

### Dimension-Locked Parts

These dimensions are critical and must match the STL specifications:

| Part | Specification | Quantity | Notes |
|------|--------------|----------|-------|
| **Arm Tubes** | 11mm OD carbon fiber | 4 | Length per STL release notes |
| **Exo-Spine Plate** | 4mm carbon fiber | 1 | Main structural reinforcement |
| **Reinforcement Plates** | 3mm carbon fiber | 2-4 | Per assembly diagram |
| **Reinforcement Plates** | 2mm carbon fiber | 2-4 | Per assembly diagram |

### Printed Parts

Available as **Physical Frame Kits** or **Digital STL Downloads**:

| Part | Material | Quantity | Purpose |
|------|----------|----------|---------|
| **Arm Bosses** | CF-Nylon | 4 | Arm attachment points |
| **Motor Mounts** | CF-Nylon | 4 | Secures motors to arms |
| **Nose Cone** | TPE/TPU | 1 | O4 Pro compatible shroud |
| **Top Cover** | SLA Resin | 1 | Aerodynamic shell |
| **Front Shell** | CF-Nylon | 1 | Main body (front) |
| **Rear Shell** | CF-Nylon | 1 | Main body (rear) |
| **Rail Blocks** | CF-Nylon | 2 | Battery mounting rails |
| **GPS Mast** | CF-Nylon | 1 | GPS/compass mount |
| **Landing Pads** | TPU | 4 | Impact protection |

:::tip Material Selection
- **CF-Nylon**: Primary structural material for strength and heat resistance
- **TPU/TPE**: Vibration dampening and impact zones
- **SLA Resin**: Smooth aerodynamic surfaces
- **PETG**: Acceptable for test fits and non-critical parts
:::

## Electronics

### Critical - Shell-Constrained Components

:::warning ESC Compatibility
The **iFlight Blitz E55** is the ONLY ESC that fits the unmodified shells without modifications. Other ESCs will require shell customization.
:::

| Component | Specification | Notes |
|-----------|--------------|-------|
| **ESC** | **iFlight Blitz E55 (required)** | 4-in-1, 55A, BLHeli_32, bidirectional DShot |
| **Flight Controller** | F7 or H7 | 30.5mm or 25.5mm mounting pattern |
| **Motors** | 7-8" class, 1300-1700 KV | See variant table below |
| **Propellers** | 7-8" | 2-blade for efficiency, 3-blade for control |
| **Video Transmitter** | DJI O4 Pro or O3 | Professional HD video |
| **Camera** | DJI compatible | Matches your VTX choice |
| **Receiver** | ELRS 2.4 GHz recommended | Or your preferred system |
| **GPS Module** | M10/QMC5883 class | With compass |
| **Capacitor** | ≥1000µF, 35-50V | Low-ESR, close to ESC |

### Motor/Prop Combinations by Variant

| Build Type | Motors (6S) | Props | Target Use |
|------------|-------------|-------|------------|
| **Endurance (LR‑E)** | 1500-1600 KV, 2328 stator | 7-8" 2-blade | Maximum range/flight time |
| **All‑Rounder (AR)** | 1700 KV, 2225 stator | 7" 3-blade | Balance of range and performance |
| **Payload/Cine (PC)** | 1300-1500 KV, 2528 stator | 7-8" 2-blade | Smooth footage, heavy payloads |

## Power System

| Component | Specification | Quantity | Notes |
|-----------|--------------|----------|-------|
| **Battery** | 6S modular pack (rail-mounted) | 1-2 | 3000-5000 mAh Li-ion or LiPo |
| **Main Connector** | XT60 or XT90 | 1 | Match battery connector |
| **Balance Lead** | JST-XH 7-pin | 1 | With strain relief |

![Molicel Battery Cells](/img/drone/Molicel_p50b.PNG)

### Camera Mount Options

![GoPro Mount](/img/drone/go_pro_mount.png)

:::info Battery Options
- **Li-ion cells**: Best for long-range (higher energy density)
- **LiPo**: Better for performance (higher discharge rates)
- Modular rail packs enable hot-swapping without straps
:::

## Fasteners & Hardware

| Item | Size | Quantity | Purpose |
|------|------|----------|---------|
| **Heat-Set Inserts** | M3 | 40-60 | Threaded mounting points |
| **Socket Head Screws** | M3 x 8mm | 20-30 | General assembly |
| **Socket Head Screws** | M3 x 12mm | 10-15 | Arm mounting |
| **Socket Head Screws** | M3 x 16mm | 4-8 | Stack mounting |
| **Threadlocker** | Blue (medium strength) | 1 bottle | Metal-to-metal only |

:::tip Torque Specifications
- M3 into heat-set inserts: **0.6-0.9 Nm**
- Carbon tube clamp screws: Tighten evenly, do NOT ovalize tubes
:::

## Wiring & Connectors

| Item | Specification | Length | Notes |
|------|--------------|--------|-------|
| **Main Power Leads** | 14-16 AWG silicone | 20cm | ESC to battery |
| **Motor Leads** | 16-18 AWG silicone | As needed | Extend if routing internally |
| **Signal Wire** | 26-28 AWG | Various | UART connections |
| **Heat Shrink** | Various sizes | Assorted | Wire protection |
| **Zip Ties** | 2-3mm width | 20-30 | Cable management |

## Tools Required

See the [Tools & Materials](/docs/build-guides/tools) page for complete tool list.

## Where to Purchase

### Official Yirra Products
- **STL Digital Packs**: [yirrasystems.com/stl-files](https://yirrasystems.com/stl-files)
- **Physical Frame Kits**: [yirrasystems.com/products](https://yirrasystems.com/products)
- **Complete Solutions**: [yirrasystems.com/products](https://yirrasystems.com/products)

### Electronics
- **ESC**: iFlight official store or authorized dealers
- **Motors, Props, FC**: Major FPV retailers (RDQ, GetFPV, etc.)
- **DJI O4 Pro/O3**: DJI authorized dealers

### Carbon Fiber
- Carbon tube and plate specialists
- Ensure 11mm OD tubes and specified plate thicknesses

## Next Steps

Once you have your BOM sorted, proceed to [Tools & Materials](/docs/build-guides/tools) to prepare your workspace.


