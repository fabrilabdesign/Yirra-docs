# Replicant GEN 1 3D Printing Files

This directory contains all the 3D printing files for the Replicant GEN 1 (IC-01) modular drone platform.

## Directory Structure

```
3d-printing/
├── 3mf/                    # 3MF slicer project files (.3mf; authored in Bambu Studio, import elsewhere as needed)
│   ├── chassis_core.3mf    # Core structural components
│   ├── battery_rail.3mf    # Battery rail system
│   ├── motor_mounts_arm_bosses.3mf  # Motor mounts and arm bosses
│   └── nose_cone.3mf       # Nose cone and aerodynamics
├── stl/                    # Universal STL files
│   ├── replicant_gen1_complete.zip  # Complete STL package
│   └── [individual STL files will be added here]
└── README.md              # This file
```

## File Formats

### 3MF Files (.3mf)
- Include pre-configured print settings, supports, and orientations (created in Bambu Studio)
- Open in Bambu Studio, or import into PrusaSlicer, OrcaSlicer, or compatible slicers and map to your printer

### STL Files (.stl)
- Universal format compatible with all slicers
- Cura, PrusaSlicer, Simplify3D, etc.
- Manual configuration required

## Components Included

### Chassis Core
- Exospine (main structural frame)
- Rail blocks for battery system
- GPS mast mounting points

### Battery Rail System
- Rail channels for hot-swap batteries
- Latch mechanisms
- Mounting hardware

### Motor Mounts & Arm Bosses
- 4x motor mounts (2328 stator compatible)
- 4x arm bosses (11mm tube diameter)
- Carbon fiber tube interfaces

### Nose Cone & Aerodynamics
- Aerodynamic nose cone
- Camera isolation mount
- Vibration dampening features

## Printing Requirements

- **Build Volume**: Minimum 220 x 220 x 250mm
- **Materials**: PA-CF/Nylon (structural), TPU/TPE (flexible parts)
- **Printer**: Any FDM printer capable of the above materials

## Usage

1. Download the appropriate files for your setup
2. Use .3mf files in your slicer (see main docs: Prusa CORE One+ recommended for new purchases; 3MF import notes)
3. Import STL files into your preferred slicer
4. Follow the printing guide specifications
5. Post-process parts according to the documentation

## Support

For printing issues or questions, refer to the [3D Printing Guide](/docs/build-guides/printing) in the documentation.
