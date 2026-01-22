---
sidebar_position: 1
title: CAD Downloads
---

import { ModelViewer } from '@site/src/components/ModelViewer';

# CAD Downloads

Download all files needed to build your Replicant GEN 1 drone platform.

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

## 3D Model Files

Complete model files for printing and CAD modification.

### Pre-configured 3MF Files
For optimized Bambu Studio printing with correct orientation, supports, and settings, see the [3D Printing section](/docs/3d-printing#3mf-files--print-previews).

### STEP Files (Editable CAD)
Full parametric models for CAD modification and custom adaptations.

#### Complete Assembly

| Component | Description | Download |
|-----------|-------------|----------|
| **Complete Assembly** | Full drone assembly with all components | [Download STEP](/files/STEP_Files/Replicant_gen1.stp) |

#### Sub-Components

| Component | Description | Download |
|-----------|-------------|----------|
| **Chassis Core Left USB** | Main structural chassis component - USB on left | [Download STEP](/files/STEP_Files/chassis_core_left_usb.stp) |
| **Chassis Core Right USB** | Main structural chassis component - USB on right | [Download STEP](/files/STEP_Files/chassis_core_right_usb.stp) |
| **Motor Mount** | High-strength motor mounting bracket | [Download STEP](/files/STEP_Files/Motor_mount.stp) |
| **Front Left Arm Boss** | Precision mounting interface for front left arm | [Download STEP](/files/STEP_Files/Left_front_arm_boss.stp) |
| **Front Right Arm Boss** | Precision mounting interface for front right arm | [Download STEP](/files/STEP_Files/right_front_arm_boss.stp) |
| **Rear Left Arm Boss** | Precision mounting interface for rear left arm | [Download STEP](/files/STEP_Files/left_rear_arm_boss.stp) |
| **Rear Right Arm Boss** | Precision mounting interface for rear right arm | [Download STEP](/files/STEP_Files/Righ_rear_arm_boss.stp) |
| **Upper Shell** | Top cover and enclosure component | [Download STEP](/files/STEP_Files/upper_shell.stp) |
| **04cm Component** | 04 Pro camera mounting component | [Download STEP](/files/STEP_Files/04cm.stp) |
| **Exo Spine** | External structural spine/frame component | [Download STEP](/files/STEP_Files/Exo_spine.stp) |
| **Top Plate** | Upper mounting plate component | [Download STEP](/files/STEP_Files/top_plate.stp) |
| **Bottom Plate** | Lower mounting plate component | [Download STEP](/files/STEP_Files/bottom_plate.stp) |
| **Battery Rail Male** | Battery mounting rail component | [Download STEP](/files/STEP_Files/battery_rail_male.stp) |

---

## STL Files

Mesh files for 3D printing with any slicer software.

| Component | Description | Download |
|-----------|-------------|----------|
| **Complete Assembly** | Full drone assembly mesh | [Download STL](/files/STL_Files/replicant_gen1.stl) |
| **Complete Assembly (ZIP)** | All STL files in a compressed archive | [Download ZIP](/files/3d-printing/stl/replicant_gen1_complete.zip) |

---

## 3MF Files (Bambu Studio Optimized)

Pre-configured Bambu Studio files with optimal print settings, supports, and orientations.

| Component | Description | Download |
|-----------|-------------|----------|
| **Chassis Core (Left USB)** | Main structural component - USB port on left | [Download 3MF](/files/3d-printing/3mf/Chassis_core_left_usb_modi.gcode.3mf) |
| **Chassis Core (Right USB)** | Main structural component - USB port on right | [Download 3MF](/files/3d-printing/3mf/Chassis_core_right_USB_modi.gcode.3mf) |
| **Arm Bosses** | All four arm mounting interfaces | [Download 3MF](/files/3d-printing/3mf/Arm_bosses.gcode.3mf) |
| **Motor Mounts** | High-strength motor mounting brackets | [Download 3MF](/files/3d-printing/3mf/Motor_mounts.gcode.3mf) |
| **Nose Cone 04 Mount** | Camera and antenna mounting component | [Download 3MF](/files/3d-printing/3mf/Nose_cone_04_mount.gcode.3mf) |
| **Battery Rail Male** | Battery mounting rail component | [Download 3MF](/files/3d-printing/3mf/Battery_rail_male.gcode.3mf) |

---

## Documentation

Technical specifications and material data sheets.

| Document | Description | Download |
|----------|-------------|----------|
| **CF-Nylon Technical Data Sheet** | Material specifications for carbon fiber reinforced nylon | [Download PDF](/files/PDF's/TDS_FIBERON-PA6-CF20_V1.1_EN.pdf) |

---

## Print Requirements

All structural parts require **CF-Nylon** (carbon fiber reinforced nylon).

**Print Order:**
1. **Arm Bosses** - Start with these
2. **Motor Mounts** - Print next
3. **Assemble and bond the arms** while Chassis Core is printing
4. **Battery Rails** - Print last (CF-Nylon)
5. **Nose Cone** - TPE (flexible) - Change to 0.6mm nozzle

:::warning Nylon Must Be Dry
Wet nylon = weak parts. See [3D Printing Guide](/docs/3d-printing) before printing.
:::

---

## Next Steps

1. [Parts List](/docs/bom) - Get electronics and carbon fiber
2. [3D Printing](/docs/3d-printing) - Proper material handling
3. [Arm Bonding](/docs/arm-bonding) - Start assembly

