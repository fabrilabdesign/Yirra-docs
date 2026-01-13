---
sidebar_position: 1
title: CAD Downloads
---

import { ModelViewer } from '@site/src/components/ModelViewer';

# Downloads

All files needed to build the Replicant GEN 1.

<ModelViewer
  modelPath="/files/3d-models/Replicant_Gen1.glb"
  title="Replicant GEN 1"
  description="Complete drone assembly"
  height="450px"
  showWireframeToggle={true}
  showFullscreenToggle={true}
  autoRotate={true}
/>

---

## 3MF Files (Recommended)

Pre-configured for Bambu Studio with correct orientation, supports, and settings.

| Part | Download |
|------|----------|
| Chassis Core | [Download 3MF](/files/3d-printing/3mf/Chassis_core.3mf) |
| Motor Mounts & Arm Bosses | [Download 3MF](/files/3d-printing/3mf/Motor_mounts_arm_bosses.3mf) |
| Battery Rails | [Download 3MF](/files/3d-printing/3mf/Battery_mounting_rail.3mf) |
| Nose Cone (O4 Mount) | [Download 3MF](/files/3d-printing/3mf/Nose cone 04 mount.3mf) |

---

## 3D Model Files

Complete model files for printing and CAD modification.

| Format | Use Case | Download |
|--------|----------|----------|
| **STL** | Universal - any slicer | [Download STL (47MB)](/files/STL_Files/replicant_gen1.stl) |
| **STEP** | CAD modification - editable geometry | [Download STEP](/files/STEP_Files/Replicant_gen1.stp) |
| **GLB** | Web viewing - 3D preview | Interactive model above |

---

## Print Requirements

All structural parts require **CF-Nylon** (carbon fiber reinforced nylon).

- **Chassis Core** - Print first
- **Motor Mounts** - Print first  
- **Arm Bosses** - Print first
- **Battery Rails** - CF-Nylon
- **Nose Cone** - TPE (flexible)

:::warning Nylon Must Be Dry
Wet nylon = weak parts. See [Nylon Printing Guide](/docs/nylon-printing) before printing.
:::

---

## Next Steps

1. [Parts List](/docs/bom) - Get electronics and carbon fiber
2. [3D Printing](/docs/nylon-printing) - Proper material handling
3. [Arm Bonding](/docs/arm-bonding) - Start assembly

